import { usePickerConfig } from '../components/context/PickerConfigContext';
import { isCustomCategory } from '../typeRefinements/typeRefinements';

export function useShouldHideCustomCategory() {
  const { categories } = usePickerConfig();

  const customCategory = categories.find(isCustomCategory);

  if (!customCategory) {
    return false;
  }

  return customCategory.emojis.length === 0;
}
