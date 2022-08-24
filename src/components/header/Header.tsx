import * as React from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import './Header.css';
import { Search } from './Search';

interface Props { 
  categoriesNavRef: any,
  emojiSearchRef:any
}

export function Header({categoriesNavRef,emojiSearchRef}:Props) {

  return (
    <header className="epr-header">
      <CategoryNavigation categoriesNavRef={categoriesNavRef}/>
      <Search emojiSearchRef={emojiSearchRef}/>
    </header>
  );
}
