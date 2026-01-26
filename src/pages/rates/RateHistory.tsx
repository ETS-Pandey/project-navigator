import { useEffect, useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Download, FileSpreadsheet, History, TrendingUp, TrendingDown } from "lucide-react";
import { useRateHistory, RateHistoryRecord } from "@/hooks/useRateHistory";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DatePreset = "7days" | "30days" | "thisMonth" | "lastMonth" | "custom";

export default function RateHistory() {
  const { rates, isLoading, fetchRateHistory, exportToCSV } = useRateHistory();
  const [datePreset, setDatePreset] = useState<DatePreset>("30days");
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchRateHistory(startDate, endDate);
  }, [fetchRateHistory, startDate, endDate]);

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();

    switch (preset) {
      case "7days":
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case "30days":
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case "thisMonth":
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case "custom":
        // Keep existing dates for custom
        break;
    }
  };

  const handleExportCSV = () => {
    if (rates.length > 0) {
      exportToCSV(rates);
    }
  };

  const getRateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    return { change, percentChange };
  };

  const renderRateWithChange = (
    currentRate: number | null,
    previousRate: number | null
  ) => {
    if (!currentRate) return <span className="text-muted-foreground">-</span>;

    const rateChange = getRateChange(currentRate, previousRate);

    return (
      <div className="flex items-center gap-1">
        <span>{formatCurrency(currentRate)}</span>
        {rateChange && rateChange.change !== 0 && (
          <span
            className={cn(
              "text-xs flex items-center",
              rateChange.change > 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {rateChange.change > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-6 w-6" />
            Rate History
          </h1>
          <p className="text-muted-foreground">
            View and export historical daily rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={rates.length === 0}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Date</CardTitle>
          <CardDescription>
            Select a date range to view historical rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={datePreset}
              onValueChange={(value) => handlePresetChange(value as DatePreset)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {datePreset === "custom" && (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[140px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Badge variant="secondary" className="h-9 px-3">
              {rates.length} record{rates.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Rates</CardTitle>
          <CardDescription>
            Historical gold, silver, and platinum rates per gram
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No rate history found for the selected date range</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background">Date</TableHead>
                    <TableHead>Gold 24K Buy</TableHead>
                    <TableHead>Gold 24K Sell</TableHead>
                    <TableHead>Gold 22K Buy</TableHead>
                    <TableHead>Gold 22K Sell</TableHead>
                    <TableHead>Silver 999 Buy</TableHead>
                    <TableHead>Silver 999 Sell</TableHead>
                    <TableHead>Platinum Buy</TableHead>
                    <TableHead>Platinum Sell</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate, index) => {
                    const previousRate = rates[index + 1];
                    return (
                      <TableRow key={rate.id}>
                        <TableCell className="sticky left-0 bg-background font-medium">
                          {formatDate(rate.rate_date)}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.gold_24k_buy,
                            previousRate?.gold_24k_buy
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.gold_24k_sell,
                            previousRate?.gold_24k_sell
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.gold_22k_buy,
                            previousRate?.gold_22k_buy
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.gold_22k_sell,
                            previousRate?.gold_22k_sell
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.silver_999_buy,
                            previousRate?.silver_999_buy
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.silver_999_sell,
                            previousRate?.silver_999_sell
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.platinum_buy,
                            previousRate?.platinum_buy
                          )}
                        </TableCell>
                        <TableCell>
                          {renderRateWithChange(
                            rate.platinum_sell,
                            previousRate?.platinum_sell
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
