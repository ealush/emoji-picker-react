import React from 'react';
import PropTypes from 'prop-types';
import { Nav, ButtonCategory } from './styled';
import { categories } from '../emoji-data';

function CategoriesNav({ onClick, activeCategory, icons }) {
    return (
        <Nav>{
            categories.map((category, index) => (
                <ButtonCategory key={index}
                    icons={icons}
                    onClick={(e) => onClick(e, category.name)}
                    categoryName={category.name}
                    isActiveCategory={activeCategory === category.name}>
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
    activeCategory: PropTypes.string,
    icons: PropTypes.object
};

CategoriesNav.defaultProps = {
    icons: {}
};

export default CategoriesNav;