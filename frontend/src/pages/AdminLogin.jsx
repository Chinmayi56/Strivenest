import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatErr } from "@/lib/api";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/strivenest-logo.jpeg";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@strivenest.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user && user.role === "admin") nav("/admin", { replace: true }); }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, Admin!");
      nav("/admin", { replace: true });
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-mesh bg-grain flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md rounded-3xl bg-card border border-border p-8 shadow-elegant">
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="Strivenest" className="h-10 w-10 rounded-lg" />
          <div>
            <div className="font-display font-bold text-navy">Strivenest</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Portal</div>
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-navy">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">Access the admin dashboard.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth"
              placeholder="admin@strivenest.com" data-testid="admin-email" />
          </div>
          <div className="relative">
            <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-accent transition-smooth"
              placeholder="Password" data-testid="admin-password" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-full bg-navy text-white py-3 font-semibold hover:bg-navy/90 transition-smooth disabled:opacity-60" data-testid="admin-login-submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="text-xs text-muted-foreground mt-6 text-center">
          Protected area · Admin credentials required.
        </div>
      </div>
    </div>
  );
}
