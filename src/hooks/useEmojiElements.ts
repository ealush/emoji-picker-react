import { usePickerMainRef } from '../components/contextProvider/PickerContextProvider';

export function useEmojiElements() {
  const { current } = usePickerMainRef();

  return current?.querySelectorAll('button.epr-emoji');
}
