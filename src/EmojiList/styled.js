import styled from 'react-emotion';
import {
    BG_CATEGORY_NAME,
    HEIGHT_CATEGORY_NAME
} from '../styled';

const Div = styled.div`
    width: 100%;
    height: 100%;
    padding: 0;
    overflow-x: hidden;
    box-sizing: border-box;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        height: 0;
        width: 0;
    }
    &::scrollbar {
        height: 0;
        width: 0;
    }

    ${(filter) => filter ? `
        &:before {
            content: '';
            background: ${BG_CATEGORY_NAME};
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: ${HEIGHT_CATEGORY_NAME};
            z-index: 1;
        }
    ` : ''}
`;

export {
    Div
};