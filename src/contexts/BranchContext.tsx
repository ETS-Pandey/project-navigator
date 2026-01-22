import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Branch {
  id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  is_active: boolean;
  is_main_branch: boolean;
}

interface BranchContextType {
  branches: Branch[];
  currentBranch: Branch | null;
  isLoading: boolean;
  setCurrentBranch: (branch: Branch) => void;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { user, hasAnyRole } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranches = async () => {
    if (!user) {
      setBranches([]);
      setCurrentBranch(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Owners and admins can see all branches
      if (hasAnyRole(["owner", "admin"])) {
        const { data } = await supabase
          .from("branches")
          .select("*")
          .eq("is_active", true)
          .order("is_main_branch", { ascending: false })
          .order("name");

        if (data) {
          setBranches(data as Branch[]);
          // Set main branch or first branch as default
          const mainBranch = data.find((b) => b.is_main_branch) || data[0];
          if (mainBranch && !currentBranch) {
            setCurrentBranch(mainBranch as Branch);
          }
        }
      } else {
        // Other users see only their assigned branches
        const { data: accessData } = await supabase
          .from("user_branch_access")
          .select("branch_id, is_primary, branches(*)")
          .eq("user_id", user.id);

        if (accessData) {
          const userBranches = accessData
            .map((a) => a.branches as Branch | null)
            .filter((b): b is Branch => b !== null && b.is_active);
          
          setBranches(userBranches);
          
          // Set primary branch or first branch as default
          const primaryAccess = accessData.find((a) => a.is_primary);
          const primaryBranch = primaryAccess?.branches as Branch | null;
          if (primaryBranch && !currentBranch) {
            setCurrentBranch(primaryBranch);
          } else if (userBranches[0] && !currentBranch) {
            setCurrentBranch(userBranches[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [user]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        currentBranch,
        isLoading,
        setCurrentBranch,
        refreshBranches: fetchBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
