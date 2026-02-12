import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Send, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSubmitInquiry } from "@/hooks/useCatalog";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  estimatedPrice: number;
  weight: number;
  purity: string;
  metalType: string;
}

export default function CatalogCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitInquiry = useSubmitInquiry();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("catalog_cart") || "[]");
    setCart(stored);
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("catalog_cart", JSON.stringify(items));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const removeItem = (productId: string) => {
    updateCart(cart.filter((item) => item.productId !== productId));
  };

  const totalValue = cart.reduce((sum, item) => sum + item.estimatedPrice * item.quantity, 0);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!phone.trim() && !email.trim()) {
      toast({ title: "Please provide phone or email", variant: "destructive" });
      return;
    }

    try {
      // Use first branch available
      const { data: branches } = await (await import("@/integrations/supabase/client")).supabase
        .from("branches")
        .select("id")
        .eq("is_active", true)
        .limit(1);

      const branchId = branches?.[0]?.id;
      if (!branchId) {
        toast({ title: "Store not configured", variant: "destructive" });
        return;
      }

      await submitInquiry.mutateAsync({
        branchId,
        customerName: name,
        customerPhone: phone || undefined,
        customerEmail: email || undefined,
        message: message || undefined,
        items: cart,
      });

      localStorage.removeItem("catalog_cart");
      setSubmitted(true);
    } catch {
      // Error handled in hook
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Send className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Inquiry Submitted!</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Thank you for your interest. Our team will contact you shortly with pricing and availability details.
        </p>
        <Link to="/catalog">
          <Button className="mt-6">Continue Browsing</Button>
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-semibold">Your inquiry cart is empty</h3>
        <p className="text-sm text-muted-foreground">Browse our collection and add items you're interested in</p>
        <Link to="/catalog">
          <Button className="mt-4">Browse Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to collection
      </Link>

      <h1 className="text-2xl font-bold">Inquiry Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="space-y-3 lg:col-span-2">
          {cart.map((item) => (
            <Card key={item.productId}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-semibold">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.purity} {item.metalType} • {item.weight}g
                  </p>
                  <p className="mt-1 font-semibold text-primary">
                    {formatCurrency(item.estimatedPrice)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inquiry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Inquiry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any special requirements..." rows={3} />
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{cart.length} item(s)</span>
              <span className="font-bold">{formatCurrency(totalValue)}</span>
            </div>
            <p className="text-xs text-muted-foreground">* Final price confirmed at store</p>

            <Button
              onClick={handleSubmit}
              disabled={submitInquiry.isPending}
              className="w-full gold-gradient text-primary-foreground"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitInquiry.isPending ? "Submitting..." : "Submit Inquiry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
