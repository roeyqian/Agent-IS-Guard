import { json, requireAuth, getSession } from "../../app/http.js";

export async function register({ request, env }) {
  const { email, password, username } = await request.json();

  const normalizedEmail = String(email || "").trim();
  const normalizedUsername = String(username || "").trim();
  const isAdminAccount = normalizedUsername === "admin";

  if (!normalizedEmail || !password || !normalizedUsername) {
    throw { status: 400, message: "Missing required fields" };
  }

  const existingEmail = await env.db.prepare("SELECT id FROM users WHERE email = ?").bind(normalizedEmail).first();
  if (existingEmail) {
    throw { status: 400, message: "Email already exists" };
  }

  const existingUsername = await env.db.prepare("SELECT id FROM users WHERE username = ?").bind(normalizedUsername).first();
  if (existingUsername) {
    throw { status: 400, message: "Username already exists" };
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const salt = Math.random().toString(36).slice(2);
  const passwordHash = await hashPassword(password, salt);

  await env.db.prepare(
    `INSERT INTO users (id, username, email, password_hash, salt, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(userId, normalizedUsername, normalizedEmail, passwordHash, salt, isAdminAccount ? 'admin' : 'user').run();

  const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const sessionData = { userId, email: normalizedEmail, username: normalizedUsername, role: isAdminAccount ? 'admin' : 'user' };
  await env.kv.put(`session:${sessionToken}`, JSON.stringify(sessionData), { expirationTtl: 604800 });

  return json({
    token: sessionToken,
    user: { id: userId, email: normalizedEmail, username: normalizedUsername, role: isAdminAccount ? 'admin' : 'user' }
  });
}

export async function login({ request, env }) {
  const { username, password } = await request.json();
  const normalizedUsername = String(username || "").trim();

  if (!normalizedUsername || !password) {
    throw { status: 400, message: "Missing username or password" };
  }

  const user = await env.db.prepare(
    "SELECT id, username, email, password_hash, salt, role FROM users WHERE username = ?"
  ).bind(normalizedUsername).first();

  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.password_hash) {
    throw { status: 401, message: "Invalid credentials" };
  }

  await env.db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").bind(user.id).run();

  const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const sessionData = { userId: user.id, email: user.email, username: user.username, role: user.role };
  await env.kv.put(`session:${sessionToken}`, JSON.stringify(sessionData), { expirationTtl: 604800 });

  return json({
    token: sessionToken,
    user: { id: user.id, email: user.email, username: user.username, role: user.role }
  });
}

export async function logout({ request, env }) {
  const token = requireAuth(request);
  await env.kv.delete(`session:${token}`);
  return json({ message: "Logged out successfully" });
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
