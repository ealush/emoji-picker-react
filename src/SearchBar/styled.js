import styled from 'styled-components';
import {
    HEIGHT_SEARCH_BAR,
    PADDING_SEARCH_BAR,
    COLOR_FILTER_INPUT,
    BORDER_FILTER,
    COLOR_FILTER_PLACEHOLDER,
    BORDER_FILTER_FOCUS,
    TOP_LEFT_MAGNIFIER
} from '../styled';

const Div = styled.div`
    height: ${HEIGHT_SEARCH_BAR};
    margin-top: 0;
    padding: ${PADDING_SEARCH_BAR};
    position: relative;
    z-index: 2;
    left: 0;
    box-sizing: border-box;

    input {
        padding: 5px 5px 5px 35px;
        margin: 0;
        box-sizing: border-box;
        color: ${COLOR_FILTER_INPUT};
        width: 100%;
        outline: none;
        border: 1px solid ${BORDER_FILTER};
        border-radius: 5px;
        transition: border .2s;

        &::placeholder {
            color: ${COLOR_FILTER_PLACEHOLDER};
        }

        &:focus {
            border: 1px solid ${BORDER_FILTER_FOCUS};

            + i:before {
                opacity: 1;
            }
        }

    }

    i:before {
        content: '';
        background-repeat: no-repeat;
        background-image: url("data:image/svg+xml,%3Csvg id='Capa_1' xmlns='http://www.w3.org/2000/svg' width='310.4' height='310.4'%3E%3Cstyle%3E.st0%7Bfill:%239e9e9e%7D%3C/style%3E%3Cpath class='st0' d='M273.6 215c49.1-49.1 49.1-129 0-178.1-49.1-49.1-129-49.1-178.1 0-41.7 41.7-48 103.6-18.9 152 0 0 2.1 3.5-.7 6.3l-64.3 64.3c-12.8 12.8-15.8 30.7-4.5 42l2 2c11.3 11.3 29.2 8.3 42-4.5l64.1-64.1c3-3 6.4-.9 6.4-.9 48.4 28.9 110.3 22.6 152-19zm-154.9-23.3c-36.3-36.3-36.3-95.3 0-131.6s95.3-36.3 131.6 0 36.3 95.3 0 131.6-95.3 36.3-131.6 0z'/%3E%3Cpath class='st0' d='M126.8 118.4c-1.7 0-3.4-.3-5.1-1-6.6-2.8-9.7-10.4-6.9-17 17.6-41.6 65.7-61.1 107.3-43.5 6.6 2.8 9.7 10.4 6.9 17-2.8 6.6-10.4 9.7-17 6.9-28.4-12-61.2 1.3-73.2 29.7-2.2 4.9-7 7.9-12 7.9z'/%3E%3C/svg%3E");
        background-position: 50% 50%;
        background-size: 15px 15px;
        height: 15px;
        width: 15px;
        position: absolute;
        left: ${TOP_LEFT_MAGNIFIER};
        top: ${TOP_LEFT_MAGNIFIER};
        display: block;
        opacity: .3;
        transition: opacity .2s;
    }
`;

export {
    Div
};