import React from 'react';
import { categories } from '../emoji-data';
import './style.scss';

function CategoriesNav({onClick}) {

    return (
        <nav>{
            categories.map((category, index) => (
                <a href="#!" className={category.name} key={index} onClick={(e) => onClick(e, index)}>
                    <span className="hidden">{category.name}</span>
                </a>
            ))
        }
        </nav>
    );
}

export default CategoriesNav;