import React,{useEffect,useRef} from 'react';
import {getDocument,GlobalWorkerOptions} from 'pdfjs-dist';
import {resolveLocalMedia} from '../../utils/localMedia';
import type {PolicyFile} from './policyModel';
GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/build/pdf.worker.min.mjs',import.meta.url).href;
export function PdfPages({file,onLoaded,onError}:{file:PolicyFile;onLoaded:()=>void;onError:(m:string)=>void}){
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{let cancelled=false,url='';let task:ReturnType<typeof getDocument>|undefined;const parent=container.current!;parent.replaceChildren();(async()=>{try{url=await resolveLocalMedia(file.ref);if(cancelled)return;task=getDocument(url);const doc=await task.promise;for(let n=1;n<=doc.numPages;n++){if(cancelled)return;const page=await doc.getPage(n);const base=page.getViewport({scale:1});const viewport=page.getViewport({scale:Math.min(1.5,700/base.width)});const canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;canvas.style.width='100%';canvas.style.height='auto';canvas.setAttribute('aria-label',`第 ${n} 頁，共 ${doc.numPages} 頁`);parent.appendChild(canvas);await page.render({canvas,viewport}).promise;}if(!cancelled)onLoaded();}catch{if(!cancelled)onError('無法閱讀 PDF，請確認檔案有效且未加密。');}})();return()=>{cancelled=true;void task?.destroy();if(url.startsWith('blob:'))URL.revokeObjectURL(url)}},[file.ref]);
 return <div ref={container} className="space-y-3"/>;
}
