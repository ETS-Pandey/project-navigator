import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SchemeFormData } from "@/types/schemes";

interface SchemeFormProps {
  onSubmit: (data: SchemeFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<SchemeFormData>;
}

export function SchemeForm({ onSubmit, isLoading, defaultValues }: SchemeFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SchemeFormData>({
    defaultValues: {
      scheme_code: "",
      scheme_name: "",
      duration_months: 11,
      monthly_amount: 1000,
      bonus_type: "fixed",
      bonus_value: 0,
      is_gold_scheme: false,
      late_payment_penalty_percent: 0,
      grace_period_days: 7,
      ...defaultValues,
    },
  });

  const isGoldScheme = watch("is_gold_scheme");
  const bonusType = watch("bonus_type");
  const durationMonths = watch("duration_months");
  const monthlyAmount = watch("monthly_amount");

  const totalAmount = (durationMonths || 0) * (monthlyAmount || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="scheme_code">Scheme Code *</Label>
          <Input
            id="scheme_code"
            placeholder="e.g., GOLD11"
            {...register("scheme_code", { required: "Scheme code is required" })}
          />
          {errors.scheme_code && (
            <p className="text-xs text-destructive">{errors.scheme_code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheme_name">Scheme Name *</Label>
          <Input
            id="scheme_name"
            placeholder="e.g., Gold Savings 11 Months"
            {...register("scheme_name", { required: "Scheme name is required" })}
          />
          {errors.scheme_name && (
            <p className="text-xs text-destructive">{errors.scheme_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the scheme benefits..."
          {...register("description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="duration_months">Duration (Months) *</Label>
          <Input
            id="duration_months"
            type="number"
            min={1}
            max={36}
            {...register("duration_months", { 
              required: true, 
              valueAsNumber: true,
              min: 1,
              max: 36 
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_amount">Monthly Amount *</Label>
          <Input
            id="monthly_amount"
            type="number"
            min={100}
            {...register("monthly_amount", { 
              required: true, 
              valueAsNumber: true,
              min: 100 
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Total Amount</Label>
          <div className="flex h-10 items-center rounded-md border bg-muted px-3 font-medium">
            ₹{totalAmount.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-medium">Bonus Configuration</h3>
        
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Bonus Type</Label>
            <Select
              value={bonusType}
              onValueChange={(v) => setValue("bonus_type", v as SchemeFormData["bonus_type"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="gold_bonus">Gold Weight Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus_value">
              Bonus Value {bonusType === "percentage" ? "(%)" : bonusType === "gold_bonus" ? "(grams)" : "(₹)"}
            </Label>
            <Input
              id="bonus_value"
              type="number"
              step={bonusType === "gold_bonus" ? "0.001" : "1"}
              min={0}
              {...register("bonus_value", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus_month">Bonus Month (Optional)</Label>
            <Input
              id="bonus_month"
              type="number"
              min={1}
              max={durationMonths}
              placeholder={`e.g., ${durationMonths + 1}`}
              {...register("bonus_month", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Month when bonus is given free</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-lg border p-4">
        <Switch
          id="is_gold_scheme"
          checked={isGoldScheme}
          onCheckedChange={(checked) => setValue("is_gold_scheme", checked)}
        />
        <div>
          <Label htmlFor="is_gold_scheme" className="cursor-pointer">Gold Scheme</Label>
          <p className="text-sm text-muted-foreground">
            Enable if this scheme offers gold at locked rates
          </p>
        </div>
      </div>

      {isGoldScheme && (
        <div className="space-y-2">
          <Label>Gold Rate Lock Type</Label>
          <Select
            defaultValue="enrollment"
            onValueChange={(v) => setValue("gold_rate_lock_type", v as SchemeFormData["gold_rate_lock_type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enrollment">Lock at Enrollment</SelectItem>
              <SelectItem value="average">Average Rate</SelectItem>
              <SelectItem value="maturity">Rate at Maturity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="late_payment_penalty_percent">Late Payment Penalty (%)</Label>
          <Input
            id="late_payment_penalty_percent"
            type="number"
            step="0.1"
            min={0}
            max={10}
            {...register("late_payment_penalty_percent", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
          <Input
            id="grace_period_days"
            type="number"
            min={0}
            max={30}
            {...register("grace_period_days", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms_conditions">Terms & Conditions</Label>
        <Textarea
          id="terms_conditions"
          rows={4}
          placeholder="Enter scheme terms and conditions..."
          {...register("terms_conditions")}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Scheme"}
        </Button>
      </div>
    </form>
  );
}
