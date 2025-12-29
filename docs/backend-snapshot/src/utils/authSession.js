const AUTH_COOKIE_NAME = 'ww_auth';

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [name, ...valueParts] = part.split('=');
      if (!name) return acc;

      const value = valueParts.join('=');
      try {
        acc[name] = decodeURIComponent(value);
      } catch (_error) {
        acc[name] = value;
      }
      return acc;
    }, {});
}

function decodeSession(rawValue) {
  if (!rawValue) return null;

  try {
    const decoded = Buffer.from(rawValue, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);

    if (parsed && typeof parsed.id === 'string' && parsed.id && typeof parsed.role === 'string') {
      return { id: parsed.id, role: parsed.role };
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function encodeSession({ id, role }) {
  return Buffer.from(JSON.stringify({ id, role })).toString('base64');
}

export function readAuthSession(req) {
  const cookies = parseCookies(req.headers?.cookie ?? '');
  return decodeSession(cookies[AUTH_COOKIE_NAME]);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };
}

export function persistAuthSession(res, user) {
  if (!user?.id || !user?.role) return;

  const value = encodeSession({ id: user.id, role: user.role });
  res.cookie(AUTH_COOKIE_NAME, value, cookieOptions());
}

export function clearAuthSession(res) {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
}
