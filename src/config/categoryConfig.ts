import { SuggestionMode } from '../types/public';

const CATEGORIES = [
  'suggested',
  'custom',
  'smileys_people',
  'animals_nature',
  'food_drink',
  'travel_places',
  'activities',
  'objects',
  'symbols',
  'flags'
] as const;

export type Category = typeof CATEGORIES[number];

export const SuggestedRecent: CategoryConfig = {
  name: 'Recently Used',
  category: 'suggested'
};

const configByCategory: Record<Category, CategoryConfig> = {
  suggested: {
    category: 'suggested',
    name: 'Frequently Used'
  },
  custom: {
    category: 'custom',
    name: 'Custom Emojis'
  },
  smileys_people: {
    category: 'smileys_people',
    name: 'Smileys & People'
  },
  animals_nature: {
    category: 'animals_nature',
    name: 'Animals & Nature'
  },
  food_drink: {
    category: 'food_drink',
    name: 'Food & Drink'
  },
  travel_places: {
    category: 'travel_places',
    name: 'Travel & Places'
  },
  activities: {
    category: 'activities',
    name: 'Activities'
  },
  objects: {
    category: 'objects',
    name: 'Objects'
  },
  symbols: {
    category: 'symbols',
    name: 'Symbols'
  },
  flags: {
    category: 'flags',
    name: 'Flags'
  }
};

export function baseCategoriesConfig(
  modifiers?: Record<Category, CategoryConfig>
): CategoriesConfig {
  return CATEGORIES.map(category => {
    return {
      ...configByCategory[category],
      ...(modifiers && modifiers[category] && modifiers[category])
    };
  });
}

export type CategoriesConfig = CategoryConfig[];

export type CategoryConfig = {
  category: Category;
  name: string;
};

export type UserCategoryConfig = Array<Category | CategoryConfig>;

export function mergeCategoriesConfig(
  userCategoriesConfig: UserCategoryConfig = [],
  modifiers: CategoryConfigModifiers = {}
): CategoriesConfig {
  const extra = {} as Record<Category, CategoryConfig>;

  if (modifiers.suggestionMode === 'recent') {
    extra['suggested'] = SuggestedRecent;
  }

  const base = baseCategoriesConfig(extra);
  if (!userCategoriesConfig?.length) {
    return base;
  }

  return userCategoriesConfig.map(category => {
    if (typeof category === 'string') {
      return getBaseConfigByCategory(category, extra[category]);
    }

    return {
      ...getBaseConfigByCategory(category.category, extra[category.category]),
      ...category
    };
  });
}

function getBaseConfigByCategory(
  category: Category,
  modifier: CategoryConfig = {} as CategoryConfig
) {
  return Object.assign(configByCategory[category], modifier);
}

type CategoryConfigModifiers = {
  suggestionMode?: SuggestionMode;
};
