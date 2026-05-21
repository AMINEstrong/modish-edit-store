import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="font-serif text-3xl tracking-wide font-medium">
            <span className="text-foreground">SLI</span>
            <span style={{ color: "#c5a880" }}>STYLE</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Considered clothing for considered lives.
          </p>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Shop</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/homme" className="hover:underline">Homme</Link></li>
            <li><Link to="/femme" className="hover:underline">Femme</Link></li>
            <li><Link to="/wishlist" className="hover:underline">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Service</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Shipping & returns</li>
            <li>Size guide</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Social</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground hover:underline">Instagram</a></li>
            <li><a href="#" className="hover:text-foreground hover:underline">TikTok</a></li>
            <li><a href="#" className="hover:text-foreground hover:underline">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <p className="label-eyebrow mb-4">Newsletter</p>
          <p className="text-sm text-muted-foreground">
            Studio notes and first looks, monthly.
          </p>
          <form className="mt-3 flex border-b border-foreground">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="label-eyebrow">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Slistyle. All rights reserved.</p>
          <p>Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}
