const MAX_MISSION_NUMBER = 23;

const apiToMlMap: Map<string, string> = new Map();
const mlToApiMap: Map<string, string> = new Map();

for (let i = 1; i <= MAX_MISSION_NUMBER; i += 1) {
  const apiId = `mission-${i}`;
  const mlId = `M${String(i).padStart(3, '0')}`;
  apiToMlMap.set(apiId, mlId);
  mlToApiMap.set(mlId, apiId);
}

/**
 * ML → API id 변환 (예: M001 -> mission-1)
 */
export function mlIdToApiId(mlId: string | undefined | null): string | undefined {
  if (!mlId) return undefined;
  const normalized = mlId.toUpperCase();
  const mapped = mlToApiMap.get(normalized);
  if (mapped) return mapped;
  const match = normalized.match(/^M(\d{1,})$/);
  if (!match) return undefined;
  const num = parseInt(match[1], 10);
  return `mission-${num}`;
}

/**
 * API → ML id 변환 (예: mission-1 -> M001)
 */
export function apiIdToMlId(apiId: string | undefined | null): string | undefined {
  if (!apiId) return undefined;
  const normalized = apiId.toLowerCase();
  const mapped = apiToMlMap.get(normalized);
  if (mapped) return mapped;

  const match = normalized.match(/^mission-(\d{1,})$/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (Number.isNaN(num) || num <= 0) return undefined;
    return `M${String(num).padStart(3, '0')}`;
  }

  // 이미 ML 형식일 수도 있음
  const mlMatch = normalized.toUpperCase().match(/^M(\d{1,})$/);
  if (mlMatch) {
    const num = parseInt(mlMatch[1], 10);
    if (Number.isNaN(num) || num <= 0) return undefined;
    return `M${String(num).padStart(3, '0')}`;
  }

  return undefined;
}
