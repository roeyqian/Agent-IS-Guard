import { json, requireAuth, getSession } from "../../app/http.js";

export async function register({ request, env }) {
  const { email, password, username } = await request.json();

  if (!email || !password || !username) {
    throw { status: 400, message: "Missing required fields" };
  }

  const existing = await env.db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    throw { status: 400, message: "Email already exists" };
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const salt = Math.random().toString(36).slice(2);
  const passwordHash = await hashPassword(password, salt);

  await env.db.prepare(
    `INSERT INTO users (id, username, email, password_hash, salt, role, created_at)
     VALUES (?, ?, ?, ?, ?, 'user', datetime('now'))`
  ).bind(userId, username, email, passwordHash, salt).run();

  const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const sessionData = { userId, email, username, role: 'user' };
  await env.kv.put(`session:${sessionToken}`, JSON.stringify(sessionData), { expirationTtl: 604800 });

  return json({ token: sessionToken, user: { id: userId, email, username, role: 'user' } });
}

export async function login({ request, env }) {
  const { email, password } = await request.json();

  if (!email || !password) {
    throw { status: 400, message: "Missing email or password" };
  }

  const user = await env.db.prepare(
    "SELECT id, username, email, password_hash, salt, role FROM users WHERE email = ?"
  ).bind(email).first();

  if (!user) {
    throw { status: 401, message: "Invalid credentials" };
  }

  const passwordHash = await hashPassword(password, user.salt);
  if (passwordHash !== user.password_hash) {
    throw { status: 401, message: "Invalid credentials" };
  }

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
