import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "strivenest";

await mongoose.connect(`${MONGO_URL}/${DB_NAME}`);

// ---- Schemas ----
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, required: true },
  name: String,
  role: { type: String, default: "admin" },
  password_hash: String,
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({ name: String, tag: String, description: String, image_url: String }, { timestamps: true });
const ServiceSchema = new mongoose.Schema({ title: String, icon: String, description: String }, { timestamps: true });
const IndustrySchema = new mongoose.Schema({ name: String, description: String }, { timestamps: true });
const JobSchema = new mongoose.Schema({ title: String, category: String, experience: String, description: String }, { timestamps: true });
const ContactSchema = new mongoose.Schema({ name: String, email: String, phone: String, service: String, message: String, status: { type: String, default: "new" } }, { timestamps: true });

const User = mongoose.model("User", UserSchema);
const Project = mongoose.model("Project", ProjectSchema);
const Service = mongoose.model("Service", ServiceSchema);
const Industry = mongoose.model("Industry", IndustrySchema);
const Job = mongoose.model("Job", JobSchema);
const Contact = mongoose.model("Contact", ContactSchema);

// ---- Auth middleware ----
function requireAdmin(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Not authenticated" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== "admin") return res.status(403).json({ detail: "Admin required" });
    req.user = payload;
    next();
  } catch (e) { return res.status(401).json({ detail: "Invalid token" }); }
}

// ---- Seed admin ----
async function seed() {
  const email = (process.env.ADMIN_EMAIL || "admin@strivenest.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "strivenest@1234";
  let user = await User.findOne({ email });
  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = await User.create({ email, name: "Strivenest Admin", role: "admin", password_hash: hash });
    console.log("Seeded admin:", email);
  }
}
seed().catch(console.error);

// ---- Routes ----
const r = express.Router();

r.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ detail: "Invalid email or password" });
  }
  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

r.get("/auth/me", requireAdmin, async (req, res) => {
  const u = await User.findById(req.user.sub);
  res.json({ id: u.id, email: u.email, name: u.name, role: u.role });
});

function crud(path, Model) {
  r.get(`/${path}`, async (_, res) => res.json(await Model.find().sort("-createdAt").lean()));
  r.post(`/${path}`, requireAdmin, async (req, res) => res.json(await Model.create(req.body)));
  r.put(`/${path}/:id`, requireAdmin, async (req, res) => res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })));
  r.delete(`/${path}/:id`, requireAdmin, async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
}
crud("projects", Project);
crud("services", Service);
crud("industries", Industry);
crud("jobs", Job);

r.post("/contact", async (req, res) => res.json(await Contact.create(req.body)));
r.get("/contact", requireAdmin, async (_, res) => res.json(await Contact.find().sort("-createdAt").lean()));
r.delete("/contact/:id", requireAdmin, async (req, res) => { await Contact.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

app.use("/api", r);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Strivenest Node/Express API listening on :${PORT}`));
