import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import logo from "@/assets/strivenest-logo.jpeg";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3" data-testid="brand-link">
          <img src={logo} alt="Strivenest" className="h-10 w-10 object-cover rounded-lg ring-1 ring-border" />
          <div className="leading-tight">
            <div className="font-display font-bold text-base sm:text-lg text-navy tracking-tight">Strivenest</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Technologies</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `link-underline px-3 py-2 text-sm font-medium transition-smooth ${isActive ? "text-navy" : "text-foreground/70 hover:text-navy"}`
              }
              data-testid={`nav-${l.label.toLowerCase()}`}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-navy text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-navy/90 transition-smooth"
            data-testid="header-cta-quote"
          >
            Get a Quote <ArrowUpRight className="h-4 w-4" />
          </Link>
        </nav>
        <button className="md:hidden p-2 text-navy" onClick={() => setOpen(!open)} aria-label="Menu" data-testid="mobile-menu-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium" data-testid={`mobile-nav-${l.label.toLowerCase()}`}>
                {l.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-navy text-primary-foreground px-4 py-2 text-sm font-semibold text-center">Get a Quote</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-navy text-white/90 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Strivenest" className="h-10 w-10 rounded bg-white/10 p-1" />
            <span className="font-display font-bold text-white">Strivenest</span>
          </div>
          <p className="text-sm text-white/60">
            Strivenest Technologies Pvt Ltd — Mobile Apps, Websites, UI/UX & Digital Marketing crafted with care.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-white">Explore</h4>
          <ul className="space-y-2 text-sm text-white/60">
            {links.slice(1).map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:text-white transition-smooth">{l.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-white">Services</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>Mobile App Development</li>
            <li>Web Development</li>
            <li>UI/UX Design</li>
            <li>Digital Marketing</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-white">Contact</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-accent" /> Tapovanam Rd, MGM Colony, Anantapur, AP 515004</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-amber-accent" /> +91 94401 30162</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-amber-accent" /> info@strivenest.com</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-amber-accent" /> Mon–Sat · 24/7 support</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Strivenest Technologies Pvt Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
