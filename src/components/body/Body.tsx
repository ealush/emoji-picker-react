import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';
import { useEffect, useRef } from 'react';

export function Body() {
  const bodyRef = useRef<null | HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // This seems to work well for detecting all category transitions via scroll
        for (const entry of entries) {
          if (bodyRef.current.scrollTop < entry.target.offsetTop) {
            // If the entry came into view, but is not the first visible entry
            // it probably means that there is another entry that's already sticky
            // DO NOTHING
            console.log(
              'I should probably ignore this',
              entry.target.textContent
            );
          } else {
            // Yeah, we're probably at the top
            console.log(
              'could be next?',
              entry.target.nextElementSibling?.textContent
            );
          }
        }
      },
      {
        threshold: [0, 1],
        rootMargin: '-1px 0px 0px 0px'
      }
    );
    bodyRef.current.querySelectorAll('.epr-emoji-category').forEach(el => {
      observer.observe(el);
    });
  }, []);

  return (
    <div className="epr-body" ref={bodyRef}>
      <EmojiList />
    </div>
  );
}
