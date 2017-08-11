import React from 'react';
import './style.scss';

function CharCount({ curr, max }) {
    if (!max) {
        return null;
    }

    return (
        <small className="char-count">{curr} / {max}</small>
    );
}

export default CharCount;