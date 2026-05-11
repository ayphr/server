import { requireRole } from "../auth";
import { getUserCount, getUserFromUuid, getUsers, getUsersByRole, updateUserRole } from "../../workers/dbWriter";
import type { UserRole } from "../types/user";
import { handleApiNotFoundRoute } from "./util";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

const handleOwnerSummary = requireRole("owner", async () => {
  const [users, staffUsers, ownerUsers] = await Promise.all([
    getUserCount(),
    getUsersByRole("staff"),
    getUsersByRole("owner"),
  ]);

  return json({
    userCount: users,
    staffCount: staffUsers.length,
    ownerCount: ownerUsers.length,
  });
});

const handleOwnerUsers = requireRole("owner", async () => {
  const users = await getUsers();
  return json({ users });
});

const handleOwnerRoleUpdate = requireRole("owner", async (request) => {
  const url = new URL(request.url);
  const targetUuid = url.pathname.split("/")[4];

  if (!targetUuid) {
    return json({ error: "user uuid is required" }, 400);
  }

  let body: { role?: UserRole } | null = null;
  try {
    body = await request.json() as { role?: UserRole };
  } catch {
    body = null;
  }

  if (!body?.role || !["user", "staff", "owner"].includes(body.role)) {
    return json({ error: "role must be user, staff, or owner" }, 400);
  }

  const targetUser = await getUserFromUuid(targetUuid);
  if (!targetUser) {
    return json({ error: "user not found" }, 404);
  }

  if (targetUser.role === "owner" && body.role !== "owner") {
    const ownerUsers = await getUsersByRole("owner");
    if (ownerUsers.length <= 1) {
      return json({ error: "cannot remove the last owner" }, 409);
    }
  }

  const updatedUser = await updateUserRole(targetUuid, body.role);
  if (!updatedUser) {
    return json({ error: "user not found" }, 404);
  }

  return json({ user: updatedUser });
});

export function handleOwnerRoute(request: Request) {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/owner/summary") {
    return handleOwnerSummary(request);
  }

  if (request.method === "GET" && url.pathname === "/api/owner/users") {
    return handleOwnerUsers(request);
  }

  if (request.method === "PATCH" && url.pathname.startsWith("/api/owner/users/") && url.pathname.endsWith("/role")) {
    return handleOwnerRoleUpdate(request);
  }

  return handleApiNotFoundRoute();
}
