import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  MOUSE_EVENT_SOURCE,
  useEmojiStyleConfig,
  useReactionsConfig,
  useAllowExpandReactions,
  useGetEmojiUrlConfig,
  useLabels,
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { resolveEntryId } from '../../dataUtils/suggestedEmojis';
import { useIsEmojiDisallowed } from '../../hooks/useDisallowedEmojis';
import { useMouseDownHandlers } from '../../hooks/useMouseDownHandlers';
import { useRegisterRegion } from '../../hooks/useRegisterRegion';
import { useDefaultAppearance } from '../../primitives/appearance';
import { usePickerComponents } from '../../primitives/components';
import {
  filterPrimitiveProps,
  useMergedRefs,
} from '../../primitives/nativeProps';
import { useRootScope } from '../../primitives/scope';
import { EmojiStyle } from '../../types/exposedTypes';
import { useReactionsRef } from '../context/ElementRefContext';
import { useReactionsModeState } from '../context/PickerContext';
import { usePickerDataContext } from '../context/PickerDataContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { BtnPlus } from './BtnPlus';

// Memoized: a direct child of the per-keystroke-rerendering Root aside.
// Props never change (none); context slices resubscribe on real changes,
// so typing never rerenders the bar while reactions state is untouched.
export type ReactionsProps = Omit<
  React.HTMLAttributes<HTMLUListElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
>;
const ReactionsImpl = /* @__PURE__ */ React.forwardRef<
  HTMLUListElement,
  ReactionsProps
>(function Reactions(allProps: ReactionsProps, ref) {
  const { className, ...props } = allProps;
  const inScope = useRootScope('Reactions');
  const appearance = useDefaultAppearance();
  const { Emoji: CustomEmoji } = usePickerComponents();
  const decorated = appearance && !CustomEmoji;
  const [reactionsOpen] = useReactionsModeState();
  const ReactionsRef = useReactionsRef();
  const mergedRef = useMergedRefs(ref, ReactionsRef);
  const reactions = useReactionsConfig();
  useMouseDownHandlers(ReactionsRef, MOUSE_EVENT_SOURCE.REACTIONS);
  const emojiStyle = useEmojiStyleConfig();
  const allowExpandReactions = useAllowExpandReactions();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const { emojiByUnified } = usePickerDataContext();
  const labels = useLabels();
  const isEmojiDisallowed = useIsEmojiDisallowed();

  // Registered before the closed-mode early return so collapsing the full
  // picker registers the bar and expanding unregisters it.
  useRegisterRegion('reactions', ReactionsRef, [reactionsOpen]);

  if (!inScope || !reactionsOpen) {
    return null;
  }

  return (
    <ul
      {...filterPrimitiveProps(props, ['role'])}
      className={cx(styles.list, className)}
      ref={mergedRef}
      aria-label={labels.reactions}
      data-epr-part="reactions"
    >
      {reactions.map((reaction, index) => {
        // Reaction identifiers use the same shared Root lookup as the
        // picker, normalized case-insensitively (V4_API_MATRIX.md §2).
        const raw =
          typeof reaction === 'string' ? reaction.trim().toLowerCase() : '';
        // Emoji characters resolve like suggestedEmojis entries.
        const normalized = resolveEntryId(raw, emojiByUnified) || raw;
        const emoji = normalized ? emojiByUnified(normalized) : undefined;

        if (
          !emoji ||
          (emojiStyle === EmojiStyle.NATIVE &&
            isEmojiDisallowed(emoji, normalized))
        ) {
          return null;
        }

        return (
          <li key={`${index}:${normalized}`} data-epr-part="reaction">
            <ClickableEmoji
              emoji={emoji as DataEmoji}
              emojiStyle={emojiStyle}
              unified={normalized}
              showVariations={false}
              className={cx(decorated && styles.emojiButton)}
              buttonClassName={cx(decorated && styles.reactionButton)}
              noBackground
              getEmojiUrl={getEmojiUrl}
            />
          </li>
        );
      })}
      {allowExpandReactions ? (
        <li>
          <BtnPlus />
        </li>
      ) : null}
    </ul>
  );
});
export const Reactions = /* @__PURE__ */ React.memo(ReactionsImpl);


const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    list: {
      listStyle: 'none',
      margin: '0',
      padding: '0 5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '100%',
    },
    reactionButton: {
      // Every picker button sets outline: none, and reaction buttons also
      // suppress the focus background, so keyboard focus was invisible.
      // Focus mirrors the hover treatment (scale plus a soft circular
      // wash, no outline ring): the scale transform on the inner image
      // alone is clipped by the button's overflow: hidden, and does
      // nothing on inline native emoji, so the button itself carries the
      // effect. Scoped to the reactions bar so grid focus treatment is
      // untouched.
      // https://github.com/ealush/emoji-picker-react/issues/473
      ':focus-visible': {
        transform: 'scale(1.2)',
        transition:
          'background-color 0.2s, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.5)',
        backgroundColor: 'var(--epr-hover-bg-color-reduced-opacity)',
        borderRadius: '50%',
        outline: 'none',
      },
    },
    emojiButton: {
      ':hover': {
        transform: 'scale(1.2)',
      },
      ':focus': {
        transform: 'scale(1.2)',
      },
      ':active': {
        transform: 'scale(1.1)',
      },
      transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.5)',
    },
  }))();
