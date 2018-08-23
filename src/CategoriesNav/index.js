import React from 'react';
import PropTypes from 'prop-types';

import { categories } from '../emoji-data';
import './style.scss';

function CategoriesNav({onClick}) {

    return (
        <nav>{
            categories.map((category, index) => (
                <a className={category.name} key={index} onClick={(e) => onClick(e, index)}>
                    <i/>
                    <span className="hidden">{category.name}</span>
                </a>
            ))
        }
        </nav>
    );
}

CategoriesNav.propTypes = {
    onClick: PropTypes.func.isRequired
};

export default CategoriesNav;