import { motion } from "framer-motion";
import founder from "@/assets/founder.jpg";
import cofounder from "@/assets/cofounder.jpg";
import team from "@/assets/team.jpg";

const stats = [
  { n: "500+", label: "Successful Projects" },
  { n: "400+", label: "Happy Clients" },
  { n: "100+", label: "Skilled Experts" },
];

const founders = [
  { name: "Rakesh Vardhan", role: "Founder & CEO", img: founder, bio: "10+ years building mobile and web platforms across India. Ex-CTO at three product startups." },
  { name: "Sneha Reddy", role: "Co-Founder & CTO", img: cofounder, bio: "Full-stack architect specialising in scalable cloud systems, AI/ML and delightful UX." },
];

const coreTeam = [
  { name: "Aarav Iyer", role: "Design Lead" },
  { name: "Meera Nair", role: "Head of Engineering" },
  { name: "Kunal Shah", role: "Product Manager" },
  { name: "Priya Ravi", role: "Marketing Lead" },
  { name: "Vikram Sen", role: "QA Lead" },
  { name: "Nitya K.", role: "DevOps Engineer" },
];

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="bg-hero-mesh bg-grain text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">About us</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 max-w-3xl">Stories of success, written in code and craft.</h1>
          <p className="mt-6 text-lg text-white/75 max-w-3xl">
            At Strivenest Technologies, every project begins as an idea — but for us it grows into a journey of collaboration, creativity and success. Our success is built on the achievements of our clients.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-muted-foreground leading-relaxed">
              Behind every line of code is a team that listens first, understands deeply, and crafts with care. We measure success not only in downloads, revenues or ratings — but in the lasting relationships we build with our clients.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-secondary p-5 text-center">
                  <div className="text-2xl md:text-3xl font-display font-bold text-navy">{s.n}</div>
                  <div className="text-xs mt-1 text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <motion.img initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            src={team} alt="Team collaborating" className="rounded-3xl shadow-elegant" />
        </div>
      </section>

      <section className="py-20 bg-secondary/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Leadership</div>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">Founders steering the ship.</h2>
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            {founders.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-3xl bg-card border border-border p-8 shadow-card flex gap-6 items-center">
                <img src={m.img} alt={m.name} className="h-32 w-32 rounded-2xl object-cover ring-4 ring-amber-accent/30" />
                <div>
                  <div className="font-display font-semibold text-xl text-navy">{m.name}</div>
                  <div className="text-amber-accent text-xs font-semibold uppercase tracking-widest">{m.role}</div>
                  <div className="text-sm text-muted-foreground mt-3">{m.bio}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Our core team</div>
          <h2 className="text-4xl md:text-5xl font-bold mt-2">Specialists behind every launch.</h2>
          <div className="mt-10 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {coreTeam.map((t) => (
              <div key={t.name} className="rounded-2xl bg-card border border-border p-6 text-center shadow-card hover:-translate-y-1 transition-smooth">
                <div className="h-14 w-14 mx-auto rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg">
                  {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="mt-3 text-sm font-semibold text-navy">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
