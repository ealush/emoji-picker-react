import styled from 'react-emotion';

import {
    HEIGHT_NAV_ITEM,
    BG_NAV,
    PADDING_CATEGORY_NAME,
    COLOR_NAV_UNDERLINE_HOVER,
    COLOR_NAV_UNDERLINE_ACTIVE,
    WIDTH_NAV_ITEM,
    BG_IMG_PEOPLE,
    BG_IMG_FOODS,
    BG_IMG_NATURE,
    BG_IMG_ACTIVITY,
    BG_IMG_OBJECTS,
    BG_IMG_PLACES,
    BG_IMG_FLAGS,
    BG_IMG_SYMBOLS
} from '../styled';

const icons = {
    people: `url("${BG_IMG_PEOPLE}")`,
    foods: `url("${BG_IMG_FOODS}")`,
    nature: `url("${BG_IMG_NATURE}")`,
    activity: `url("${BG_IMG_ACTIVITY}")`,
    objects: `url("${BG_IMG_OBJECTS}")`,
    places: `url("${BG_IMG_PLACES}")`,
    flags: `url("${BG_IMG_FLAGS}")`,
    symbols: `url("${BG_IMG_SYMBOLS}")`
};

const Nav = styled('nav')`
    flex-direction: row;
    min-height: ${HEIGHT_NAV_ITEM};
    height: ${HEIGHT_NAV_ITEM};
    background-color: ${BG_NAV};
    display: flex;
    justify-content: space-between;
    position: absolute;
    z-index: 1;
    box-sizing: border-box;
    left: ${PADDING_CATEGORY_NAME};
    right: ${PADDING_CATEGORY_NAME};
`;

const ButtonCategory = styled('button')`
    position: relative;
    transition: filter .2s;
    border: 0;
    outline: none;

    &:hover {

        &:after {
            opacity: 1;
            background-color: ${COLOR_NAV_UNDERLINE_HOVER};
        }

        i {
            opacity: 1;
        }
    }

    i {
        content: '';
        display: block;
        height: ${HEIGHT_NAV_ITEM};
        width: ${WIDTH_NAV_ITEM};
        background-size: 18px auto;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        opacity: .4;
        transition: opacity .3s;
        transition-delay: .2s;
        background-image: ${({categoryName}) => icons[categoryName]}
    }

    &:after {
        content: '';
        position: absolute;
        bottom: 0;
        width: 100%;
        left: 0;
        height: 2px;
        border-radius: 5px;
        background-color: ${COLOR_NAV_UNDERLINE_ACTIVE};
        opacity: 0;
        transition-delay: 1s;
        transition: opacity .4s, background .2s;
    }

    ${({ isActiveCategory }) => isActiveCategory ? `
        i {opacity: 1;}
        &:after { opacity: 1; }
    ` : ''}
`;

export {
    Nav,
    ButtonCategory
};