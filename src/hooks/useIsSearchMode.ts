import { useSearchTermState } from '../components/context/PickerContext';

export default function useIsSearchMode(): boolean {
  const [searchTerm] = useSearchTermState();

  return !!searchTerm;
}
