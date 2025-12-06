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
  // Additional mappings for API spec alignment
  exhibition: 'exhibition',
  exercise: 'exercise',
};

const API_TO_ML_CATEGORY: Record<string, string> = Object.entries(ML_TO_API_CATEGORY).reduce(
  (acc, [ml, api]) => {
    acc[api] = ml;
    return acc;
  },
  {
    // manual overrides and additions
    exercise: 'Sports',
    exhibition: 'Culture',
  } as Record<string, string>,
);

export function toApiCategory(mlCategory?: string | null): string | undefined {
  if (!mlCategory) return undefined;
  return ML_TO_API_CATEGORY[mlCategory] ?? mlCategory.toLowerCase();
}

export function toMlCategory(apiCategory?: string | null): string | undefined {
  if (!apiCategory) return undefined;
  return API_TO_ML_CATEGORY[apiCategory] ?? apiCategory;
}

export const CATEGORY_MAPPINGS = {
  mlToApi: ML_TO_API_CATEGORY,
  apiToMl: API_TO_ML_CATEGORY,
};
