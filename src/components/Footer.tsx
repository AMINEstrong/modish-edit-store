import { Link } from "@tanstack/react-router";
import { ScrollReveal } from "@/components/ScrollReveal";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-5">
        <ScrollReveal className="md:col-span-2">
          <p className="font-display text-3xl tracking-[0.15em]">
            <span className="text-foreground">SLI</span>
            <span className="text-gold">STYLE</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Street luxury for the city. Minimal by design.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <p className="label-eyebrow mb-4 text-gold">Shop</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/homme" className="transition-colors duration-300 hover:text-gold">
                Homme
              </Link>
            </li>
            <li>
              <Link to="/femme" className="transition-colors duration-300 hover:text-gold">
                Femme
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="transition-colors duration-300 hover:text-gold">
                Wishlist
              </Link>
            </li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="label-eyebrow mb-4 text-gold">Service</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Shipping & returns</li>
            <li>Size guide</li>
            <li>Contact</li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className="label-eyebrow mb-4 text-gold">Social</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="transition-colors duration-300 hover:text-gold">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors duration-300 hover:text-gold">
                TikTok
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors duration-300 hover:text-gold">
                WhatsApp
              </a>
            </li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="label-eyebrow mb-4 text-gold">Newsletter</p>
          <p className="text-sm text-muted-foreground">Drops & studio notes, monthly.</p>
          <form className="mt-3 flex border-b border-foreground/30 transition-colors focus-within:border-gold">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="label-eyebrow text-gold transition-opacity hover:opacity-70">
              Join
            </button>
          </form>
        </ScrollReveal>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Slistyle. All rights reserved.</p>
          <p className="text-gold/80">Crafted with care.</p>
        </div>
      </div>
    </footer>
  );
}
