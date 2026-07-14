import { useEffect, useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const categories = ["All", "IT", "Sales", "Digital Marketing"];

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => { api.get("/jobs").then((r) => setJobs(r.data)).catch(() => {}); }, []);

  const filtered = useMemo(() => filter === "All" ? jobs : jobs.filter((j) => j.category === filter), [jobs, filter]);
  const count = (c) => c === "All" ? jobs.length : jobs.filter((j) => j.category === c).length;

  return (
    <div data-testid="careers-page">
      <section className="bg-hero-mesh bg-grain text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Careers</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 max-w-3xl">Grow your career with us.</h1>
          <p className="mt-6 text-lg text-white/75 max-w-3xl">We're always looking for creative, talented self-starters to join the Strivenest family.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                data-testid={`filter-${c.toLowerCase().replace(/\s+/g,'-')}`}
                className={`rounded-full px-5 py-2 text-sm font-medium border transition-smooth ${
                  filter === c ? "bg-navy text-white border-navy" : "bg-card border-border hover:border-amber-accent"
                }`}>
                {c} ({count(c)})
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((j, i) => (
              <motion.div key={j.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
                className="rounded-2xl bg-card border border-border p-6 shadow-card flex items-center justify-between gap-4 hover:border-amber-accent hover:-translate-y-1 transition-smooth"
                data-testid={`job-card-${j.id}`}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-navy text-white flex items-center justify-center">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-navy">{j.title}</div>
                    <div className="text-sm text-muted-foreground">Experience: {j.experience}</div>
                    <div className="text-xs text-amber-accent mt-1 font-semibold uppercase tracking-widest">{j.category}</div>
                  </div>
                </div>
                <a href="mailto:hr@strivenest.com?subject=Application" className="rounded-full bg-secondary hover:bg-navy hover:text-white px-4 py-2 text-sm font-semibold transition-smooth">Apply</a>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-sm text-muted-foreground">No openings in this category right now.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
