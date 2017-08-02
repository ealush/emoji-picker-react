import React from 'react';
import emojiCategories from '../emoji-data/categories.json';
import './style.scss';

function CategoriesNav({onClick}) {

    return (
        <nav>{
            emojiCategories.map((category, index) => (
                <a href="#!" className={category.name} key={index} onClick={(e) => onClick(e, index)}>
                    <span className="hidden">{category.name}</span>
                </a>
            ))
        }
        </nav>
    );
}

export default CategoriesNav;