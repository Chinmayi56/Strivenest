import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock, Briefcase, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";

function ContactCard({ icon: Icon, title, lines }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-card flex gap-4">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-navy text-white flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-display font-semibold text-navy">{title}</div>
        {lines.map((l) => <div key={l} className="text-sm text-muted-foreground">{l}</div>)}
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "App Development", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm({ name: "", email: "", phone: "", service: "App Development", message: "" });
      toast.success("Request received! We'll reach out within one business day.");
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="bg-hero-mesh bg-grain text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm uppercase tracking-widest text-amber-accent font-semibold">Contact us</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3">Connect. Collaborate. Create.</h1>
          <p className="mt-6 text-lg text-white/75 max-w-3xl italic">"Connection is the beginning of every great journey — together, every step feels lighter."</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div className="space-y-5">
            <ContactCard icon={Phone} title="Business Enquiry" lines={["+91 94401 30162"]} />
            <ContactCard icon={Mail} title="Email Address" lines={["info@strivenest.com"]} />
            <ContactCard icon={MapPin} title="Our Address" lines={["Tapovanam Rd, MGM Colony, Syndicate Nagar, Anantapur, Andhra Pradesh 515004"]} />
            <ContactCard icon={Briefcase} title="Career Enquiry" lines={["+91 94401 30162", "hr@strivenest.com"]} />
            <ContactCard icon={Clock} title="Working Hours" lines={["Monday – Saturday", "Timings: 24/7 support"]} />
            <div className="flex flex-wrap gap-3 pt-2">
              <a href="https://wa.me/919440130162" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-5 py-3 font-semibold hover:opacity-90 transition-smooth">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href="tel:+919440130162" className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-3 font-semibold hover:bg-navy/90 transition-smooth">
                <Phone className="h-4 w-4" /> Quick Call
              </a>
            </div>
          </div>

          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            onSubmit={submit} className="rounded-3xl bg-card border border-border p-8 shadow-card" data-testid="quote-form">
            <h2 className="font-display text-2xl font-bold text-navy">Request a quote</h2>
            <p className="text-sm text-muted-foreground mt-1">Tell us about your project — we'll get back within one business day.</p>
            <div className="mt-6 space-y-4">
              <input required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Full name" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth" data-testid="form-name" />
              <input required type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} placeholder="Email" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth" data-testid="form-email" />
              <input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="Phone" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth" data-testid="form-phone" />
              <select value={form.service} onChange={(e)=>setForm({...form, service:e.target.value})} className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth" data-testid="form-service">
                <option>App Development</option>
                <option>Website Development</option>
                <option>UI/UX Design</option>
                <option>Digital Marketing</option>
                <option>Other</option>
              </select>
              <textarea required rows={4} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="Tell us about your project" className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth" data-testid="form-message" />
              <button type="submit" disabled={loading} className="w-full rounded-full bg-navy text-white py-3 font-semibold shadow-elegant hover:bg-navy/90 transition-smooth disabled:opacity-60" data-testid="form-submit">
                {loading ? "Sending..." : "Send enquiry"}
              </button>
              {sent && (
                <div className="text-sm text-navy flex items-center gap-2 justify-center" data-testid="form-success">
                  <CheckCircle2 className="h-4 w-4 text-amber-accent" /> Thanks — we've received your request!
                </div>
              )}
            </div>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
