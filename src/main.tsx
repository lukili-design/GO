import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function ReviewTools() {
  useEffect(() => {
    if (document.getElementById('go-reviewjs')) return;
    const script = document.createElement('script');
    script.id = 'go-reviewjs';
    script.src = './vendor/reviewjs/annotate.js';
    script.dataset.project = 'tvb-go';
    script.dataset.position = 'bottom-right';
    script.dataset.startOpen = 'false';
    script.dataset.note = '請先切換至需要評審的頁面，再開始標註。標註保存在此瀏覽器，可透過 Download / Import 分享。';
    document.body.appendChild(script);
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ReviewTools />
  </StrictMode>,
);
