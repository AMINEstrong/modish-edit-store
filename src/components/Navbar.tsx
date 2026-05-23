import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag, Menu, X, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Navbar() {
  const navigate = useNavigate();
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const navLinkClass = "link-nav after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-500 ease-out",
        scrolled
          ? "border-border/80 bg-background/95 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-[4.25rem]">
        <button
          onClick={() => setOpen(!open)}
          className="transition-opacity duration-300 hover:opacity-60 md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden gap-8 md:flex">
          <Link
            to="/homme"
            className={navLinkClass}
            activeProps={{ className: `${navLinkClass} text-gold after:w-full` }}
          >
            Homme
          </Link>
          <Link
            to="/femme"
            className={navLinkClass}
            activeProps={{ className: `${navLinkClass} text-gold after:w-full` }}
          >
            Femme
          </Link>
          {isAdmin && (
            <>
              <Link
                to="/admin/products"
                className={navLinkClass}
                activeProps={{ className: `${navLinkClass} text-gold after:w-full` }}
              >
                Produits
              </Link>
              <Link
                to="/admin/settings"
                className={navLinkClass}
                activeProps={{ className: `${navLinkClass} text-gold after:w-full` }}
              >
                Paramètres
              </Link>
            </>
          )}
        </nav>

        <Link
          to="/"
          className="font-display text-xl tracking-[0.2em] transition-opacity duration-300 hover:opacity-80 md:text-2xl"
        >
          <span className="text-foreground">SLI</span>
          <span className="text-gold">STYLE</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-5">
          <button
            type="button"
            aria-label="Changer le thème"
            onClick={toggleTheme}
            className="rounded-full p-1 transition-all duration-300 hover:text-gold"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button
            type="button"
            aria-label="Rechercher"
            className="hidden rounded-full p-1 transition-all duration-300 hover:text-gold md:inline"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <Link
            to={user ? "/account" : "/auth"}
            aria-label="Account"
            className="rounded-full p-1 transition-all duration-300 hover:text-gold"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative transition-transform duration-300 hover:scale-105">
            <Heart className="h-[18px] w-[18px]" />
            {wishCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ink">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative transition-transform duration-300 hover:scale-105">
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
        <div className="hidden border-t border-border/80 md:block">
          <form onSubmit={runSearch} className="mx-auto flex max-w-7xl gap-2 px-6 py-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un article…"
              className="flex-1 border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors duration-300 focus:border-gold"
              autoFocus
            />
            <button type="submit" className="btn-gold">
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
                className="flex-1 border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <button type="submit" aria-label="Chercher" className="text-gold">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link to="/homme" onClick={() => setOpen(false)} className="link-nav">
              Homme
            </Link>
            <Link to="/femme" onClick={() => setOpen(false)} className="link-nav">
              Femme
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/products" onClick={() => setOpen(false)} className="link-nav">
                  Admin Produits
                </Link>
                <Link to="/admin/settings" onClick={() => setOpen(false)} className="link-nav">
                  Admin Paramètres
                </Link>
              </>
            )}
            <Link to={user ? "/account" : "/auth"} onClick={() => setOpen(false)} className="link-nav">
              {user ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
