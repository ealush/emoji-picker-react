import * as React from 'react';
import './Footer.css';
import { SkinTonePicker } from './SkinTonePicker';

export function Footer() {
  return (
    <footer className="epr-footer">
      <div style={{ flex: 1 }}></div>
      <SkinTonePicker />
    </footer>
  );
}
