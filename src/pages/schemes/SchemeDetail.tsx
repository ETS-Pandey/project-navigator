import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Calendar, IndianRupee, Settings, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useScheme } from "@/hooks/useSchemes";
import { formatCurrency } from "@/lib/formatters";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  discontinued: "bg-red-100 text-red-800",
};

export default function SchemeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: scheme, isLoading, error } = useScheme(id!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold text-muted-foreground">Scheme not found</h2>
        <Button variant="link" onClick={() => navigate("/schemes")}>
          Back to Schemes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/schemes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{scheme.scheme_name}</h1>
              <Badge className={statusColors[scheme.status]}>{scheme.status}</Badge>
            </div>
            <p className="text-muted-foreground">{scheme.scheme_code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/schemes/enrollments?scheme=${id}`)}>
            <Users className="mr-2 h-4 w-4" />
            View Enrollments
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Scheme
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{scheme.duration_months} months</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm">Monthly Amount</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(scheme.monthly_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm">Total Amount</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-primary">{formatCurrency(scheme.total_amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">Enrollments</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{scheme.enrollments_count || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheme Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Scheme Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bonus Type</p>
                <p className="font-medium capitalize">{scheme.bonus_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bonus Value</p>
                <p className="font-medium">
                  {scheme.bonus_type === 'fixed' && formatCurrency(scheme.bonus_value)}
                  {scheme.bonus_type === 'percentage' && `${scheme.bonus_value}%`}
                  {scheme.bonus_type === 'gold_bonus' && `${scheme.bonus_value}g gold`}
                </p>
              </div>
              {scheme.bonus_month && (
                <div>
                  <p className="text-sm text-muted-foreground">Bonus Month</p>
                  <p className="font-medium">Month {scheme.bonus_month}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Gold Scheme</p>
                <p className="font-medium">{scheme.is_gold_scheme ? 'Yes' : 'No'}</p>
              </div>
              {scheme.is_gold_scheme && scheme.gold_rate_lock_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Rate Lock Type</p>
                  <p className="font-medium capitalize">{scheme.gold_rate_lock_type}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penalty & Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Late Payment Penalty</p>
                <p className="font-medium">{scheme.late_payment_penalty_percent}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grace Period</p>
                <p className="font-medium">{scheme.grace_period_days} days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Min Enrollments</p>
                <p className="font-medium">{scheme.min_enrollments}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Enrollments</p>
                <p className="font-medium">{scheme.max_enrollments || 'Unlimited'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description & Terms */}
      {(scheme.description || scheme.terms_conditions) && (
        <Card>
          <CardHeader>
            <CardTitle>Description & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheme.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="mt-1">{scheme.description}</p>
              </div>
            )}
            {scheme.terms_conditions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terms & Conditions</p>
                <p className="mt-1 whitespace-pre-wrap">{scheme.terms_conditions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
