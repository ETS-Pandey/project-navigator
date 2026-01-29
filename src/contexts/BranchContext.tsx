import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

const BRANCH_STORAGE_KEY = "jewelpro_current_branch_id";

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
  const [currentBranch, setCurrentBranchState] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to set current branch and persist to localStorage
  const setCurrentBranch = useCallback((branch: Branch) => {
    setCurrentBranchState(branch);
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, branch.id);
    } catch (e) {
      console.error("Failed to save branch to localStorage:", e);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    if (!user) {
      setBranches([]);
      setCurrentBranchState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      let fetchedBranches: Branch[] = [];

      // Owners and admins can see all branches
      if (hasAnyRole(["owner", "admin"])) {
        const { data } = await supabase
          .from("branches")
          .select("*")
          .eq("is_active", true)
          .order("is_main_branch", { ascending: false })
          .order("name");

        if (data) {
          fetchedBranches = data as Branch[];
        }
      } else {
        // Other users see only their assigned branches
        const { data: accessData } = await supabase
          .from("user_branch_access")
          .select("branch_id, is_primary, branches(*)")
          .eq("user_id", user.id);

        if (accessData) {
          fetchedBranches = accessData
            .map((a) => a.branches as Branch | null)
            .filter((b): b is Branch => b !== null && b.is_active);
        }
      }

      setBranches(fetchedBranches);

      if (fetchedBranches.length > 0) {
        // Try to restore from localStorage
        let restoredBranch: Branch | null = null;
        try {
          const savedBranchId = localStorage.getItem(BRANCH_STORAGE_KEY);
          if (savedBranchId) {
            restoredBranch = fetchedBranches.find(b => b.id === savedBranchId) || null;
          }
        } catch (e) {
          console.error("Failed to read branch from localStorage:", e);
        }

        if (restoredBranch) {
          setCurrentBranchState(restoredBranch);
        } else {
          // Fallback: Set main branch or first branch as default
          const mainBranch = fetchedBranches.find((b) => b.is_main_branch) || fetchedBranches[0];
          setCurrentBranch(mainBranch);
        }
      } else {
        setCurrentBranchState(null);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, hasAnyRole, setCurrentBranch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

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
