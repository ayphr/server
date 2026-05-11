import { clearToken, createPasswordHash, issueToken, requireAuth, verifyPassword } from "../auth";
import { createUser, getActiveSuspensionForUserUuid, getUserCount, getUserFromUsername, updateUser } from "../../workers/dbWriter";
import type { User } from "../types/user";
import { handleApiNotFoundRoute } from "./util";

type AuthPayload = {
  username?: string;
  password?: string;
  country?: string;
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function publicUser(user: User) {
  const { auth, ...rest } = user;
  return rest;
}

async function readJsonBody(request: Request): Promise<AuthPayload | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return null;
  }

  try {
    return await request.json() as AuthPayload;
  } catch {
    return null;
  }
}

async function handleRegister(request: Request) {
  const body = await readJsonBody(request);

  if (!body?.username || !body.password) {
    return json({ error: "username and password are required" }, 400);
  }

  const existingUser = await getUserFromUsername(body.username);
  if (existingUser) {
    return json({ error: "username already exists" }, 409);
  }

  const now = new Date();
  const user: User = {
    uuid: crypto.randomUUID(),
    username: body.username,
    role: (await getUserCount()) === 0 ? "owner" : "user",
    auth: {
      passwordHash: createPasswordHash(body.password),
    },
    createdAt: now,
    lastActive: now,
    isStaff: false,
    country: body.country,
  };

  await createUser(user);

  const token = await issueToken(user);

  return json({ user: publicUser(user), token }, 201);
}

async function handleLogin(request: Request) {
  const body = await readJsonBody(request);

  if (!body?.username || !body.password) {
    return json({ error: "username and password are required" }, 400);
  }

  const user = await getUserFromUsername(body.username);
  if (!user || !verifyPassword(body.password, user.auth.passwordHash)) {
    return json({ error: "invalid username or password" }, 401);
  }

  const activeSuspension = await getActiveSuspensionForUserUuid(user.uuid);
  if (activeSuspension) {
    return Response.json(
      {
        error: "Account suspended",
        suspension: activeSuspension,
      },
      { status: 403 },
    );
  }

  user.lastActive = new Date();
  const token = await issueToken(user);

  return json({ user: publicUser(user), token });
}

const handleMe = requireAuth(async (_request, user) => {
  const activeSuspension = await getActiveSuspensionForUserUuid(user.uuid);

  return json({
    user: publicUser(user),
    suspension: activeSuspension,
  });
}, { allowSuspended: true });

const handleLogout = requireAuth(async (_request, user) => {
  clearToken(user);
  await updateUser(user);
  return new Response(null, { status: 204 });
}, { allowSuspended: true });

export function handleAuthRoute(request: Request) {
  const url = new URL(request.url);

  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    return handleRegister(request);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    return handleLogin(request);
  }

  if (request.method === "GET" && url.pathname === "/api/auth/me") {
    return handleMe(request);
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    return handleLogout(request);
  }

  return handleApiNotFoundRoute();
}
