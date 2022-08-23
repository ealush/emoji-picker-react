import { categoryNames } from './categories';
import { DataGroups } from './DataTypes';

export function categoryName(category: DataGroups): string {
  return categoryNames[category];
}
