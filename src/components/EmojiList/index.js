import React, { useContext } from 'react';
import styled from 'styled-components';
import { rgba } from 'polished';
import  { groupedEmojis, groups } from '../../../lib/initEMojis';
import { TEXT_LIGHT, WHITE, PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW } from '../../lib/colors';
import { FilterContext } from '../Search';

const CATEGORY_TITLE_BAR_HEIGHT = '45px';

const pastels = [ PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW ];

const bgColor = (order) => pastels[order % pastels.length];

const Ul = styled.ul`
    position: relative;
    padding: 0 15px;
    list-style: none;
    margin: 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    &:before {
        content: attr(data-name);
        color: ${TEXT_LIGHT};
        position: sticky;
        background: ${rgba(WHITE, .95)};
        width: 100%;
        z-index: 1;
        top: 0;
        text-transform: uppercase;
        line-height: ${CATEGORY_TITLE_BAR_HEIGHT};
        font-weight: 500;
    }

    &:after {
        content: '';
        flex: 1000;
        order: 99999;
        flex-basis: 25px;
    }
`;

const Li = styled.li`

    button {
        color: inherit;
        height: 35px;
        width: 35px;
        border: none;
        border-radius: 5px;
        background-size: 20px 20px;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        transition: .2s background;

        &:hover {
            background-color: currentColor;
        }
    }
`;

const Emoji = ({ emoji, hidden }) => {

    const style = {
        order: emoji.sort_order,
        ...hidden && { display: 'none' },
        color: bgColor(emoji.sort_order)
    };

    return (
        <Li style={style}>
            <button style={{backgroundImage: `url(https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160/${emoji.unified}.png)` }}/>
        </Li>
    );
}

const ListsWrapper = styled.section`
    overflow-y: scroll;
    height: 100%;
    box-sizing: border-box;
`;

const Group = ({ name }) => {
    const filterContext = useContext(FilterContext);

    const emojis = groupedEmojis[name].reduce((accumulator, emoji) => {
        const hidden = filterContext && !filterContext.hasOwnProperty(emoji.unified);

        if (!hidden) {
            accumulator.shownCount++;
        }

        accumulator.list.push(
            <Emoji emoji={emoji} hidden={hidden} key={emoji.unified}/>
        );

        return accumulator;
    }, { list: [], shownCount: 0 });

    const style = {
        ...!emojis.shownCount && { display: 'none' }
    };

    return (
        <Ul data-name={name} children={emojis.list} style={style}/>
    );
}

const EmojiList = () => {

    return (
        <ListsWrapper>
            {groups.map((group) => (<Group key={group} name={group}/>))}
        </ListsWrapper>
    );
}

export default EmojiList;