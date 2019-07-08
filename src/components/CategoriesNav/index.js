import React from 'react';
import { groups } from '../../../lib/initEMojis';
import icons from './svg';
import Nav from './styled';


const CategoriesNav = ({ emojiListRef }) => {

    const handleChange = ({ target }) => {

        const id = target.getAttribute('data-id');

        if (!emojiListRef || !emojiListRef.current || !id) {
            return;
        }

        const { current } = emojiListRef;
        const category = current.querySelector(`[data-id="${id}"]`);

        current.scrollTop = category.offsetTop;
    }

    return (
        <Nav onClick={handleChange}>{
            groups.map((group) => (
                <button key={group}
                    data-id={group}
                    style={{ backgroundImage: `url(${icons[group.replace(' & ', '_')]})` }}/>
            ))
        }</Nav>
    );
}

export default CategoriesNav;
