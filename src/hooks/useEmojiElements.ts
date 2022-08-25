import { usePickerMainRef } from '../components/context/PickerContext';

export function useEmojiElements() {
  const { current } = usePickerMainRef();

  return current?.querySelectorAll('button.epr-emoji');
}
