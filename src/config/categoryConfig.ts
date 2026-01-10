import {
  Categories,
  CategoryConfig,
  EmojiData,
  SuggestionMode,
} from '../types/exposedTypes';

export { Categories };

const categoriesOrdered: Categories[] = [
  Categories.SUGGESTED,
  Categories.CUSTOM,
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
  Categories.FOOD_DRINK,
  Categories.TRAVEL_PLACES,
  Categories.ACTIVITIES,
  Categories.OBJECTS,
  Categories.SYMBOLS,
  Categories.FLAGS,
];

export const SuggestedRecent: CategoryConfig = {
  name: 'Recently Used',
  category: Categories.SUGGESTED,
};

export type CustomCategoryConfig = {
  category: Categories.CUSTOM;
  name: string;
};

const configByCategory: Record<Categories, CategoryConfig> = {
  [Categories.SUGGESTED]: {
    category: Categories.SUGGESTED,
    name: 'Frequently Used',
  },
  [Categories.CUSTOM]: {
    category: Categories.CUSTOM,
    name: 'Custom Emojis',
  },
  [Categories.SMILEYS_PEOPLE]: {
    category: Categories.SMILEYS_PEOPLE,
    name: 'Smileys & People',
  },
  [Categories.ANIMALS_NATURE]: {
    category: Categories.ANIMALS_NATURE,
    name: 'Animals & Nature',
  },
  [Categories.FOOD_DRINK]: {
    category: Categories.FOOD_DRINK,
    name: 'Food & Drink',
  },
  [Categories.TRAVEL_PLACES]: {
    category: Categories.TRAVEL_PLACES,
    name: 'Travel & Places',
  },
  [Categories.ACTIVITIES]: {
    category: Categories.ACTIVITIES,
    name: 'Activities',
  },
  [Categories.OBJECTS]: {
    category: Categories.OBJECTS,
    name: 'Objects',
  },
  [Categories.SYMBOLS]: {
    category: Categories.SYMBOLS,
    name: 'Symbols',
  },
  [Categories.FLAGS]: {
    category: Categories.FLAGS,
    name: 'Flags',
  },
};

export function baseCategoriesConfig(
  modifiers?: Record<Categories, CategoryConfig>,
): CategoriesConfig {
  return categoriesOrdered.map((category) => {
    return {
      ...configByCategory[category],
      ...(modifiers && modifiers[category] && modifiers[category]),
    };
  });
}

export function categoryFromCategoryConfig(category: CategoryConfig) {
  return category.category;
}

export function categoryNameFromCategoryConfig(category: CategoryConfig) {
  return category.name;
}

export type CategoriesConfig = CategoryConfig[];

export type UserCategoryConfig = Array<Categories | CategoryConfig>;

export function mergeCategoriesConfig(
  userCategoriesConfig: UserCategoryConfig = [],
  modifiers: CategoryConfigModifiers = {},
  emojiData?: EmojiData,
): CategoriesConfig {
  const extra = ((): Record<Categories, CategoryConfig> => {
    // 1. Start with localized categories from emojiData
    const fromData = emojiData?.categories
      ? (Object.fromEntries(
          Object.entries(emojiData.categories).filter(([, config]) => !!config),
        ) as Record<Categories, CategoryConfig>)
      : ({} as Record<Categories, CategoryConfig>);

    // 2. Handle "Recently Used" override for explicit 'recent' mode
    if (modifiers.suggestionMode === SuggestionMode.RECENT) {
      const recentConfig = (
        emojiData?.categories as Record<string, CategoryConfig | undefined>
      )?.['suggested_recent'];
      fromData[Categories.SUGGESTED] = recentConfig
        ? { category: Categories.SUGGESTED, name: recentConfig.name }
        : SuggestedRecent;
    }

    return fromData;
  })();

  const base = baseCategoriesConfig(extra);

  if (!userCategoriesConfig?.length) {
    return base;
  }

  return userCategoriesConfig.map((category) => {
    if (typeof category === 'string') {
      return getBaseConfigByCategory(category, extra[category]);
    }

    return {
      ...getBaseConfigByCategory(category.category, extra[category.category]),
      ...category,
    };
  });
}

function getBaseConfigByCategory(
  category: Categories,
  modifier: CategoryConfig = {} as CategoryConfig,
) {
  return Object.assign(configByCategory[category], modifier);
}

type CategoryConfigModifiers = {
  suggestionMode?: SuggestionMode;
};
