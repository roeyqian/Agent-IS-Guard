// HTTP工具函数 - 复用AgentIS架构
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-max-age": "86400",
};

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function createRouter() {
  const routes = [];

  return {
    add(method, pattern, handler) {
      routes.push({ method: method.toUpperCase(), ...compilePattern(pattern), handler });
    },

    async handle(request, env, url) {
      const matched = routes.find((candidate) => {
        if (candidate.method !== request.method.toUpperCase()) return false;
        return candidate.expression.test(url.pathname);
      });

      if (!matched) return json({ error: "API not found" }, 404);

      const match = url.pathname.match(matched.expression);
      const params = Object.fromEntries(
        matched.names.map((name, index) => [name, decodeURIComponent(match[index + 1])]),
      );
      return matched.handler({ request, env, url, params });
    },
  };
}

export async function handleApi(request, env, url, router) {
  if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }));

  try {
    return withCors(await router.handle(request, env, url));
  } catch (error) {
    const status = Number(error?.status) || 500;
    if (status >= 500) console.error(error);
    return withCors(
      json({ error: status === 500 ? "Server error" : String(error?.message || error) }, status),
    );
  }
}

export async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function compilePattern(pattern) {
  const names = [];
  const source = pattern.split("/").map((segment) => {
    if (segment.startsWith(":")) {
      names.push(segment.slice(1));
      return "([^/]+)";
    }
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { expression: new RegExp(`^${source}/?$`), names };
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function requireAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized" };
  }
  return authHeader.slice(7);
}

export async function getSession(sessionToken, env) {
  const sessionData = await env.kv.get(`session:${sessionToken}`);
  if (sessionData) {
    return JSON.parse(sessionData);
  }

  const record = await env.db.prepare(
    `SELECT s.session_id, s.user_id, s.expires_at, u.email, u.username, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_id = ?`
  ).bind(sessionToken).first();

  if (!record) {
    throw { status: 401, message: "Invalid session" };
  }

  if (new Date(record.expires_at).getTime() <= Date.now()) {
    await revokeSession(sessionToken, env);
    throw { status: 401, message: "Session expired" };
  }

  const session = {
    userId: record.user_id,
    email: record.email,
    username: record.username,
    role: record.role,
  };

  const ttlSeconds = Math.max(60, Math.floor((new Date(record.expires_at).getTime() - Date.now()) / 1000));
  await env.kv.put(`session:${sessionToken}`, JSON.stringify(session), { expirationTtl: ttlSeconds });
  return session;
}

export async function persistSession(sessionToken, sessionData, env, ttlSeconds = SESSION_TTL_SECONDS) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await Promise.all([
    env.kv.put(`session:${sessionToken}`, JSON.stringify(sessionData), { expirationTtl: ttlSeconds }),
    env.db.prepare(
      `INSERT OR REPLACE INTO sessions (session_id, user_id, expires_at, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    ).bind(sessionToken, sessionData.userId, expiresAt).run(),
  ]);

  return { ...sessionData, expiresAt };
}

export async function revokeSession(sessionToken, env) {
  await Promise.all([
    env.kv.delete(`session:${sessionToken}`),
    env.db.prepare("DELETE FROM sessions WHERE session_id = ?").bind(sessionToken).run(),
  ]);
}

export async function requireAdmin(request, env) {
  const token = requireAuth(request);
  const session = await getSession(token, env);
  if (session.role !== 'admin') {
    throw { status: 403, message: "Admin access required" };
  }
  return session;
}

export async function requireStandardUser(request, env) {
  const token = requireAuth(request);
  const session = await getSession(token, env);
  if (session.role === 'admin') {
    throw { status: 403, message: "Admin accounts are limited to research management" };
  }
  return { token, session };
}
