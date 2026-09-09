import { hydrateRoot } from 'react-dom/client';
import Home from '../app/home';
import '../app/globals.css';
const root = document.getElementById('arqon-root');
if (root)
  hydrateRoot(
    root,
    <Home initialEnglish={document.documentElement.lang === 'en'} />,
  );
