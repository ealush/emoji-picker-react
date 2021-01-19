import { useEffect, useContext, useRef } from 'react';
import { GROUP_NAME_RECENTLY_USED } from '../../lib/constants';
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
      typeof globalObject.IntersectionObserver !== 'undefined' &&
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
              if (id === GROUP_NAME_RECENTLY_USED) {
                const nextSibling = target.nextSibling;

                if (nextSibling) {
                  const id = nextSibling.getAttribute(PROPERTY_DATA_NAME);

                  dispatch({
                    type: actionTypes.ACTIVE_CATEGORY_SET,
                    activeCategory: id,
                  });
                }
              }
            } else if (!activeCategory) {
              dispatch({
                type: actionTypes.GROUP_SEEN_SET,
                group: id,
              });
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
        observer.current.observe(target);
      });

      return () => {
        observer.current.disconnect();
      };
    }
  }, [root.current, renderOne]);
};

export default useIntersectionObserver;
