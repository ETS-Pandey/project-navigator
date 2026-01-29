import { LogOut, User, Building2, ChevronDown, Check, Store } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { LiveRateStrip } from "@/components/rates/LiveRateStrip";
import { RateAlertsDropdown } from "@/components/rates/RateAlertsDropdown";
import { Skeleton } from "@/components/ui/skeleton";

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const { branches, currentBranch, setCurrentBranch, isLoading: branchLoading } = useBranch();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger className="-ml-2" />

      {/* Live Rate Strip */}
      <LiveRateStrip />

      <div className="flex-1" />

      {/* Branch Selector */}
      {branchLoading ? (
        <Skeleton className="h-8 w-32" />
      ) : branches.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
            >
              <Store className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline font-medium">
                {currentBranch?.name || "Select Branch"}
              </span>
              {currentBranch?.code && (
                <Badge variant="secondary" className="hidden md:inline-flex text-xs">
                  {currentBranch.code}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Switch Branch
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => setCurrentBranch(branch)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{branch.name}</span>
                  {branch.city && (
                    <span className="text-xs text-muted-foreground">
                      {branch.city}{branch.state ? `, ${branch.state}` : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {branch.is_main_branch && (
                    <Badge variant="secondary" className="text-xs">
                      Main
                    </Badge>
                  )}
                  {currentBranch?.id === branch.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="text-sm text-muted-foreground">No branches assigned</span>
      )}

      {/* Rate Alerts */}
      <RateAlertsDropdown />

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline">{profile?.full_name}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
