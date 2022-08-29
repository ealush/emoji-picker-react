import * as React from 'react';
import { useEmojiMouseEnter } from '../../hooks/useEmojiMouseEnter';
import './Footer.css';

export function Footer() {
  useEmojiMouseEnter();

  return <footer className="epr-footer"></footer>;
}
