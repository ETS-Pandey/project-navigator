import { Outlet, Link, useLocation } from "react-router-dom";
import { Gem, ShoppingCart, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CatalogLayout() {
  const location = useLocation();
  const [cartCount] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/catalog" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Gem className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">JewelPro</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/catalog"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/catalog" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Collections
            </Link>
            <Link
              to="/portal"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith("/portal") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              My Account
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/catalog/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link to="/portal">
              <Button variant="outline" size="sm">
                <Phone className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} JewelPro. All rights reserved.</p>
          <p className="mt-1">Prices are indicative and based on current market rates.</p>
        </div>
      </footer>
    </div>
  );
}
