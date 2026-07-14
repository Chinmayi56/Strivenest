import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => { api.get("/projects").then((r) => setProjects(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="projects-page">
      <section className="bg-hero-mesh bg-grain text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Projects</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 max-w-3xl">Real products. Real users. Real business impact.</h1>
          <p className="mt-6 text-lg text-white/75 max-w-3xl">A portfolio of platforms we've conceived, built and helped scale.</p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <motion.article key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-2xl overflow-hidden bg-card border border-border shadow-card group hover:-translate-y-1 transition-smooth" data-testid={`project-card-${p.id}`}>
                <div className="aspect-video bg-hero-mesh animate-gradient relative flex items-center justify-center">
                  <span className="font-display text-5xl font-bold text-white/90">{p.name.charAt(0)}</span>
                  <div className="absolute top-3 left-3 text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur">
                    #{String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs text-amber-accent font-semibold uppercase tracking-widest mb-1">{p.tag}</div>
                  <h3 className="font-display font-semibold text-xl text-navy">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{p.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
