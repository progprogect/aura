# 🔧 QUICK FIX: Обновление типов для consistency

## Проблема
В `src/lib/auth/types.ts` используются устаревшие названия полей (`specialistId` вместо `userId`).

## Решение (5 минут)

### Обновить интерфейсы:

```typescript
// БЫЛО:
export interface AuthSession {
  id: string
  specialistId: string  // ❌
  sessionToken: string
  // ...
}

// СТАЛО:
export interface AuthSession {
  id: string
  userId: string  // ✅
  sessionToken: string
  // ...
}

// БЫЛО:
export interface SocialAccount {
  id: string
  specialistId: string  // ❌
  provider: AuthProvider
  // ...
}

// СТАЛО:
export interface SocialAccount {
  id: string
  userId: string  // ✅
  provider: AuthProvider
  // ...
}
```

### Обновить SessionData:

```typescript
// БЫЛО:
export interface SessionData {
  specialistId: string  // ❌
  sessionToken: string
  // ...
}

// СТАЛО:
export interface SessionData {
  userId: string  // ✅
  sessionToken: string
  // ...
}
```

---

**Приоритет:** P2 (желательно, но не критично)  
**Время:** 5 минут  
**Влияние:** Улучшение naming consistency

