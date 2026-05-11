export type PunishmentType = "suspension";

export type Punishment = {
  id: string;
  type: PunishmentType;
  userUuid: string;
  userUsername: string;
  reason: string;
  issuedByUuid: string;
  issuedByUsername: string;
  issuedAt: Date;
  startsAt: Date;
  endsAt: Date;
  liftedAt?: Date;
  liftedByUuid?: string;
  liftedByUsername?: string;
  liftedReason?: string;
};

export type SerialisedPunishment = {
  id: string;
  type: PunishmentType;
  userUuid: string;
  userUsername: string;
  reason: string;
  issuedByUuid: string;
  issuedByUsername: string;
  issuedAt: string;
  startsAt: string;
  endsAt: string;
  liftedAt?: string;
  liftedByUuid?: string;
  liftedByUsername?: string;
  liftedReason?: string;
};

export function serialisePunishment(punishment: Punishment): SerialisedPunishment {
  return {
    id: punishment.id,
    type: punishment.type,
    userUuid: punishment.userUuid,
    userUsername: punishment.userUsername,
    reason: punishment.reason,
    issuedByUuid: punishment.issuedByUuid,
    issuedByUsername: punishment.issuedByUsername,
    issuedAt: punishment.issuedAt.toISOString(),
    startsAt: punishment.startsAt.toISOString(),
    endsAt: punishment.endsAt.toISOString(),
    liftedAt: punishment.liftedAt?.toISOString(),
    liftedByUuid: punishment.liftedByUuid,
    liftedByUsername: punishment.liftedByUsername,
    liftedReason: punishment.liftedReason,
  };
}

export function unserialisePunishment(serialised: SerialisedPunishment): Punishment {
  return {
    id: serialised.id,
    type: serialised.type,
    userUuid: serialised.userUuid,
    userUsername: serialised.userUsername,
    reason: serialised.reason,
    issuedByUuid: serialised.issuedByUuid,
    issuedByUsername: serialised.issuedByUsername,
    issuedAt: new Date(serialised.issuedAt),
    startsAt: new Date(serialised.startsAt),
    endsAt: new Date(serialised.endsAt),
    liftedAt: serialised.liftedAt ? new Date(serialised.liftedAt) : undefined,
    liftedByUuid: serialised.liftedByUuid,
    liftedByUsername: serialised.liftedByUsername,
    liftedReason: serialised.liftedReason,
  };
}
