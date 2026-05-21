// Rate limiter pour éviter les tentatives d'inscription répétées
const AUTH_ATTEMPT_CACHE = 'auth_attempt_cache';

interface AuthAttempt {
  email: string;
  timestamp: number;
}

const RATE_LIMIT_DURATION_MS = 60000; // 60 secondes

export function canAttemptAuth(email: string): boolean {
  try {
    const cached = localStorage.getItem(AUTH_ATTEMPT_CACHE);
    if (!cached) return true;
    
    const attempt: AuthAttempt = JSON.parse(cached);
    const now = Date.now();
    
    // Même email dans la fenêtre de temps
    if (attempt.email === email && now - attempt.timestamp < RATE_LIMIT_DURATION_MS) {
      return false;
    }
    
    return true;
  } catch {
    return true;
  }
}

export function recordAuthAttempt(email: string): void {
  try {
    const attempt: AuthAttempt = {
      email,
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_ATTEMPT_CACHE, JSON.stringify(attempt));
  } catch {
    // Ignorer les erreurs localStorage
  }
}

export function getRemainingWaitTime(email: string): number {
  try {
    const cached = localStorage.getItem(AUTH_ATTEMPT_CACHE);
    if (!cached) return 0;
    
    const attempt: AuthAttempt = JSON.parse(cached);
    const now = Date.now();
    
    if (attempt.email === email) {
      const remaining = RATE_LIMIT_DURATION_MS - (now - attempt.timestamp);
      return Math.max(0, remaining);
    }
    
    return 0;
  } catch {
    return 0;
  }
}
