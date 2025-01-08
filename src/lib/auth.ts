import { AuthSession } from '@supabase/supabase-js';

// 세션 타입을 구분하기 위한 상수
export const SESSION_TYPES = {
  NORMAL: 'normal',
  RECOVERY: 'recovery',
} as const;

// 세션 타입을 저장하기 위한 키
const SESSION_TYPE_KEY = 'auth_session_type';

export function setSessionType(type: keyof typeof SESSION_TYPES) {
  sessionStorage.setItem(SESSION_TYPE_KEY, type);
}

export function getSessionType(): string {
  return sessionStorage.getItem(SESSION_TYPE_KEY) || SESSION_TYPES.NORMAL;
}

export function clearSessionType() {
  sessionStorage.removeItem(SESSION_TYPE_KEY);
}

export function isRecoverySession(session: AuthSession | null): boolean {
  return getSessionType() === SESSION_TYPES.RECOVERY;
}