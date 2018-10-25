import React from 'react';
import PropTypes from 'prop-types';
import { Nav, ButtonCategory } from './styled';
import { categories } from '../emoji-data';


function CategoriesNav({onClick, activeCategory}) {
    return (
        <Nav>{
            categories.map((category, index) => (
                <ButtonCategory key={index}
                    onClick={(e) => onClick(e, category.name)}
                    className={category.name}
                    activeCategory={activeCategory}>
                    <i/>
                    <span className="hidden">{category.name}</span>
                </ButtonCategory>
            ))
        }
        </Nav>
    );
}

CategoriesNav.propTypes = {
    onClick: PropTypes.func.isRequired,
    activeCategory: PropTypes.string
};

export default CategoriesNav;