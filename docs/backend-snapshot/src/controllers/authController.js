import { authenticateUser } from '../services/authService.js';
import { findParentById } from '../services/parentsService.js';
import { findCaregiverById } from '../services/caregiversService.js';
import { clearAuthSession, persistAuthSession, readAuthSession } from '../utils/authSession.js';

export async function loginController(req, res) {
  const { identifier, password } = req.body || {};

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Benutzername oder Passwort fehlen.' });
  }

  try {
    const user = await authenticateUser(identifier, password);
    persistAuthSession(res, user);
    res.json(user);
  } catch (error) {
    console.error('Failed to authenticate user', error);
    const status = error.status || 500;
    res.status(status).json({ message: error.message || 'Anmeldung fehlgeschlagen.' });
  }
}

export async function currentUserController(req, res) {
  const session = readAuthSession(req);
  if (!session?.id || !session?.role) {
    clearAuthSession(res);
    return res.status(401).json({ message: 'Nicht angemeldet.' });
  }

  try {
    if (session.role === 'parent') {
      const parent = await findParentById(session.id);
      if (parent) {
        const user = { ...parent, role: session.role };
        persistAuthSession(res, user);
        return res.json(user);
      }
    }

    if (session.role === 'caregiver') {
      const caregiver = await findCaregiverById(session.id);
      if (caregiver) {
        const user = { ...caregiver, role: session.role };
        persistAuthSession(res, user);
        return res.json(user);
      }
    }

    clearAuthSession(res);
    return res.status(404).json({ message: 'Nutzer konnte nicht gefunden werden.' });
  } catch (error) {
    console.error('Failed to load current user', error);
    return res.status(500).json({ message: 'Konnte aktuellen Nutzer nicht laden.' });
  }
}
