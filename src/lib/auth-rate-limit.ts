// Rate limiter - Deactivated for immediate retries and better UX
export function canAttemptAuth(email: string): boolean {
  // Cooldown disabled: users can retry immediately
  return true;
}

export function recordAuthAttempt(email: string): void {
  // No-op: record nothing to prevent localStorage lockouts
}

export function getRemainingWaitTime(email: string): number {
  // Always return 0 seconds remaining
  return 0;
}
