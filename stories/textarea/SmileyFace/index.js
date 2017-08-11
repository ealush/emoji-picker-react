import React from 'react';
import './style.scss';

function SmileyFace({ onClick }) {
    return (<i className={`smiley-face picker-trigger`} onClick={onClick}/>);
}

export default SmileyFace;