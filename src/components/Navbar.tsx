import { Link } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden gap-8 md:flex">
          <Link to="/homme" className="label-eyebrow hover:opacity-60 transition-opacity"
            activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}>
            Homme
          </Link>
          <Link to="/femme" className="label-eyebrow hover:opacity-60 transition-opacity"
            activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}>
            Femme
          </Link>
          {isAdmin && (
            <Link to="/admin/products" className="label-eyebrow hover:opacity-60 transition-opacity"
              activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}>
              Admin
            </Link>
          )}
        </nav>

        <Link to="/" className="font-serif text-2xl tracking-tight">MAISON</Link>

        <div className="flex items-center gap-5">
          <button aria-label="Search" className="hidden md:inline">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link to={user ? "/account" : "/auth"} aria-label="Account">
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative">
            <Heart className="h-[18px] w-[18px]" />
            {wishCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] text-background">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] text-background">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            <Link to="/homme" onClick={() => setOpen(false)} className="label-eyebrow">Homme</Link>
            <Link to="/femme" onClick={() => setOpen(false)} className="label-eyebrow">Femme</Link>
            {isAdmin && (
              <Link to="/admin/products" onClick={() => setOpen(false)} className="label-eyebrow">Admin</Link>
            )}
            <Link to={user ? "/account" : "/auth"} onClick={() => setOpen(false)} className="label-eyebrow">
              {user ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
