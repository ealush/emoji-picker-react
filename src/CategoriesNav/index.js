import React from 'react';

import { categories } from '../emoji-data';
import styles from './style.scss';

function CategoriesNav({onClick, activeCategory}) {
    return (
        <nav>{
            categories.map((category, index) => {
                let className = [styles[category.name]];
                if (category.name === activeCategory) {
                    className.push(styles.active);
                }
                return <a className={className.join(' ')} key={index} onClick={() => onClick(category)}>
                            <i/>
                        </a>
            })
        }
        </nav>
    );
}

export default CategoriesNav;