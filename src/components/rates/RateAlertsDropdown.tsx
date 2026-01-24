import { Bell, TrendingUp, TrendingDown, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRateAlerts } from "@/hooks/useLiveRates";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RateAlertsDropdown() {
  const { alerts, unreadCount, markAsRead, markAllAsRead } = useRateAlerts();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Rate Alerts</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No rate alerts yet
            </div>
          ) : (
            alerts.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !alert.is_read && "bg-primary/5"
                )}
                onClick={() => !alert.is_read && markAsRead(alert.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-full",
                      alert.change_percent > 0
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    )}
                  >
                    {alert.change_percent > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {alert.metal_type} {alert.change_percent > 0 ? "Up" : "Down"}{" "}
                      <span
                        className={cn(
                          alert.change_percent > 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {Math.abs(alert.change_percent).toFixed(2)}%
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(alert.previous_rate)} → {formatCurrency(alert.current_rate)}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <Badge variant="secondary" className="text-[10px] h-4">
                      New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pl-10">
                  {formatRelativeTime(alert.created_at)}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
