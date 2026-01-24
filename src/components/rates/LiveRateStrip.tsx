import { useLiveRates } from "@/hooks/useLiveRates";
import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function LiveRateStrip() {
  const { liveRates, isLoading, refreshLiveRates } = useLiveRates();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLiveRates();
    } catch (error) {
      console.error("Failed to refresh rates:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!liveRates) {
    return (
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Live rates unavailable</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4 text-sm">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <Wifi className="h-3.5 w-3.5 text-green-500" />
            <span className="text-muted-foreground">Gold 24K:</span>
            <span className="font-semibold text-amber-600">
              {formatCurrency(liveRates.gold_rate_inr)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Live international gold rate (24K)</p>
          {liveRates.gold_rate_usd && (
            <p className="text-xs text-muted-foreground">
              ${liveRates.gold_rate_usd.toFixed(2)} USD/gram
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <span className="text-muted-foreground">Silver:</span>
            <span className="font-medium text-slate-600">
              {formatCurrency(liveRates.silver_rate_inr)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Live international silver rate (999)</p>
          {liveRates.silver_rate_usd && (
            <p className="text-xs text-muted-foreground">
              ${liveRates.silver_rate_usd.toFixed(2)} USD/gram
            </p>
          )}
        </TooltipContent>
      </Tooltip>

      <Badge variant="outline" className="text-xs gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
        Live • {formatRelativeTime(liveRates.fetched_at)}
      </Badge>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleRefresh}
        disabled={isRefreshing || isLoading}
      >
        <RefreshCw className={cn("h-3.5 w-3.5", (isRefreshing || isLoading) && "animate-spin")} />
      </Button>
    </div>
  );
}
