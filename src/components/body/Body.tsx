import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';
import { useEffect, useRef } from 'react';
import { useActiveCategoryState } from '../contextProvider/PickerContextProvider';

interface Props { 
  emojiListRef: any;
}

export function Body({emojiListRef}: Props) {
  const bodyRef = useRef<null | HTMLDivElement>(null);
  const [, setActiveCategory] = useActiveCategoryState();
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const refCurrent = bodyRef.current;
        if (!refCurrent) {
          return;
        }

        let categoryToSet = null;

        // This seems to work well for detecting all category transitions via scroll
        for (const entry of entries) {
          if (refCurrent.scrollTop < (entry.target as HTMLElement).offsetTop) {
            // If the entry came into view, but is not the first visible entry
            // it probably means that there is another entry that's already sticky
            // DO NOTHING
          } else if (entry.isIntersecting) {
            categoryToSet = entry.target.getAttribute('data-name');
            // This seems to be doing it when scrolling up
            console.log('could be next?', entry.target?.textContent);
          } else if (
            isTargetWithinScrollArea(
              entry.target.nextElementSibling as HTMLElement,
              refCurrent
            )
          ) {
            categoryToSet = entry.target.nextElementSibling?.getAttribute(
              'data-name'
            );
            // Yeah, we're probably at the top
            console.log(
              'could be next?',
              entry.target.nextElementSibling?.textContent
            );
          }

          if (categoryToSet) {
            setActiveCategory(categoryToSet);
            break;
          }
        }
      },
      {
        threshold: [0, 1],
        rootMargin: '-140px 0px 0px 0px' // compensate for the header
      }
    );
    bodyRef.current?.querySelectorAll('.epr-emoji-category').forEach(el => {
      observer.observe(el);
    });
  }, []);

  return (
    <div className="epr-body" ref={bodyRef}>
      <EmojiList emojiListRef={emojiListRef}/>
    </div>
  );
}

function isTargetWithinScrollArea(
  target: HTMLElement,
  scrollRoot: HTMLElement
) {
  const bodyHeight = scrollRoot.clientHeight;

  return (
    scrollRoot.scrollTop + bodyHeight - target?.offsetTop < bodyHeight
  );
}
