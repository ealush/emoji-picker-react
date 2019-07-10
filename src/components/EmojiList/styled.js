import styled from 'styled-components';
import { rgba } from 'polished';
import { TEXT_LIGHT, WHITE } from '../../lib/colors';
import { GLOBAL_PADDING, TITLE_LINE_HEIGHT } from '../../styled';

export const Ul = styled.ul`
    clear: both;
    padding: 0 ${GLOBAL_PADDING}px;
    list-style: none;
    margin: 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    &:before {
        content: attr(data-name);
        color: ${TEXT_LIGHT};
        font-size: 14px;
        position: sticky;
        background: ${rgba(WHITE, .95)};
        width: 100%;
        z-index: 1;
        top: 0;
        text-transform: uppercase;
        line-height: ${TITLE_LINE_HEIGHT}px;
        font-weight: 700;
    }

    &:after {
        content: '';
        flex: 1000;
        order: 99999;
        flex-basis: 25px;
    }
`;

export const ScrollWrapper = styled.section`
    overflow-y: scroll;
    position: relative;
    height: 100%;
    box-sizing: border-box;
`;
