import styled from 'styled-components';
import { rgb } from 'polished';
import { WHITE, BORDER_BASE } from '../../lib/colors';

export const Ul = styled.ul`
    padding: 0;
    margin: 0;
    list-style-type: none;
    position: absolute;
    top: 22px;
    right: 22px;

    li {
        position: absolute;
        padding: 0;
        border-radius: 5px;
        overflow: hidden;
        transition: transform .3s ease;
        box-shadow: 0 3px 3px ${BORDER_BASE};
    }
`;

export const Tone = styled.li`

    label {
        height: 10px;
        width: 10px;
        padding: 0;
        display: block;
        cursor: pointer;
    }

    input {
        height: 0;
        width: 0;
        opacity: 0;
        visibility: hidden;
        display: none;
    }

    &.tneutral label { background-color: #ffe082; }
    &.t1f3fb  label { background-color: #ffe0b2 }
    &.t1f3fc  label { background-color: #ffccbc }
    &.t1f3fe  label { background-color: #795548 }
    &.t1f3ff  label { background-color: #5d4037 }
    &.t1f3fd  label { background-color: ${rgb(202, 126, 85)}; }
`;


