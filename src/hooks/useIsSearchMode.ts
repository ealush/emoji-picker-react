import { useSearchTermState } from '../components/contextProvider/PickerContextProvider';

export default function useIsSearchMode(): boolean {
  const [searchTerm] = useSearchTermState();

  return !!searchTerm;
}
