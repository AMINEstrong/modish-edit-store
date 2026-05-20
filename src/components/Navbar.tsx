import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, Menu, X, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const navigate = useNavigate();
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const runSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;
    navigate({ to: "/search", search: { q } });
    setSearchOpen(false);
    setOpen(false);
    setSearchTerm("");
  };

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
          <Link
            to="/homme"
            className="label-eyebrow hover:opacity-60 transition-opacity"
            activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}
          >
            Homme
          </Link>
          <Link
            to="/femme"
            className="label-eyebrow hover:opacity-60 transition-opacity"
            activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}
          >
            Femme
          </Link>
          {isAdmin && (
            <>
              <Link
                to="/admin/products"
                className="label-eyebrow hover:opacity-60 transition-opacity"
                activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}
              >
                Produits
              </Link>
              <Link
                to="/admin/settings"
                className="label-eyebrow hover:opacity-60 transition-opacity"
                activeProps={{ className: "label-eyebrow opacity-100 underline underline-offset-8" }}
              >
                Paramètres
              </Link>
            </>
          )}
        </nav>

        <Link to="/" className="font-serif text-2xl tracking-tight">
          SLISTYLE
        </Link>

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Changer le thème"
            onClick={toggleTheme}
            className="transition-colors hover:text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button
            type="button"
            aria-label="Rechercher"
            className="hidden md:inline hover:text-muted-foreground transition-colors"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link to={user ? "/account" : "/auth"} aria-label="Account" className="hover:text-muted-foreground transition-colors">
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

      {searchOpen && (
        <div className="hidden border-t border-border md:block">
          <form onSubmit={runSearch} className="mx-auto flex max-w-7xl gap-2 px-6 py-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un article…"
              className="flex-1 border border-border bg-background px-4 py-2 text-sm outline-none focus:border-foreground"
              autoFocus
            />
            <button type="submit" className="label-eyebrow bg-foreground px-5 py-2 text-background">
              Chercher
            </button>
          </form>
        </div>
      )}

      {open && (
        <div className="border-t border-border md:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            <form onSubmit={runSearch} className="flex gap-2">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher…"
                className="flex-1 border border-border bg-background px-3 py-2 text-sm outline-none"
              />
              <button type="submit" aria-label="Chercher">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link to="/homme" onClick={() => setOpen(false)} className="label-eyebrow">
              Homme
            </Link>
            <Link to="/femme" onClick={() => setOpen(false)} className="label-eyebrow">
              Femme
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/products" onClick={() => setOpen(false)} className="label-eyebrow">
                  Admin Produits
                </Link>
                <Link to="/admin/settings" onClick={() => setOpen(false)} className="label-eyebrow">
                  Admin Paramètres
                </Link>
              </>
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

