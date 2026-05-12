import type { User } from '../../../../common';
import { requireAuth } from '../auth';
import { normalizeCountryCode, getSupportedCountries } from '../../lib/country';
import { updateUser } from '../../workers/dbWriter';
import { handleApiNotFoundRoute } from './util';

type CountryUpdatePayload = {
  country?: string;
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function publicUser(user: User) {
  const { auth, ...rest } = user;
  return rest;
}

const handleMe = requireAuth(async (_request, user) => {
  return json({ user: publicUser(user) });
}, { allowSuspended: true });

const handleCountries = requireAuth(async () => {
  return json({ countries: getSupportedCountries() });
}, { allowSuspended: true });

const handleCountryUpdate = requireAuth(async (request, user) => {
  let body: CountryUpdatePayload | null = null;
  try {
    body = await request.json() as CountryUpdatePayload;
  } catch {
    body = null;
  }

  if (typeof body?.country !== 'string') {
    return json({ error: 'country is required' }, 400);
  }

  const countryCode = normalizeCountryCode(body.country);
  if (!countryCode) {
    return json({ error: 'country must be a valid ISO 3166-1 alpha-2 code' }, 400);
  }

  user.country = countryCode;
  await updateUser(user);

  return json({ user: publicUser(user) });
}, { allowSuspended: true });

export function handleProfileRoute(request: Request) {
  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/api/profile/me') {
    return handleMe(request);
  }

  if (request.method === 'GET' && url.pathname === '/api/profile/countries') {
    return handleCountries(request);
  }

  if (request.method === 'PATCH' && url.pathname === '/api/profile/country') {
    return handleCountryUpdate(request);
  }

  return handleApiNotFoundRoute();
}
