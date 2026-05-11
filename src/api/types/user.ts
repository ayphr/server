export type UserRole = "user" | "staff" | "owner";

export type User = {
  uuid: string;
  username: string;
  role: UserRole;
  auth: {
    token?: string;
    issuedAt?: Date;
    passwordHash?: string;
  };
  createdAt: Date;
  lastActive: Date;
  credits?: number;
  country?: string;
};

export type SerialisedUser = {
  uuid: string;
  username: string;
  role?: UserRole;
  auth: {
    token?: string;
    issuedAt?: string;
    passwordHash?: string;
  };
  createdAt: string;
  lastActive: string;
  credits?: number;
  country?: string;
};

export function serialiseUser(user: User): SerialisedUser {
  return {
    uuid: user.uuid,
    username: user.username,
    role: user.role,
    auth: {
      token: user.auth.token,
      issuedAt: user.auth.issuedAt?.toISOString(),
      passwordHash: user.auth.passwordHash,
    },
    createdAt: user.createdAt.toISOString(),
    lastActive: user.lastActive.toISOString(),
    credits: user.credits ?? 0,
    country: user.country
  }
}

export function unserialiseUser(serialised: SerialisedUser): User {
  const role = serialised.role ?? "user";

  return {
    uuid: serialised.uuid,
    username: serialised.username,
    role,
    auth: {
      token: serialised.auth.token,
      issuedAt: serialised.auth.issuedAt ? new Date(serialised.auth.issuedAt) : undefined,
      passwordHash: serialised.auth.passwordHash,
    },
    createdAt: new Date(serialised.createdAt),
    lastActive: new Date(serialised.lastActive),
    credits: serialised.credits ?? 0,
    country: serialised.country
  }
}
