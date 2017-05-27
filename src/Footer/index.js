import React from 'react';
import emojiModifiers from '../emoji-data/emoji-modifiers';
import './style.scss';

function Footer({onModifierChosen, activeModifier}) {

    const neutralClass = `neutral${!activeModifier ? ' selected' : ''}`;

    return (
        <footer>
            <ul>
                <li className={neutralClass}>
                    <a href="#!" onClick={(e) => onModifierChosen(e, null)}></a>
                </li>
                {emojiModifiers.map((modifier) => {

                    const selectedClass = activeModifier === modifier ? ' selected' : '',
                        modifierClass = `m${modifier}${selectedClass}`;

                    return (
                        <li className={modifierClass} key={modifier}>
                            <a href="#!" onClick={(e) => onModifierChosen(e, modifier)}></a>
                        </li>
                    );
                })}
            </ul>
        </footer>
    );
}

export default Footer;