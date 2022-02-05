import { useEffect, useRef } from 'react';
import { PROPERTY_DATA_NAME } from '../lib/constants';
import globalObject from '../lib/globalObject';
import { useSetActiveCategory, useSetSeenGroups } from '../PickerContext';

const useIntersectionObserver = (
  root,
  activeCategoryRef,
  filterResultRef,
  renderOne
) => {
  const observer = useRef(null);
  const setActiveCategory = useSetActiveCategory();
  const setSeenGroups = useSetSeenGroups();

  useEffect(() => {
    const refActiveCategory = activeCategoryRef.current;

    if (
      globalObject.IntersectionObserver !== undefined &&
      root.current &&
      !filterResultRef.current &&
      !renderOne
    ) {
      observer.current = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            const { target } = entry;
            const id = target.getAttribute(PROPERTY_DATA_NAME);
            if (entry.intersectionRatio === 0) {
              return;
            }
            setSeenGroups(id);
            if (!refActiveCategory) {
              setActiveCategory(id);
            }
          });
        },
        {
          root: root.current.parentElement,
        }
      );
    }
    if (observer.current) {
      [...root.current.querySelectorAll('.emoji-group')].forEach(target => {
        observer.current.observe(target, { threshold: 1 });
      });

      return () => {
        observer.current.disconnect();
      };
    }
  }, [root.current, renderOne]);
};

export default useIntersectionObserver;
