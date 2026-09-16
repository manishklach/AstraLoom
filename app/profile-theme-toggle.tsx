'use client';

import {useEffect, useState} from 'react';

const key='astraloom-theme';
type Theme='light'|'dark';

function preferredTheme():Theme {
  try { return localStorage.getItem(key)==='dark'?'dark':localStorage.getItem(key)==='light'?'light':matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'; }
  catch { return 'light'; }
}

export default function ProfileThemeToggle(){
  const [theme,setTheme]=useState<Theme>('light');
  useEffect(()=>{const current=preferredTheme();document.documentElement.dataset.theme=current;setTheme(current);},[]);
  function toggle(){const next=theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem(key,next)}catch{}setTheme(next);}
  const label=`Switch to ${theme==='dark'?'light':'dark'} mode`;
  return <button className="profile-theme-toggle" type="button" onClick={toggle} aria-label={label} title={label}><span aria-hidden="true">{theme==='dark'?'☀':'☾'}</span></button>;
}
