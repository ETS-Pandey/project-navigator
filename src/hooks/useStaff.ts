import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import type { StaffMember, StaffFormData, StaffFilters, AppRole, BranchAccess } from "@/types/staff";

// Fetch all staff members with their roles and branch access
export function useStaff(filters?: StaffFilters) {
  return useQuery({
    queryKey: ["staff", filters],
    queryFn: async () => {
      // Fetch all profiles
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data: profiles, error: profileError } = await query;
      if (profileError) throw profileError;

      // Fetch all user roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      
      if (rolesError) throw rolesError;

      // Fetch all branch access with branch names
      const { data: allBranchAccess, error: branchError } = await supabase
        .from("user_branch_access")
        .select(`
          user_id,
          branch_id,
          is_primary,
          branches(name)
        `);
      
      if (branchError) throw branchError;

      // Map profiles to staff members
      const staffMembers: StaffMember[] = profiles.map(profile => {
        const userRoles = allRoles
          .filter(r => r.user_id === profile.user_id)
          .map(r => r.role as AppRole);

        const branchAccess: BranchAccess[] = allBranchAccess
          .filter(ba => ba.user_id === profile.user_id)
          .map(ba => ({
            branch_id: ba.branch_id,
            branch_name: (ba.branches as { name: string } | null)?.name || "Unknown",
            is_primary: ba.is_primary,
          }));

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          roles: userRoles,
          branch_access: branchAccess,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          is_active: true, // Could add is_active column to profiles if needed
        };
      });

      // Apply filters
      let filtered = staffMembers;

      if (filters?.role) {
        filtered = filtered.filter(s => s.roles.includes(filters.role!));
      }

      if (filters?.branchId) {
        filtered = filtered.filter(s => 
          s.branch_access.some(ba => ba.branch_id === filters.branchId)
        );
      }

      return filtered;
    },
  });
}

// Fetch single staff member
export function useStaffMember(userId: string | undefined) {
  return useQuery({
    queryKey: ["staff-member", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const { data: branchAccess } = await supabase
        .from("user_branch_access")
        .select(`
          branch_id,
          is_primary,
          branches(name)
        `)
        .eq("user_id", userId);

      return {
        ...profile,
        roles: roles?.map(r => r.role as AppRole) || [],
        branch_access: branchAccess?.map(ba => ({
          branch_id: ba.branch_id,
          branch_name: (ba.branches as { name: string } | null)?.name || "Unknown",
          is_primary: ba.is_primary,
        })) || [],
        is_active: true,
      } as StaffMember;
    },
    enabled: !!userId,
  });
}

// Update staff roles
export function useUpdateStaffRoles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: AppRole[] }) => {
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (roles.length > 0) {
        const roleInserts = roles.map(role => ({
          user_id: userId,
          role,
        }));

        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(roleInserts);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff-member"] });
      toast({
        title: "Roles Updated",
        description: "User roles have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update roles",
        variant: "destructive",
      });
    },
  });
}

// Update staff branch access
export function useUpdateStaffBranchAccess() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      branchIds, 
      primaryBranchId 
    }: { 
      userId: string; 
      branchIds: string[]; 
      primaryBranchId?: string;
    }) => {
      // Delete existing branch access
      const { error: deleteError } = await supabase
        .from("user_branch_access")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Insert new branch access
      if (branchIds.length > 0) {
        const branchInserts = branchIds.map(branchId => ({
          user_id: userId,
          branch_id: branchId,
          is_primary: branchId === primaryBranchId,
        }));

        const { error: insertError } = await supabase
          .from("user_branch_access")
          .insert(branchInserts);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff-member"] });
      toast({
        title: "Branch Access Updated",
        description: "User branch access has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch access",
        variant: "destructive",
      });
    },
  });
}

// Update staff profile
export function useUpdateStaffProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: { full_name?: string; phone?: string } 
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staff-member"] });
      toast({
        title: "Profile Updated",
        description: "User profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
}

// Get available roles for assignment (excluding customer)
export function getAssignableRoles(): AppRole[] {
  return [
    "admin",
    "branch_manager",
    "accountant",
    "sales_executive",
    "loan_officer",
    "appraiser",
    "catalog_manager",
    "karigar_admin",
    "auditor",
  ];
}

// Invite/Create new staff member
export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      full_name,
      phone,
      roles,
      branch_ids,
      primary_branch_id,
    }: {
      email: string;
      password: string;
      full_name: string;
      phone?: string;
      roles: AppRole[];
      branch_ids: string[];
      primary_branch_id: string;
    }) => {
      // Create the user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      const userId = authData.user.id;

      // Update profile with phone if provided
      if (phone) {
        await supabase
          .from("profiles")
          .update({ phone })
          .eq("user_id", userId);
      }

      // Insert roles
      if (roles.length > 0) {
        const roleInserts = roles.map((role) => ({
          user_id: userId,
          role,
        }));

        const { error: rolesError } = await supabase
          .from("user_roles")
          .insert(roleInserts);

        if (rolesError) throw rolesError;
      }

      // Insert branch access
      if (branch_ids.length > 0) {
        const branchInserts = branch_ids.map((branchId) => ({
          user_id: userId,
          branch_id: branchId,
          is_primary: branchId === primary_branch_id,
        }));

        const { error: branchError } = await supabase
          .from("user_branch_access")
          .insert(branchInserts);

        if (branchError) throw branchError;
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add staff: ${error.message}`);
    },
  });
}
