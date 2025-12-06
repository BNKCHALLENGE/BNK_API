export function mlIdToApiId(mlId: string | undefined | null): string | undefined {
  if (!mlId) return undefined;
  return mlId.toLowerCase().replace(/^m0*/, 'mission-');
}

export function apiIdToMlId(apiId: string | undefined | null): string | undefined {
  if (!apiId) return undefined;
  // expect formats like mission-1, mission-01; strip prefix and pad to 3 digits
  const normalized = apiId.toLowerCase().replace(/^mission-/, '');
  const numeric = normalized.replace(/^0+/, '');
  const numPart = numeric || '0';
  return `M${numPart.padStart(3, '0')}`;
}
