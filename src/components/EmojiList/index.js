import React, { useContext, useState } from 'react';
import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import  { groupedEmojis, groups } from '../../../lib/initEMojis';
import { TEXT_DARK, TEXT_LIGHT, WHITE, PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW } from '../../lib/colors';
import { FilterContext } from '../Search';

const CATEGORY_TITLE_BAR_HEIGHT = '45px';

const pastels = [ PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW ];

const bgColor = (order) => pastels[order % pastels.length];

const Ul = styled.ul`
    clear: both;
    padding: 0 15px;
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
        line-height: ${CATEGORY_TITLE_BAR_HEIGHT};
        font-weight: 700;
    }

    &:after {
        content: '';
        flex: 1000;
        order: 99999;
        flex-basis: 25px;
    }
`;

const Li = styled.li`
    position: relative;

    &.has-skin-variation:before {
        content: '';
        display: block;
        height: 5px;
        width: 5px;
        background: ${TEXT_DARK};
        position: absolute;
        top: 0;
        right: 0;
        border-radius: 0 5px 0 0;
    }

    button {
        color: inherit;
        height: 35px;
        width: 35px;
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

    const hasSkinVariation = emoji.skin_variations;

    const style = {
        order: emoji.sort_order,
        ...hidden && { display: 'none' },
        color: bgColor(emoji.sort_order)
    };

    return (
        <Li style={style} hasSkinVariation={hasSkinVariation} className={emoji.skin_variations ? 'has-skin-variation' : undefined}>
            <button
                style={{backgroundImage: `url(https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/img-apple-160/${emoji.unified}.png)` }}/>
        </Li>
    );
}

const ListsWrapper = styled.section`
    overflow-y: scroll;
    position: relative;
    height: 100%;
    box-sizing: border-box;
`;

const createEmojiList = ({ name }) => {
    const filterContext = useContext(FilterContext);

    return groupedEmojis[name].reduce((accumulator, emoji) => {
        const hidden = filterContext && !filterContext.hasOwnProperty(emoji.unified);

        if (!accumulator.shown && !hidden) {
            accumulator.shown = true;
        }

        accumulator.list.push(
            <Emoji emoji={emoji}
                hidden={hidden}
                key={emoji.unified}/>
        );

        return accumulator;
    }, { list: [], shown: false });
}

const Group = ({ name }) => {
    const { list, shown } = createEmojiList({
        name
    });

    const style = {
        ...!shown && { display: 'none' }
    };

    return (
        <Ul data-name={name}
            children={list}
            style={style}/>
    );
}

const EmojiList = () => {

    return (
        <ListsWrapper>
            {groups.map((group) => <Group key={group} name={group}/>)}
        </ListsWrapper>
    );
}

export default EmojiList;