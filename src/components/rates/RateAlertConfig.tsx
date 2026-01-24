import { useState } from "react";
import { useRateAlertConfigs } from "@/hooks/useLiveRates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Save } from "lucide-react";

interface AlertConfigFormData {
  gold: { threshold: number; enabled: boolean };
  silver: { threshold: number; enabled: boolean };
  platinum: { threshold: number; enabled: boolean };
}

export function RateAlertConfig() {
  const { configs, isLoading, upsertConfig } = useRateAlertConfigs();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<AlertConfigFormData>(() => {
    const goldConfig = configs.find((c) => c.metal_type === "gold");
    const silverConfig = configs.find((c) => c.metal_type === "silver");
    const platinumConfig = configs.find((c) => c.metal_type === "platinum");

    return {
      gold: {
        threshold: goldConfig?.alert_threshold_percent || 1.0,
        enabled: goldConfig?.is_enabled ?? true,
      },
      silver: {
        threshold: silverConfig?.alert_threshold_percent || 2.0,
        enabled: silverConfig?.is_enabled ?? true,
      },
      platinum: {
        threshold: platinumConfig?.alert_threshold_percent || 1.5,
        enabled: platinumConfig?.is_enabled ?? false,
      },
    };
  });

  // Update form data when configs load
  useState(() => {
    if (configs.length > 0) {
      const goldConfig = configs.find((c) => c.metal_type === "gold");
      const silverConfig = configs.find((c) => c.metal_type === "silver");
      const platinumConfig = configs.find((c) => c.metal_type === "platinum");

      setFormData({
        gold: {
          threshold: goldConfig?.alert_threshold_percent || 1.0,
          enabled: goldConfig?.is_enabled ?? true,
        },
        silver: {
          threshold: silverConfig?.alert_threshold_percent || 2.0,
          enabled: silverConfig?.is_enabled ?? true,
        },
        platinum: {
          threshold: platinumConfig?.alert_threshold_percent || 1.5,
          enabled: platinumConfig?.is_enabled ?? false,
        },
      });
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        upsertConfig("gold", formData.gold.threshold, formData.gold.enabled),
        upsertConfig("silver", formData.silver.threshold, formData.silver.enabled),
        upsertConfig("platinum", formData.platinum.threshold, formData.platinum.enabled),
      ]);

      toast({
        title: "Alert Settings Saved",
        description: "Your rate alert configurations have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save alert settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Rate Alert Configuration
        </CardTitle>
        <CardDescription>
          Get notified when live market rates change by a specified percentage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Gold Alert */}
          <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-amber-700">Gold</h4>
              <Switch
                checked={formData.gold.enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    gold: { ...prev.gold, enabled: checked },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gold-threshold" className="text-sm">
                Threshold (%)
              </Label>
              <Input
                id="gold-threshold"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={formData.gold.threshold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gold: { ...prev.gold, threshold: parseFloat(e.target.value) || 0 },
                  }))
                }
                disabled={!formData.gold.enabled}
              />
              <p className="text-xs text-muted-foreground">
                Alert when gold changes by {formData.gold.threshold}% or more
              </p>
            </div>
          </div>

          {/* Silver Alert */}
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-700">Silver</h4>
              <Switch
                checked={formData.silver.enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    silver: { ...prev.silver, enabled: checked },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="silver-threshold" className="text-sm">
                Threshold (%)
              </Label>
              <Input
                id="silver-threshold"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={formData.silver.threshold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    silver: { ...prev.silver, threshold: parseFloat(e.target.value) || 0 },
                  }))
                }
                disabled={!formData.silver.enabled}
              />
              <p className="text-xs text-muted-foreground">
                Alert when silver changes by {formData.silver.threshold}% or more
              </p>
            </div>
          </div>

          {/* Platinum Alert */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Platinum</h4>
              <Switch
                checked={formData.platinum.enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    platinum: { ...prev.platinum, enabled: checked },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platinum-threshold" className="text-sm">
                Threshold (%)
              </Label>
              <Input
                id="platinum-threshold"
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                value={formData.platinum.threshold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    platinum: { ...prev.platinum, threshold: parseFloat(e.target.value) || 0 },
                  }))
                }
                disabled={!formData.platinum.enabled}
              />
              <p className="text-xs text-muted-foreground">
                Alert when platinum changes by {formData.platinum.threshold}% or more
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Alert Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
