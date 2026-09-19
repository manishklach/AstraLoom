'use client';

import {useEffect, useState} from 'react';

const key='astraloom-theme';
type Theme='light'|'dark';
function preferredTheme():Theme{try{const saved=localStorage.getItem(key);return saved==='dark'||saved==='light'?saved:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{return 'light'}}
export default function ThemeToggle(){const [theme,setTheme]=useState<Theme>('light');useEffect(()=>{const current=preferredTheme();document.documentElement.dataset.theme=current;setTheme(current)},[]);function toggle(){const next=theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem(key,next)}catch{}setTheme(next)}const label=`Switch to ${theme==='dark'?'light':'dark'} mode`;return <button className="landing-theme-toggle" type="button" onClick={toggle} aria-label={label} title={label}><span aria-hidden="true">{theme==='dark'?'☀':'☾'}</span></button>}