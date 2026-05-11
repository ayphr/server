import { randomUUID } from "node:crypto";
import { requireRole } from "../auth";
import { createPunishment, getPunishmentById, getPunishmentsByType, getUserFromUsername, getUserFromUuid, getUsers, updatePunishment } from "../../workers/dbWriter";
import type { Punishment } from "../types/punishment";
import type { User } from "../types/user";
import { handleApiNotFoundRoute } from "./util";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function publicUser(user: User) {
  const { auth, ...rest } = user;
  return rest;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return null;
  }

  try {
    return await request.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

const handleStaffUsers = requireRole("staff", async () => {
  const users = await getUsers();
  return json({ users: users.map(publicUser) });
});

const handleStaffPunishments = requireRole("staff", async (request, staffUser) => {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const punishments = await getPunishmentsByType("suspension");
    return json({ punishments });
  }

  if (request.method === "POST" && url.pathname.startsWith("/api/staff/punishments/") && url.pathname.endsWith("/lift")) {
    const punishmentId = url.pathname.split("/")[4];
    const punishment = await getPunishmentById(punishmentId);
    if (!punishment) {
      return json({ error: "punishment not found" }, 404);
    }

    punishment.liftedAt = new Date();
    punishment.liftedByUuid = staffUser.uuid;
    punishment.liftedByUsername = staffUser.username;
    await updatePunishment(punishment);

    return json({ punishment });
  }

  if (request.method === "POST") {
    const body = await readJsonBody(request);
    const targetUsername = typeof body?.username === "string" ? body.username : undefined;
    const targetUuid = typeof body?.userUuid === "string" ? body.userUuid : undefined;
    const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
    const durationMinutes = typeof body?.durationMinutes === "number" ? body.durationMinutes : 60;

    if (!reason) {
      return json({ error: "reason is required" }, 400);
    }

    const targetUser = targetUuid ? await getUserFromUuid(targetUuid) : targetUsername ? await getUserFromUsername(targetUsername) : null;
    if (!targetUser) {
      return json({ error: "target user not found" }, 404);
    }

    if (targetUser.role === "owner") {
      return json({ error: "owners cannot be suspended" }, 403);
    }

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return json({ error: "durationMinutes must be a positive number" }, 400);
    }

    const now = new Date();
    const punishment: Punishment = {
      id: randomUUID(),
      type: "suspension",
      userUuid: targetUser.uuid,
      userUsername: targetUser.username,
      reason,
      issuedByUuid: staffUser.uuid,
      issuedByUsername: staffUser.username,
      issuedAt: now,
      startsAt: now,
      endsAt: new Date(now.getTime() + durationMinutes * 60 * 1000),
    };

    await createPunishment(punishment);

    return json({ punishment }, 201);
  }

  return handleApiNotFoundRoute();
});

export function handleStaffRoute(request: Request) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/staff/users") {
    return handleStaffUsers(request);
  }

  if ((request.method === "GET" || request.method === "POST") && url.pathname.startsWith("/api/staff/punishments")) {
    return handleStaffPunishments(request);
  }

  return handleApiNotFoundRoute();
}
