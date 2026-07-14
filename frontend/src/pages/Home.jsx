import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Smartphone, Globe, Palette, Megaphone, Shield, Zap, Users, Rocket,
  Sparkles, Headphones, Settings2, CheckCircle2, ArrowRight,
  FileText, FileSignature, Code2, Bug, ThumbsUp, Cloud, Activity, Eye
} from "lucide-react";
import { api } from "@/lib/api";
import founder from "@/assets/founder.jpg";
import cofounder from "@/assets/cofounder.jpg";

const services = [
  { icon: Smartphone, title: "App Development", desc: "Native and cross-platform iOS & Android apps built for scale and delight." },
  { icon: Globe, title: "Website Development", desc: "Responsive, high-performance websites that convert visitors into customers." },
  { icon: Palette, title: "UI/UX Design", desc: "Intuitive, user-centered design systems that make products a pleasure to use." },
  { icon: Megaphone, title: "Digital Marketing", desc: "SEO, social, and paid campaigns that put your brand in front of the right people." },
];

const guarantees = [
  { icon: Shield, title: "Confidentiality with NDA", desc: "Your ideas stay yours. Every engagement starts with a signed NDA." },
  { icon: Sparkles, title: "Affordable App Development", desc: "Enterprise-grade quality at pricing that fits your growth stage." },
  { icon: Users, title: "Expert Development Team", desc: "100+ specialists across mobile, web, design and cloud." },
  { icon: Zap, title: "Fast Mobile Development", desc: "Weekly sprints and rapid iterations that keep momentum high." },
  { icon: Palette, title: "User-Friendly UI/UX", desc: "Interfaces validated with real users, not just designers." },
  { icon: Rocket, title: "Seamless Performance", desc: "Optimised for speed, scale and every device your customers use." },
  { icon: Headphones, title: "Quick Response Support", desc: "Same-day replies from a team that actually answers the phone." },
  { icon: Settings2, title: "Custom-Tailored Solutions", desc: "No templated builds — every product is engineered around your goals." },
];

const processSteps = [
  { n: 1, icon: FileText, title: "Requirements", desc: "Understand your product, users and business model." },
  { n: 2, icon: FileSignature, title: "Agreement", desc: "Clear scope, timelines and milestone-based pricing." },
  { n: 3, icon: Palette, title: "UI/UX Design", desc: "Wireframes, prototypes and design systems that scale." },
  { n: 4, icon: Code2, title: "Development", desc: "Modular engineering with continuous integration." },
  { n: 5, icon: Bug, title: "Testing", desc: "Manual & automated QA across devices and edge cases." },
  { n: 6, icon: ThumbsUp, title: "Client Approval", desc: "Sign-off sessions with recordings and walkthroughs." },
  { n: 7, icon: Cloud, title: "Deployment", desc: "Production launch with rollback plans and monitoring." },
  { n: 8, icon: Eye, title: "User Experience", desc: "Behavioural analytics and feedback loops from day one." },
  { n: 9, icon: Activity, title: "Monitor & Grow", desc: "Ongoing performance, security and feature evolution." },
];

const founders = [
  { name: "Rakesh Vardhan", role: "Founder & CEO", img: founder, bio: "10+ years shipping mobile & web platforms across India. Built engineering teams at three high-growth startups." },
  { name: "Sneha Reddy", role: "Co-Founder & CTO", img: cofounder, bio: "Full-stack architect specialising in scalable cloud systems, AI infrastructure and product engineering." },
];

const clients = ["TechCorp", "FoodieHub", "MetroCabs", "EduConnect", "CakeFactory", "CareEsteem", "Zipck", "Yaarishh"];

export default function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-mesh bg-grain text-white animate-gradient" data-testid="home-hero">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-accent animate-pulse" /> Strivenest Technologies Pvt Ltd
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              We build <span className="text-gradient-brand">digital products</span> that move businesses forward.
            </h1>
            <p className="mt-6 text-lg text-white/75 max-w-2xl">
              Mobile Apps · Websites · UI/UX Design · Digital Marketing. Trusted by 400+ happy clients across India.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white text-navy px-6 py-3 font-semibold hover:bg-white/90 transition-smooth" data-testid="hero-cta-quote">
                Get a Free Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/services" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white/10 transition-smooth" data-testid="hero-cta-services">
                Our Services
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[["500+", "Projects"], ["400+", "Clients"], ["100+", "Experts"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-3xl font-display font-bold text-white">{n}</div>
                  <div className="text-xs uppercase tracking-widest text-white/60">{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24" data-testid="home-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">What we do</div>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">End-to-end product engineering under one roof.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-smooth">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white mb-4 group-hover:bg-amber-accent group-hover:text-navy transition-smooth">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-navy">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-secondary/60" data-testid="home-projects">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Recent work</div>
              <h2 className="text-4xl md:text-5xl font-bold mt-2">Featured projects</h2>
            </div>
            <Link to="/projects" className="text-navy font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.article key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden bg-card border border-border shadow-card group hover:-translate-y-1 transition-smooth">
                <div className="aspect-video bg-hero-mesh relative flex items-center justify-center animate-gradient">
                  <span className="font-display text-5xl font-bold text-white/90">{p.name.charAt(0)}</span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-amber-accent font-semibold uppercase tracking-widest mb-1">{p.tag}</div>
                  <div className="font-display font-semibold text-lg text-navy">{p.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{p.description || `Case study #${i + 1}`}</div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Clients marquee */}
      <section className="py-14 overflow-hidden border-y border-border" data-testid="home-clients">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by growing brands</p>
        <div className="relative">
          <div className="flex gap-10 animate-marquee whitespace-nowrap w-max">
            {[...clients, ...clients].map((c, i) => (
              <span key={i} className="font-display font-semibold text-navy/60 text-2xl">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-24 bg-navy text-white relative overflow-hidden bg-grain" data-testid="home-process">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl mb-14">
            <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Our process</div>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 text-white">A 9-step workflow from idea to launch and beyond.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {processSteps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur hover:bg-white/10 hover:-translate-y-1 transition-smooth">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-accent text-navy flex items-center justify-center font-bold">{s.n}</div>
                  <s.icon className="h-5 w-5 text-amber-accent" />
                </div>
                <div className="font-display font-semibold text-lg text-white">{s.title}</div>
                <div className="text-white/60 text-sm mt-1">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strivenest Guarantees */}
      <section className="py-24" data-testid="home-guarantees">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Strivenest guarantees</div>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">Commitments that make working with us feel effortless.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((g, i) => (
              <motion.div key={g.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-smooth">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-navy">
                  <g.icon className="h-5 w-5" />
                </div>
                <div className="font-display font-semibold mt-4 text-navy">{g.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{g.desc}</div>
                <CheckCircle2 className="h-4 w-4 text-amber-accent mt-3" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-24 bg-secondary/60" data-testid="home-founders">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Leadership</div>
            <h2 className="text-4xl md:text-5xl font-bold mt-2">Meet the founders steering Strivenest.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {founders.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-card flex gap-6 items-center">
                <img src={m.img} alt={m.name} className="h-28 w-28 md:h-32 md:w-32 rounded-2xl object-cover ring-4 ring-amber-accent/30" />
                <div>
                  <div className="font-display font-semibold text-xl text-navy">{m.name}</div>
                  <div className="text-amber-accent text-sm font-semibold uppercase tracking-widest">{m.role}</div>
                  <div className="text-sm text-muted-foreground mt-3">{m.bio}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" data-testid="home-cta">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-hero-mesh animate-gradient bg-grain text-white p-10 md:p-14 text-center shadow-elegant">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to build something remarkable?</h2>
            <p className="mt-3 text-white/75">Let's turn your idea into a product your users will love.</p>
            <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-navy px-6 py-3 font-semibold hover:bg-white/90 transition-smooth" data-testid="cta-start-project">
              Start your project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
