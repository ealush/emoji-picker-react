import styled from 'styled-components';
import {
    COLOR_GREY_400,
    COLOR_GREY_500,
    PADDING_EMOJI_LIST,
    BG_CATEGORY_NAME,
    PADDING_CATEGORY_NAME,
    HEIGHT_CATEGORY_NAME
} from '../styled';

const Div = styled.div`
    position: relative;
    padding: 0 ${PADDING_EMOJI_LIST};
    margin: 0;
    text-align: left;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;

    .category-name {
        background-color: ${BG_CATEGORY_NAME};
        position: sticky;
        width: 100%;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
        display: block;
        padding: 0 ${PADDING_CATEGORY_NAME};
        font-size: 12px;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: ${COLOR_GREY_400};
        height: ${HEIGHT_CATEGORY_NAME};
        line-height: ${HEIGHT_CATEGORY_NAME};
        box-sizing: border-box;
        transition: color .2s;
    }

    ${({ activeCategory }) => `
        &.${activeCategory} .category-name {
            color: ${COLOR_GREY_500};
        }
    `}
`;

export {
    Div
};