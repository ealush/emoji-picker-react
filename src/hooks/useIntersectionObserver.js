import { useEffect, useContext, useRef } from 'react';
import { PROPERTY_DATA_NAME } from '../lib/constants';
import { actionTypes, PickerContext } from '../lib/reducer';
import globalObject from '../lib/globalObject';

const useIntersectionObserver = (
  root,
  activeCategoryRef,
  filterResultRef,
  renderOne
) => {
  const observer = useRef(null);

  const { dispatch } = useContext(PickerContext);

  useEffect(() => {
    const activeCategory = activeCategoryRef.current;

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
            dispatch({
              type: actionTypes.GROUP_SEEN_SET,
              group: id,
            });
            if (!activeCategory) {
              dispatch({
                type: actionTypes.ACTIVE_CATEGORY_SET,
                activeCategory: id,
              });
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
