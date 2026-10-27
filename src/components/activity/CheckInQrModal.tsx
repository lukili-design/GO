import React,{useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import QRCode from 'qrcode';
import type {Activity} from '../../types';
import {GoButton,GoModalClose,GoNotice,GoSurface} from '../ui/GoUI';

export function CheckInQrModal({activity,onClose}:{activity:Activity;onClose:()=>void}){
 const [image,setImage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let live=true;setImage('');setError('');QRCode.toDataURL(`GO-SELF-CHECKIN:${activity.id}`,{width:1024,margin:4,errorCorrectionLevel:'M'}).then(url=>{if(live)setImage(url);}).catch(()=>{if(live)setError('二維碼生成失敗，請關閉後重試。');});return()=>{live=false;};},[activity.id]);
 const download=()=>{const link=document.createElement('a');link.href=image;link.download=`${activity.title.replace(/[\\/:*?"<>|]/g,'_')}-簽到二維碼.png`;document.body.appendChild(link);link.click();link.remove();};
 return createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5" role="dialog" aria-modal="true" aria-label="下載簽到二維碼" onKeyDown={e=>{if(e.key==='Escape')onClose();}}><GoSurface className="go-type go-preview-scroll w-full max-w-md space-y-4 p-5"><div className="flex items-center justify-between"><h2>下載簽到二維碼</h2><GoModalClose onClick={onClose}/></div><h3>{activity.title}</h3><p className="text-sm text-slate-500">參加者可使用 TVB GO APP 掃碼，按已報名的場次簽到。</p><div className="flex min-h-64 items-center justify-center">{image?<img src={image} alt={`${activity.title}簽到二維碼`} className="h-64 w-64"/>:!error&&<p>正在生成二維碼…</p>}</div>{error&&<GoNotice>{error}</GoNotice>}<div className="flex justify-end gap-2"><GoButton variant="secondary" onClick={onClose}>關閉</GoButton><GoButton disabled={!image} onClick={download}>下載 PNG</GoButton></div></GoSurface></div>,document.body);
}
