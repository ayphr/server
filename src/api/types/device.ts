export type Device = {
  serial: number; // unsigned 32-bit
  ownerUuid: string;
  ownerUsername: string;
  registeredAt: Date;
  lastBroadcastedAt?: Date;
  metadata?: Record<string, unknown>;
  location: { type: 'Point'; coordinates: [number, number] };
};

export type SerialisedDevice = {
  serial: number;
  ownerUuid: string;
  ownerUsername: string;
  registeredAt: string;
  lastBroadcastedAt?: string;
  metadata?: Record<string, unknown>;
  location: { type: 'Point'; coordinates: [number, number] };
};

export function serialiseDevice(device: Device): SerialisedDevice {
  return {
    serial: device.serial,
    ownerUuid: device.ownerUuid,
    ownerUsername: device.ownerUsername,
    registeredAt: device.registeredAt.toISOString(),
    lastBroadcastedAt: device.lastBroadcastedAt?.toISOString(),
    metadata: device.metadata,
    location: device.location,
  };
}

export function unserialiseDevice(serialised: SerialisedDevice): Device {
  return {
    serial: serialised.serial,
    ownerUuid: serialised.ownerUuid,
    ownerUsername: serialised.ownerUsername,
    registeredAt: new Date(serialised.registeredAt),
    lastBroadcastedAt: serialised.lastBroadcastedAt ? new Date(serialised.lastBroadcastedAt) : undefined,
    metadata: serialised.metadata,
    location: serialised.location,
  };
}
