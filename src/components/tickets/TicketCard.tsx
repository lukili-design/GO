import React,{useEffect,useState} from 'react';
import QRCode from 'qrcode';
import {jsPDF} from 'jspdf';
import {Wallet,TicketPerson,ticketCode,designFor} from './model';
import {GoButton,GoModalClose} from '../ui/GoUI';
export function TicketCard({wallet:w,person:p}:{wallet:Wallet;person:TicketPerson}){const d=designFor(w);const [qr,setQr]=useState('');const [large,setLarge]=useState(false);useEffect(()=>{let active=true;QRCode.toDataURL(ticketCode(w,p),{width:700,margin:3,errorCorrectionLevel:'M'}).then(v=>{if(active)setQr(v)});return()=>{active=false};},[w.id,p.id]);return <article style={{backgroundColor:d.background,color:d.bodyText}} className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">{(w.topImage??w.cover)&&<img src={w.topImage??w.cover} alt="門票頂部圖" className="block w-full h-auto"/>}<div className="px-6 pt-6 pb-3"><p className="text-xs tracking-[.25em] opacity-80"><span aria-hidden="true" style={{backgroundColor:d.bodyText}} className="inline-block w-1.5 h-1.5 rounded-full mr-2 align-middle"/>TVB GO · MY TICKET</p><h2 className="mt-4 text-xl font-semibold">{w.title}</h2><p className="mt-3 text-sm">{w.start.replace('T',' ')} 至 {w.end.replace('T',' ')}</p><p className="mt-2 text-sm opacity-90">{w.venue}</p></div><div className="p-6 space-y-5"><div><p className="text-lg font-semibold">{p.name}</p>{p.staffId&&<p className="text-xs opacity-75 mt-1">員工編號 {p.staffId}</p>}</div>{w.fields.some(f=>p.values[f.id])&&<div className="grid grid-cols-2 gap-3">{w.fields.filter(f=>p.values[f.id]).map(f=><div style={{backgroundColor:d.panelBackground,color:d.bodyText}} className="rounded-xl p-3" key={f.id}><p className="text-xs opacity-75">{f.name}</p><p style={{fontSize:f.prominent?28:16,lineHeight:1.3}} className={`${f.prominent?'text-2xl':'text-base'} font-semibold mt-1 break-words`}>{p.values[f.id]}</p></div>)}</div>}<div className="border-t border-dashed pt-5 text-center"><button aria-label="放大二維碼" onClick={()=>setLarge(true)}>{qr&&<img src={qr} alt="門票二維碼" className="w-44 h-44 mx-auto bg-white rounded-lg"/>}</button><p className="text-xs opacity-75">點擊放大二維碼</p></div>{w.description&&<p className="text-sm whitespace-pre-wrap opacity-90">{w.description}</p>}</div>{large&&<div className="fixed inset-0 z-[200] bg-white text-slate-900 flex flex-col items-center justify-center p-6"><div className="absolute top-5 right-5"><GoModalClose onClick={()=>setLarge(false)}/></div><h3>{w.title}</h3><img src={qr} alt="放大的門票二維碼" className="w-full max-w-md"/><p>{p.name}</p><GoButton variant="quiet" onClick={()=>setLarge(false)}>關閉二維碼</GoButton></div>}</article>}
export async function downloadTickets(w:Wallet,people:TicketPerson[]){
 if(!people.length)throw Error('請先選擇門票。');
 await document.fonts.ready;
 const pdf=new jsPDF();let pages=0;const d=designFor(w);
 for(const p of people){
  const c=document.createElement('canvas');c.width=1200;c.height=1697;
  const ctx=c.getContext('2d')!;let y=80;
  const reset=()=>{ctx.fillStyle=d.background;ctx.fillRect(0,0,c.width,c.height);ctx.textBaseline='top';y=80;};
  const flush=()=>{if(pages++)pdf.addPage();pdf.addImage(c.toDataURL('image/png'),'PNG',0,0,210,297);};
  const room=(height:number)=>{if(y+height>1600){flush();reset();}};
  function line(text:string,size=30,color=d.bodyText,panel=false){
   for(const paragraph of text.split('\n')){let current='';
    const write=()=>{room(size*1.5+16);if(panel){ctx.fillStyle=d.panelBackground;ctx.fillRect(80,y-4,1040,size*1.5+8);}ctx.font=`${size}px sans-serif`;ctx.fillStyle=color;ctx.fillText(current,100,y);y+=size*1.5;};
    ctx.font=`${size}px sans-serif`;
    for(const ch of paragraph){if(ctx.measureText(current+ch).width>1000){write();current='';}current+=ch;}write();
   }
   y+=12;
  }
  reset();
  if(w.topImage??w.cover){const cover=new Image();cover.src=(w.topImage??w.cover);await cover.decode();const height=Math.min(400,1000*cover.height/cover.width);const width=height*cover.width/cover.height;ctx.drawImage(cover,100,y,width,height);y+=height+35;}
  line('TVB GO · MY TICKET',26);
  line(w.title,48);line(w.start.replace('T',' ')+' — '+w.end.replace('T',' '),26);line(w.venue);y+=15;
  line(p.name,42);if(p.staffId)line('員工編號：'+p.staffId,24);
  for(const f of w.fields){if(p.values[f.id]){line(f.name+'：'+p.values[f.id],f.prominent?36:28,d.bodyText,true);y+=15;}}
  const qr=await QRCode.toDataURL(ticketCode(w,p),{width:600,margin:3});const img=new Image();img.src=qr;await img.decode();room(540);ctx.drawImage(img,375,y+20,450,450);y+=490;
  if(w.description){y+=20;line('入場須知',26);line(w.description,24);}
  flush();
 }
 pdf.save(`${w.title}-電子門票.pdf`);
}
