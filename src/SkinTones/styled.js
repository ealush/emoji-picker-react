import styled from 'react-emotion';
import {
    COLOR_ST_NEUTRAL,
    COLOR_ST_M1F3FB,
    COLOR_ST_M1F3FC,
    COLOR_ST_M1F3FE,
    COLOR_ST_M1F3FF,
    COLOR_ST_M1F3FD,
    RIGHT_SKIN_TONE,
    TOP_SKIN_TONE,
    SIZE_MODIFIER
} from '../styled';

const Ul = styled.ul`
    position: absolute;
    right: 0;
`;

const Modifier = styled.li`
    position: absolute;
    top: ${TOP_SKIN_TONE};
    right: ${RIGHT_SKIN_TONE};
    z-index: 3;
    padding: 1px;
    border-radius: 3px;
    transition: transform .4s, opacity .3s;
    opacity: ${({ spread }) => spread ? '1' : '0'};

    ${({ isSelected }) => isSelected ? `
        opacity: 1;
        transform: scale(1.5);
    ` : ''}

    ${({spread, index, isSelected}) => {
        if (!spread) { return; }

        const base = `
            opacity: 1;
            transform: translateX(${-index * 20}px)
        `;

        if (isSelected) {
            return `
                ${base} scale(1.5);`;
        } else {
            return `${base};`;
        }
    }}

    &.neutral button { background-color: ${COLOR_ST_NEUTRAL}; }
    &.m1f3fb  button { background-color: ${COLOR_ST_M1F3FB}; }
    &.m1f3fc  button { background-color: ${COLOR_ST_M1F3FC}; }
    &.m1f3fe  button { background-color: ${COLOR_ST_M1F3FE}; }
    &.m1f3ff  button { background-color: ${COLOR_ST_M1F3FF}; }
    &.m1f3fd  button { background-color: ${COLOR_ST_M1F3FD}; }

    button {
        border: 0;
        outline: none;
        display: block;
        height: ${SIZE_MODIFIER};
        width: ${SIZE_MODIFIER};
        border-radius: 2px;
        padding: 0;
    }
`;

export {
    Ul,
    Modifier
};