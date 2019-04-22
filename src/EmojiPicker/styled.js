import styled from 'react-emotion';
import {
    BG_PICKER,
    BORDER_MAIN,
    WIDTH_PICKER,
    HEIGHT_PICKER
} from '../styled';

const Aside = styled.aside`
    background-color: ${BG_PICKER};
    width: calc(${WIDTH_PICKER} + 5px);
    height: ${HEIGHT_PICKER};
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 0;
    border: 1px solid ${BORDER_MAIN};
    border-radius: 3px;
    overflow: hidden;
    font-family: sans-serif;

    .hidden {
        display: none!important;
        visibility: hidden!important;
        padding: 0!important;
        margin: 0!important;
    }

    a {
        outline: none;
        cursor: pointer;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;

        li {
            display: inline-block;
        }
    }

    button {
        cursor: pointer;
    }
`;

const BarWrapper = styled.div`
    position: relative;
    border-top: 1px solid ${BORDER_MAIN};
`;

export {
    Aside,
    BarWrapper
};