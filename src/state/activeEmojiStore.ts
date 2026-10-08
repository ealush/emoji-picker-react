import type { ActiveEmojiState } from '../components/context/PickerContext';

/** Instance-local subscriptions: changing hover updates only affected cells. */
export function createActiveEmojiStore() {
  let value: ActiveEmojiState = null;
  const readers = new Set<() => void>();
  const cells = new Map<string, Set<() => void>>();
  return {
    get: () => value,
    set(
      next:
        ActiveEmojiState | ((previous: ActiveEmojiState) => ActiveEmojiState),
    ) {
      const previous = value;
      const resolved = typeof next === 'function' ? next(previous) : next;
      if (
        previous?.unified === resolved?.unified &&
        previous?.originalUnified === resolved?.originalUnified
      )
        return;
      value = resolved;
      readers.forEach((read) => read());
      new Set([previous?.unified, resolved?.unified]).forEach((key) => {
        if (key) cells.get(key)?.forEach((read) => read());
      });
    },
    subscribe(read: () => void, unified?: string) {
      const group = unified
        ? (cells.get(unified) ?? new Set<() => void>())
        : readers;
      if (unified) cells.set(unified, group);
      group.add(read);
      return () => {
        group.delete(read);
        if (unified && group.size === 0) cells.delete(unified);
      };
    },
  };
}
