import { useEffect, useState } from "react";
import { useNavigate, NavLink, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api, formatErr } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Trash2, Pencil, Plus, LayoutDashboard, Briefcase, Layers, Factory, Package, Inbox } from "lucide-react";
import logo from "@/assets/strivenest-logo.jpeg";

function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (user === false) nav("/admin/login", { replace: true }); }, [user, nav]);
  if (!user) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  if (user.role !== "admin") return <Navigate to="/admin/login" replace />;

  const links = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/projects", label: "Projects", icon: Package },
    { to: "/admin/services", label: "Services", icon: Layers },
    { to: "/admin/industries", label: "Industries", icon: Factory },
    { to: "/admin/jobs", label: "Careers", icon: Briefcase },
    { to: "/admin/contact", label: "Submissions", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-secondary/40" data-testid="admin-shell">
      <aside className="fixed left-0 top-0 h-full w-64 bg-navy text-white p-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <img src={logo} alt="Strivenest" className="h-9 w-9 rounded" />
          <div>
            <div className="font-display font-bold">Strivenest</div>
            <div className="text-[10px] uppercase tracking-widest text-white/60">Admin</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-smooth ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
              data-testid={`admin-nav-${l.label.toLowerCase()}`}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); nav("/admin/login"); }} className="mt-6 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-smooth" data-testid="admin-logout">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <div className="lg:ml-64">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="text-sm">Signed in as <span className="font-semibold text-navy">{user.email}</span></div>
            <a href="/" className="text-sm text-muted-foreground hover:text-navy transition-smooth">← Back to site</a>
          </div>
        </header>
        <main className="p-6 md:p-10 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState({ projects: 0, services: 0, industries: 0, jobs: 0, contact: 0 });
  useEffect(() => {
    Promise.all([
      api.get("/projects"), api.get("/services"), api.get("/industries"), api.get("/jobs"), api.get("/contact"),
    ]).then(([p, s, i, j, c]) => setStats({ projects: p.data.length, services: s.data.length, industries: i.data.length, jobs: j.data.length, contact: c.data.length })).catch(() => {});
  }, []);
  const cards = [
    { label: "Projects", n: stats.projects },
    { label: "Services", n: stats.services },
    { label: "Industries", n: stats.industries },
    { label: "Jobs", n: stats.jobs },
    { label: "Submissions", n: stats.contact },
  ];
  return (
    <div data-testid="admin-overview">
      <h1 className="text-3xl font-display font-bold text-navy">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage everything your visitors see.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="text-3xl font-display font-bold text-navy mt-1">{c.n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrudTable({ title, resource, fields, testIdPrefix }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.key, ""])));

  const load = () => api.get(`/${resource}`).then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const resetForm = () => { setForm(Object.fromEntries(fields.map(f => [f.key, ""]))); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/${resource}/${editing}`, form);
      else await api.post(`/${resource}`, form);
      toast.success(`${title} saved`);
      resetForm();
      load();
    } catch (err) { toast.error(formatErr(err)); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try { await api.delete(`/${resource}/${id}`); toast.success("Deleted"); load(); }
    catch (err) { toast.error(formatErr(err)); }
  };

  const edit = (item) => {
    setEditing(item.id);
    setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] ?? ""])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div data-testid={`admin-${testIdPrefix}`}>
      <h1 className="text-3xl font-display font-bold text-navy">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">Add, edit or remove {title.toLowerCase()}.</p>

      <form onSubmit={submit} className="mt-6 rounded-2xl bg-card border border-border p-6 shadow-card space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          {fields.map((f) => (
            f.type === "textarea" ? (
              <textarea key={f.key} placeholder={f.label} value={form[f.key]} onChange={(e)=>setForm({...form, [f.key]: e.target.value})} rows={3}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm md:col-span-2 outline-none focus:border-amber-accent transition-smooth"
                data-testid={`${testIdPrefix}-input-${f.key}`} />
            ) : f.type === "select" ? (
              <select key={f.key} value={form[f.key]} onChange={(e)=>setForm({...form, [f.key]: e.target.value})} required
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-amber-accent transition-smooth"
                data-testid={`${testIdPrefix}-input-${f.key}`}>
                <option value="">{f.label}</option>
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input key={f.key} required={f.required !== false} placeholder={f.label} value={form[f.key]} onChange={(e)=>setForm({...form, [f.key]: e.target.value})}
                className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-amber-accent transition-smooth"
                data-testid={`${testIdPrefix}-input-${f.key}`} />
            )
          ))}
        </div>
        <div className="flex gap-3">
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-2.5 text-sm font-semibold hover:bg-navy/90 transition-smooth" data-testid={`${testIdPrefix}-save`}>
            <Plus className="h-4 w-4" /> {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="rounded-full border border-border px-5 py-2.5 text-sm hover:border-amber-accent transition-smooth">Cancel</button>
          )}
        </div>
      </form>

      <div className="mt-8 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left">
            <tr>
              {fields.slice(0, 3).map(f => <th key={f.key} className="px-4 py-3 font-semibold text-navy">{f.label}</th>)}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-border" data-testid={`${testIdPrefix}-row-${it.id}`}>
                {fields.slice(0, 3).map(f => <td key={f.key} className="px-4 py-3 align-top">{String(it[f.key] ?? "").slice(0, 120)}</td>)}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={()=>edit(it)} className="mr-2 text-navy hover:text-amber-accent transition-smooth" data-testid={`${testIdPrefix}-edit-${it.id}`}><Pencil className="h-4 w-4 inline" /></button>
                  <button onClick={()=>del(it.id)} className="text-destructive hover:opacity-80 transition-smooth" data-testid={`${testIdPrefix}-delete-${it.id}`}><Trash2 className="h-4 w-4 inline" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Nothing here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Submissions() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/contact").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (!window.confirm("Delete this submission?")) return;
    try { await api.delete(`/contact/${id}`); toast.success("Deleted"); load(); }
    catch (err) { toast.error(formatErr(err)); }
  };
  return (
    <div data-testid="admin-submissions">
      <h1 className="text-3xl font-display font-bold text-navy">Client Submissions</h1>
      <p className="text-sm text-muted-foreground mt-1">Quote and contact requests from your website.</p>
      <div className="mt-8 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl bg-card border border-border p-6 shadow-card" data-testid={`submission-${it.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display font-semibold text-navy text-lg">{it.name} · <span className="text-amber-accent text-sm uppercase tracking-widest">{it.service}</span></div>
                <div className="text-sm text-muted-foreground">{it.email} {it.phone && `· ${it.phone}`}</div>
                <p className="text-sm mt-3">{it.message}</p>
                <div className="text-xs text-muted-foreground mt-3">{new Date(it.created_at).toLocaleString()}</div>
              </div>
              <button onClick={()=>del(it.id)} className="text-destructive hover:opacity-80" data-testid={`submission-delete-${it.id}`}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground">No submissions yet.</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminShell>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="projects" element={<CrudTable title="Projects" resource="projects" testIdPrefix="projects"
          fields={[
            { key: "name", label: "Name" },
            { key: "tag", label: "Tag / Category" },
            { key: "description", label: "Description", type: "textarea", required: false },
            { key: "image_url", label: "Image URL", required: false },
          ]} />} />
        <Route path="services" element={<CrudTable title="Services" resource="services" testIdPrefix="services"
          fields={[
            { key: "title", label: "Title" },
            { key: "icon", label: "Icon (Lucide name)", required: false },
            { key: "description", label: "Description", type: "textarea", required: false },
          ]} />} />
        <Route path="industries" element={<CrudTable title="Industries" resource="industries" testIdPrefix="industries"
          fields={[
            { key: "name", label: "Name" },
            { key: "description", label: "Description", type: "textarea", required: false },
          ]} />} />
        <Route path="jobs" element={<CrudTable title="Careers / Jobs" resource="jobs" testIdPrefix="jobs"
          fields={[
            { key: "title", label: "Job Title" },
            { key: "category", label: "Category", type: "select", options: ["IT", "Sales", "Digital Marketing"] },
            { key: "experience", label: "Experience" },
            { key: "description", label: "Description", type: "textarea", required: false },
          ]} />} />
        <Route path="contact" element={<Submissions />} />
      </Routes>
    </AdminShell>
  );
}
