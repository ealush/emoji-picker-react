import React from 'react';
import emojiModifiers from '../emoji-data/emoji-modifiers';
import './style.css';

function Footer({onModifierChosen, activeModifier}) {
    return (
        <footer>
            <ul>
                {emojiModifiers.map((modifier) => {

                    const selectedClass = activeModifier === modifier ? ' selected' : '';

                    return (
                        <li className={selectedClass} key={modifier}>
                            <a href="#!" onClick={(e) => onModifierChosen(e, modifier)}>
                                <img src={`/png/${modifier}.png`} alt={modifier}/>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </footer>
    );
}

export default Footer;