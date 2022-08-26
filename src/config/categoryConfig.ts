import { DataGroups } from '../dataUtils/DataTypes';

function getConfigByCategory(category: DataGroups) {
  return configByCategory[category];
}

export enum Categories {
  SMILEYS_PEOPLE = 'smileys_people',
  ANIMALS_NATURE = 'animals_nature',
  FOOD_DRINK = 'food_drink',
  TRAVEL_PLACES = 'travel_places',
  ACTIVITIES = 'activities',
  OBJECTS = 'objects',
  SYMBOLS = 'symbols',
  FLAGS = 'flags'
}

const categoriesOrdered: Categories[] = [
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
  Categories.FOOD_DRINK,
  Categories.TRAVEL_PLACES,
  Categories.ACTIVITIES,
  Categories.OBJECTS,
  Categories.SYMBOLS,
  Categories.FLAGS
];

export const baseCategoriesConfig = categoriesOrdered.map(
  category => configByCategory[category]
);

export type CategoriesConfig = CategoryConfig[];

export type CategoryConfig = {
  category: Categories;
  name: string;
};

export type UserCategoryConfig = Array<DataGroups | CategoryConfig>;

const configByCategory: Record<Categories, CategoryConfig> = {
  [Categories.SMILEYS_PEOPLE]: {
    category: Categories.SMILEYS_PEOPLE,
    name: 'Smileys & People'
  },
  [Categories.ANIMALS_NATURE]: {
    category: Categories.ANIMALS_NATURE,
    name: 'Animals & Nature'
  },
  [Categories.FOOD_DRINK]: {
    category: Categories.FOOD_DRINK,
    name: 'Food & Drink'
  },
  [Categories.TRAVEL_PLACES]: {
    category: Categories.TRAVEL_PLACES,
    name: 'Travel & Places'
  },
  [Categories.ACTIVITIES]: {
    category: Categories.ACTIVITIES,
    name: 'Activities'
  },
  [Categories.OBJECTS]: {
    category: Categories.OBJECTS,
    name: 'Objects'
  },
  [Categories.SYMBOLS]: {
    category: Categories.SYMBOLS,
    name: 'Symbols'
  },
  [Categories.FLAGS]: {
    category: Categories.FLAGS,
    name: 'Flags'
  }
};

export function mergeCategoriesConfig(
  userCategoriesConfig: UserCategoryConfig = []
): CategoriesConfig {
  const base = baseCategoriesConfig;
  if (!userCategoriesConfig?.length) {
    return base;
  }

  return userCategoriesConfig.map(category => {
    if (typeof category === 'string') {
      return getConfigByCategory(category);
    }

    return {
      ...getConfigByCategory(category.category),
      ...category
    };
  });
}
