const ML_TO_API_CATEGORY: Record<string, string> = {
  Food: 'food',
  Cafe: 'cafe',
  Tourist: 'tour',
  Culture: 'culture',
  Festival: 'festival',
  Walk: 'walk',
  Shopping: 'shopping',
  'Self-Dev': 'study',
  Sports: 'sports',
};

// Canonical API categories stored in DB; includes common synonyms from the app.
const API_CATEGORY_CANON: Record<string, string> = {
  food: 'food',
  cafe: 'cafe',
  tour: 'tour',
  culture: 'culture',
  festival: 'festival',
  walk: 'walk',
  shopping: 'shopping',
  study: 'study',
  sports: 'sports',
  exercise: 'sports', // synonym → sports missions
  exhibition: 'culture', // synonym → culture missions
};

const API_TO_ML_CATEGORY: Record<string, string> = {
  exercise: 'Sports',
  exhibition: 'Culture',
};

for (const [ml, api] of Object.entries(ML_TO_API_CATEGORY)) {
  if (!(api in API_TO_ML_CATEGORY)) {
    API_TO_ML_CATEGORY[api] = ml;
  }
}

export function toApiCategory(mlCategory?: string | null): string | undefined {
  if (!mlCategory) return undefined;
  return ML_TO_API_CATEGORY[mlCategory] ?? mlCategory.toLowerCase();
}

export function toMlCategory(apiCategory?: string | null): string | undefined {
  const normalized = normalizeApiCategory(apiCategory);
  if (!normalized) return undefined;
  return API_TO_ML_CATEGORY[normalized] ?? normalized;
}

export const CATEGORY_MAPPINGS = {
  mlToApi: ML_TO_API_CATEGORY,
  apiToMl: API_TO_ML_CATEGORY,
  apiCanonical: API_CATEGORY_CANON,
};

export function normalizeApiCategory(apiCategory?: string | null): string | undefined {
  if (!apiCategory) return undefined;
  const key = apiCategory.toLowerCase();
  return API_CATEGORY_CANON[key] ?? key;
}
