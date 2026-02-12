import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Phone, ArrowRight, Shield, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCustomerPortalAuth } from "@/hooks/useCustomerPortal";
import { useToast } from "@/hooks/use-toast";

export default function PortalLogin() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { requestOtp, verifyOtp, isAuthenticated } = useCustomerPortalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already authenticated, redirect
  if (isAuthenticated) {
    navigate("/portal/dashboard", { replace: true });
    return null;
  }

  const handleRequestOtp = async () => {
    if (phone.length < 10) {
      toast({ title: "Enter a valid phone number", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await requestOtp(phone);
      if (result?.success) {
        setStep("otp");
        toast({ title: "OTP sent!", description: "Check your phone for the verification code." });
      }
    } catch {
      // handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return;
    setIsLoading(true);
    try {
      const result = await verifyOtp(phone, otp);
      if (result?.success) {
        navigate("/portal/dashboard", { replace: true });
      } else {
        toast({ title: "Invalid OTP", description: "Please check and try again.", variant: "destructive" });
      }
    } catch {
      // handled in hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/catalog" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Gem className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">JewelPro</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Customer Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {step === "phone" ? "Login with Phone" : "Verify OTP"}
            </CardTitle>
            <CardDescription>
              {step === "phone"
                ? "Enter your registered phone number to receive an OTP"
                : `Enter the OTP sent to ${phone}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "phone" ? (
              <>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="pl-10"
                      maxLength={15}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleRequestOtp}
                  disabled={isLoading}
                  className="w-full gold-gradient text-primary-foreground"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length < 4}
                  className="w-full gold-gradient text-primary-foreground"
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => { setStep("phone"); setOtp(""); }}>
                  Change phone number
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your phone number must be registered with our store.
        </p>
      </div>
    </div>
  );
}
