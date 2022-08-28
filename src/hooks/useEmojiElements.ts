import { usePickerMainRef } from '../components/context/ElementRefContext';

export function useEmojiElements() {
  const PickerMainRef = usePickerMainRef();

  return PickerMainRef.current?.querySelectorAll('button.epr-emoji');
}
