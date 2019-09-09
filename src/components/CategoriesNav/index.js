import React, { useContext } from 'react';
import cn from 'classnames';
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

        const id = target.getAttribute('data-id');

        if (!emojiListRef || !emojiListRef.current || !id) {
            return;
        }

        dispatch({
            type: actionTypes.ACTIVE_CATEGORY_SET,
            activeCategory: id
        });

        const { current } = emojiListRef;
        const category = current.querySelector(`[data-id="${id}"]`);

        current.scrollTop = category.offsetTop;
    }

    return (
        <nav onClick={handleClick} className={cn('emoji-categories', { inactive })}>{
            groups.map((group) => (
                <button key={group}
                    className={cn(`icn-${group.replace(' & ', '_')}`, { active: activeCategory === group })}
                    data-id={group}/>
            ))
        }</nav>
    );
}

export default CategoriesNav;
