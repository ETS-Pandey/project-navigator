import { useState, useEffect } from "react";
import { User, Shield, MapPin, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useUpdateStaffRoles,
  useUpdateStaffBranchAccess,
  useUpdateStaffProfile,
  getAssignableRoles,
} from "@/hooks/useStaff";
import { useBranch } from "@/contexts/BranchContext";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type StaffMember, type AppRole } from "@/types/staff";
import { useAuth } from "@/contexts/AuthContext";

interface StaffEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
}

export function StaffEditDialog({ open, onOpenChange, staff }: StaffEditDialogProps) {
  const { user } = useAuth();
  const { branches } = useBranch();
  const updateRoles = useUpdateStaffRoles();
  const updateBranchAccess = useUpdateStaffBranchAccess();
  const updateProfile = useUpdateStaffProfile();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [primaryBranch, setPrimaryBranch] = useState<string>("");

  const assignableRoles = getAssignableRoles();
  const isOwner = staff?.roles.includes("owner");
  const isSelf = staff?.user_id === user?.id;

  useEffect(() => {
    if (staff) {
      setFullName(staff.full_name);
      setPhone(staff.phone || "");
      setSelectedRoles(staff.roles.filter(r => r !== "owner"));
      setSelectedBranches(staff.branch_access.map(ba => ba.branch_id));
      setPrimaryBranch(staff.branch_access.find(ba => ba.is_primary)?.branch_id || "");
    }
  }, [staff]);

  const handleRoleToggle = (role: AppRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleBranchToggle = (branchId: string) => {
    setSelectedBranches(prev => {
      const newBranches = prev.includes(branchId)
        ? prev.filter(b => b !== branchId)
        : [...prev, branchId];
      
      // Update primary if removed
      if (!newBranches.includes(primaryBranch)) {
        setPrimaryBranch(newBranches[0] || "");
      }
      
      return newBranches;
    });
  };

  const handleSaveProfile = async () => {
    if (!staff) return;
    await updateProfile.mutateAsync({
      userId: staff.user_id,
      data: { full_name: fullName, phone: phone || undefined },
    });
  };

  const handleSaveRoles = async () => {
    if (!staff) return;
    const rolesToSave = isOwner ? ["owner" as AppRole, ...selectedRoles] : selectedRoles;
    await updateRoles.mutateAsync({
      userId: staff.user_id,
      roles: rolesToSave,
    });
  };

  const handleSaveBranchAccess = async () => {
    if (!staff) return;
    await updateBranchAccess.mutateAsync({
      userId: staff.user_id,
      branchIds: selectedBranches,
      primaryBranchId: primaryBranch,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={staff.avatar_url || undefined} />
              <AvatarFallback>{getInitials(staff.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <span>{staff.full_name}</span>
              {isOwner && (
                <Badge className="ml-2 bg-purple-100 text-purple-800">Owner</Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>{staff.email}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="mr-2 h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="branches">
              <MapPin className="mr-2 h-4 w-4" />
              Branches
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="profile" className="h-full mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={staff.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <Separator />
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfile.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="h-full mt-4 overflow-hidden">
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-3">
                  {isSelf && (
                    <div className="p-3 rounded-lg bg-yellow-50 text-yellow-800 text-sm">
                      You cannot modify your own roles
                    </div>
                  )}
                  {assignableRoles.map((role) => (
                    <div
                      key={role}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        selectedRoles.includes(role) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <Checkbox
                        id={role}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                        disabled={isSelf}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={role}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {ROLE_LABELS[role]}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {ROLE_DESCRIPTIONS[role]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-4" />
              <Button
                onClick={handleSaveRoles}
                disabled={updateRoles.isPending || isSelf}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateRoles.isPending ? "Saving..." : "Save Roles"}
              </Button>
            </TabsContent>

            <TabsContent value="branches" className="h-full mt-4 overflow-hidden">
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Select which branches this user can access. Admins and owners have access to all branches automatically.
                  </p>
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border ${
                        selectedBranches.includes(branch.id) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <Checkbox
                        id={`branch-${branch.id}`}
                        checked={selectedBranches.includes(branch.id)}
                        onCheckedChange={() => handleBranchToggle(branch.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`branch-${branch.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {branch.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {branch.city}, {branch.state}
                        </p>
                      </div>
                      {selectedBranches.includes(branch.id) && (
                        <Button
                          variant={primaryBranch === branch.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPrimaryBranch(branch.id)}
                        >
                          {primaryBranch === branch.id ? "Primary" : "Set Primary"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Separator className="my-4" />
              <Button
                onClick={handleSaveBranchAccess}
                disabled={updateBranchAccess.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateBranchAccess.isPending ? "Saving..." : "Save Branch Access"}
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
