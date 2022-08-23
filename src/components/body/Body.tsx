import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';
import { useEffect, useRef } from 'react';
import { useActiveCategoryState } from '../contextProvider/PickerContextProvider';

export function Body() {
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
            // This seems to be doing it when scrolling up
            categoryToSet = entry.target.getAttribute('data-name');
          } else if (
            isTargetWithinScrollArea(
              entry.target.nextElementSibling as HTMLElement,
              refCurrent
            )
          ) {
            // Yeah, we're probably at the top
            categoryToSet = entry.target.nextElementSibling?.getAttribute(
              'data-name'
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
        rootMargin: '-165px 0px 0px 0px'
        // compensate for the header and sticky category
        //FIXME: this is a hack, need to understand why this exact number
      }
    );
    bodyRef.current?.querySelectorAll('.epr-emoji-category').forEach(el => {
      observer.observe(el);
    });
  }, []);

  return (
    <div className="epr-body" ref={bodyRef}>
      <EmojiList />
    </div>
  );
}

function isTargetWithinScrollArea(
  target: HTMLElement,
  scrollRoot: HTMLElement
) {
  const bodyHeight = scrollRoot.clientHeight;

  return (
    scrollRoot.scrollTop + bodyHeight - (target as HTMLElement)?.offsetTop <
    bodyHeight
  );
}
