import { useEffect } from 'react';
import { actionTypes } from '../lib/reducer';
import globalObject from '../lib/globalObject/';

let observer;

const useIntersectionObserver = (root, filter, state, dispatch) => {

    useEffect(() => {
        if (typeof globalObject.IntersectionObserver !== 'undefined' && !observer && root.current) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const { target } = entry;
                    const id = target.getAttribute('data-id');
                    if (entry.intersectionRatio === 0) {
                        if (id === state.activeCategory) {
                            dispatch({
                                type: actionTypes.ACTIVE_CATEGORY_SET,
                                activeCategory: null
                            });
                        }

                    } else if (!state.activeCategory) {
                        dispatch({
                            type: actionTypes.GROUP_SEEN_SET,
                            group: id
                        });
                        dispatch({
                            type: actionTypes.ACTIVE_CATEGORY_SET,
                            activeCategory: id
                        });
                    }
                });
            }, {
                root: root.current.parentElement
            });
        }

        observer.disconnect();

        if (!root || !root.current) {
            return;
        }

        [...root.current.querySelectorAll('.emoji-group')].forEach((target) => {
            observer.observe(target);
        });

    }, [ root.current, filter ]);
};

export default useIntersectionObserver;
