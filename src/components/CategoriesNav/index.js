import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { PROPERTY_DATA_NAME } from '../../lib/constants';
import { actionTypes, PickerContext } from '../../lib/reducer';
import groups from '../../groups.json';
import './style.css';

const CategoriesNav = ({ emojiListRef }) => {
    const { state: { activeCategory, filter }, dispatch } = useContext(PickerContext);

    let inactive = false;

    if (filter && filter.length) {
        inactive = true;
    }

    const handleClick = ({ target }) => {

        if (inactive) {
            return;
        }

        const id = target.getAttribute(PROPERTY_DATA_NAME);

        if (!emojiListRef || !emojiListRef.current || !id) {
            return;
        }

        dispatch({
            type: actionTypes.ACTIVE_CATEGORY_SET,
            activeCategory: id
        });
        dispatch({
            type: actionTypes.GROUP_SEEN_SET,
            group: id
        });

        const { current } = emojiListRef;
        const category = current.querySelector(`[${PROPERTY_DATA_NAME}="${id}"]`);

        current.scrollTop = category.offsetTop;
    };

    return (
        <nav onClick={handleClick} className={cn('emoji-categories', { inactive })}>{
            groups.map((group) => (
                <button key={group}
                    type="button"
                    className={cn(`icn-${group.replace(' & ', '_')}`, { active: activeCategory === group })}
                    data-name={group}/>
            ))
        }</nav>
    );
};

export default CategoriesNav;

CategoriesNav.propTypes = {
    emojiListRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
};
