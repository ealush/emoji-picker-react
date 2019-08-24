import React, { useContext } from 'react';
import { actionTypes, PickerContext } from '../../lib/reducer';
import groups from '../../groups.json';
import icons from './svg';
import Nav from './styled';

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
        <Nav onClick={handleClick} className={inactive ? 'inactive' : undefined}>{
            groups.map((group) => (
                <button key={group}
                    className={activeCategory === group ? 'active' : undefined}
                    data-id={group}
                    style={{ backgroundImage: `url(${icons[group.replace(' & ', '_')]})` }}/>
            ))
        }</Nav>
    );
}

export default CategoriesNav;
