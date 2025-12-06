export function userIdToMlId(userId?: string | null): string | undefined {
  if (!userId) return undefined;
  const match = /^user-(\d+)$/i.exec(userId);
  if (!match) return userId;
  const num = match[1];
  return `U${num.padStart(4, '0')}`;
}

export function mlIdToBackendId(mlId?: string | null): string | undefined {
  if (!mlId) return undefined;
  const match = /^U(\d{1,})$/i.exec(mlId);
  if (!match) return mlId;
  const num = match[1].replace(/^0+/, '') || '0';
  return `user-${num}`;
}
