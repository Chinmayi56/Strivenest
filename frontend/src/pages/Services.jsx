import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { api } from "@/lib/api";

const technologies = [
  "Adobe XD", "Flutter", "Kotlin", "Python", "Figma", "Node JS", "Angular",
  "Java", "AWS", "Azure", "MongoDB", "PostgreSQL", "Photoshop",
  "Google Cloud", "Next JS", "PHP", "VueJS", "React Native", "Swift", "TypeScript",
];

function Icon({ name, className }) {
  const C = Icons[name] || Icons.Sparkles;
  return <C className={className} />;
}

export default function Services() {
  const [services, setServices] = useState([]);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/industries").then((r) => setIndustries(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="services-page">
      <section className="bg-hero-mesh bg-grain text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Services</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 max-w-3xl">Everything you need to ship & grow.</h1>
          <p className="mt-6 text-lg text-white/75 max-w-3xl">From your first prototype to enterprise-grade platforms, our team covers the full stack of design, engineering and growth.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">What we offer</div>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">Nine focused capabilities.</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-smooth">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white mb-4">
                  <Icon name={s.icon} className="h-6 w-6" />
                </div>
                <div className="font-display font-semibold text-lg text-navy">{s.title}</div>
                {s.description && <p className="text-sm text-muted-foreground mt-2">{s.description}</p>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Tech stack</div>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">Technologies we work with.</h2>
          <div className="mt-10 flex flex-wrap gap-3">
            {technologies.map((t) => (
              <span key={t} className="rounded-full bg-card border border-border px-4 py-2 text-sm font-medium shadow-card hover:border-amber-accent transition-smooth">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Industries</div>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">Industries we serve.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((i) => (
              <div key={i.id} className="rounded-xl border border-border bg-card p-5 shadow-card text-sm font-medium hover:border-amber-accent transition-smooth">
                {i.name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
