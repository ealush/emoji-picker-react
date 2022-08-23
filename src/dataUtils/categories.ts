import groups from '../data/groups';
import { DataGroups } from './DataTypes';

const categories: DataGroups[] = groups as DataGroups[];

export const categoryNames: Record<DataGroups, string> = {
  smileys_people: 'smileys & people',
  animals_nature: 'animals & nature',
  food_drink: 'food & drink',
  travel_places: 'travel & places',
  activities: 'activities',
  objects: 'objects',
  symbols: 'symbols',
  flags: 'flags'
};

export default categories;
