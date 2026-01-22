import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBranch } from "@/contexts/BranchContext";
import { getAssignableRoles, useInviteStaff } from "@/hooks/useStaff";
import { ROLE_LABELS, type AppRole } from "@/types/staff";

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
  branch_ids: z.array(z.string()).min(1, "Select at least one branch"),
  primary_branch_id: z.string().min(1, "Select a primary branch"),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;

interface StaffInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffInviteDialog({ open, onOpenChange }: StaffInviteDialogProps) {
  const { branches } = useBranch();
  const inviteStaff = useInviteStaff();
  const assignableRoles = getAssignableRoles();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      password: "",
      roles: [],
      branch_ids: [],
      primary_branch_id: "",
    },
  });

  const selectedRoles = watch("roles");
  const selectedBranches = watch("branch_ids");
  const primaryBranch = watch("primary_branch_id");

  const handleRoleToggle = (role: string) => {
    const current = selectedRoles || [];
    if (current.includes(role)) {
      setValue("roles", current.filter((r) => r !== role));
    } else {
      setValue("roles", [...current, role]);
    }
  };

  const handleBranchToggle = (branchId: string) => {
    const current = selectedBranches || [];
    if (current.includes(branchId)) {
      const newBranches = current.filter((b) => b !== branchId);
      setValue("branch_ids", newBranches);
      // Clear primary if removed
      if (primaryBranch === branchId) {
        setValue("primary_branch_id", newBranches[0] || "");
      }
    } else {
      const newBranches = [...current, branchId];
      setValue("branch_ids", newBranches);
      // Set as primary if first branch
      if (newBranches.length === 1) {
        setValue("primary_branch_id", branchId);
      }
    }
  };

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteStaff.mutateAsync({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        roles: data.roles as AppRole[],
        branch_ids: data.branch_ids,
        primary_branch_id: data.primary_branch_id,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            Create a new staff account with roles and branch access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Roles */}
          <div>
            <Label className="mb-2 block">Roles *</Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted/30">
              {assignableRoles.map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={selectedRoles?.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <Label htmlFor={`role-${role}`} className="text-sm font-normal cursor-pointer">
                    {ROLE_LABELS[role]}
                  </Label>
                </div>
              ))}
            </div>
            {errors.roles && (
              <p className="text-sm text-destructive mt-1">{errors.roles.message}</p>
            )}
          </div>

          {/* Branch Access */}
          <div>
            <Label className="mb-2 block">Branch Access *</Label>
            <div className="space-y-2 p-3 border rounded-md bg-muted/30">
              {branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`branch-${branch.id}`}
                      checked={selectedBranches?.includes(branch.id)}
                      onCheckedChange={() => handleBranchToggle(branch.id)}
                    />
                    <Label htmlFor={`branch-${branch.id}`} className="text-sm font-normal cursor-pointer">
                      {branch.name}
                      {branch.is_main_branch && " (Main)"}
                    </Label>
                  </div>
                  {selectedBranches?.includes(branch.id) && (
                    <Button
                      type="button"
                      variant={primaryBranch === branch.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setValue("primary_branch_id", branch.id)}
                    >
                      {primaryBranch === branch.id ? "Primary" : "Set Primary"}
                    </Button>
                  )}
                </div>
              ))}
              {branches.length === 0 && (
                <p className="text-sm text-muted-foreground">No branches available</p>
              )}
            </div>
            {errors.branch_ids && (
              <p className="text-sm text-destructive mt-1">{errors.branch_ids.message}</p>
            )}
            {errors.primary_branch_id && (
              <p className="text-sm text-destructive mt-1">{errors.primary_branch_id.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || inviteStaff.isPending}>
              {(isSubmitting || inviteStaff.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
