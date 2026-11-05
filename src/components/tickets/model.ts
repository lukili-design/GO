import {useEffect,useState} from 'react';
export type TicketField={id:string;name:string;prominent:boolean};
export type TicketPerson={id:string;name:string;staffId:string;email:string;app:boolean;values:Record<string,string>;emailAt?:string;pushAt?:string};
export type TicketCheckInRecord={id:string;personId:string;checkedInAt:string};
export type Wallet={id:string;title:string;start:string;end:string;venue:string;description:string;cover:string;topImage?:string;checkInRecords?:TicketCheckInRecord[];design?:TicketDesign;templates?:NotificationTemplates;published:boolean;fields:TicketField[];people:TicketPerson[];notices:{id:string;text:string;at:string;people:string[];channel?:'EMAIL'|'PUSH';messages?:{personId:string;title:string;body:string}[]}[]};
const KEY='go-independent-wallet-v1';
export const DEMO_STAFF='TVB-8821';
export const newPerson=():TicketPerson=>({id:crypto.randomUUID(),name:'',staffId:'',email:'',app:false,values:{}});
export const newWallet=():Wallet=>({id:crypto.randomUUID(),title:'',start:'',end:'',venue:'',description:'',cover:'',published:false,fields:[],people:[],notices:[]});
const seed=():Wallet[]=>[
 {...newWallet(),id:'ticket-banquet',title:'新春盆菜宴第一場',start:'2027-02-05T18:00',end:'2027-02-05T23:00',venue:'TVB 電視城宴會廳',description:'歡迎出席新春盆菜宴。請保留您的電子門票，並按座位資料入座。',published:true,fields:[{id:'table',name:'枱號',prominent:true},{id:'seat',name:'座位號',prominent:true}],people:[{...newPerson(),id:'ticket-demo-a',name:'陳大文',staffId:DEMO_STAFF,email:'demo@example.com',app:true,values:{table:'08',seat:'A'}},{...newPerson(),id:'ticket-demo-b',name:'李嘉賓',email:'guest@example.com',values:{table:'01',seat:'B'}}]},
 {...newWallet(),id:'ticket-banquet-2',title:'新春盆菜宴第二場',start:'2027-02-06T18:00',end:'2027-02-06T23:00',venue:'TVB 電視城宴會廳',description:'歡迎出席新春盆菜宴第二場。請保留您的電子門票，並按座位資料入座。',published:true,fields:[{id:'table',name:'枱號',prominent:true},{id:'seat',name:'座位號',prominent:true}],people:[{...newPerson(),id:'ticket-demo-d',name:'陳大文',staffId:DEMO_STAFF,email:'demo@example.com',app:true,values:{table:'12',seat:'C'}},{...newPerson(),id:'ticket-demo-e',name:'王嘉賓',email:'guest2@example.com',values:{table:'02',seat:'D'}}]},
 {...newWallet(),id:'ticket-townhall',title:'員工交流大會',start:'2027-03-12T14:00',end:'2027-03-12T17:00',venue:'電視城一號錄影廠',published:true,description:'請於活動開始前十五分鐘到場。',fields:[{id:'zone',name:'區域',prominent:true},{id:'category',name:'入場類別',prominent:false}],people:[{...newPerson(),id:'ticket-demo-c',name:'陳大文',staffId:DEMO_STAFF,email:'demo@example.com',app:true,values:{zone:'A 區',category:'員工'}}]}
];
export function readWallets():Wallet[]{
 const raw=localStorage.getItem(KEY);
 if(!raw)return seed();
 const wallets:Wallet[]=JSON.parse(raw);
 const migrationKey=KEY+'-three-demos';
 if(localStorage.getItem(migrationKey))return wallets;
 const next=wallets.map(w=>w.id==='ticket-banquet'&&w.title==='新春盆菜宴'?{...w,title:'新春盆菜宴第一場'}:w);
 if(!next.some(w=>w.id==='ticket-banquet-2')){
  const first=next.findIndex(w=>w.id==='ticket-banquet');
  next.splice(first<0?0:first+1,0,seed().find(w=>w.id==='ticket-banquet-2')!);
 }
 localStorage.setItem(KEY,JSON.stringify(next));
 localStorage.setItem(migrationKey,'1');
 return next;
}
export function useWallets(){const [wallets,setWallets]=useState<Wallet[]>(readWallets);useEffect(()=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(wallets));const refresh=()=>setWallets(readWallets());window.addEventListener('storage',refresh);window.addEventListener('wallet-change',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('wallet-change',refresh);};},[]);return {wallets,save:(w:Wallet)=>{const all=readWallets();const next=all.some(x=>x.id===w.id)?all.map(x=>x.id===w.id?w:x):[w,...all];localStorage.setItem(KEY,JSON.stringify(next));setWallets(next);window.dispatchEvent(new Event('wallet-change'));}};}
export const ticketCode=(w:Wallet,p:TicketPerson)=>`TVBGO-TICKET:${w.id}:${p.id}`;
export const status=(w:Wallet)=>!w.published?'草稿':new Date(w.end).getTime()<Date.now()?'已結束':new Date(w.start).getTime()>Date.now()?'未開始':'進行中';
export function validateWallet(w:Wallet){if(!w.title.trim()||!w.start||!w.end||!w.venue.trim())return '請填寫活動名稱、開始時間、結束時間及地點。';if(w.end<=w.start)return '結束時間必須晚於開始時間。';const names=w.fields.map(f=>f.name.trim());if(names.some(n=>!n)||new Set(names).size!==names.length||names.some(n=>['姓名','員工編號','電郵'].includes(n)))return '自訂欄位名稱不可留空、重複或與基本欄位相同。';return '';}

export type TicketDesign={background:string;theme:string;text:string};
export type NotificationTemplates={emailTitle:string;emailBody:string;pushTitle:string;pushBody:string};
export const defaultTemplates:NotificationTemplates={emailTitle:'{{活動名稱}}｜您的電子門票',emailBody:'{{姓名}}，您好：\n\n您的「{{活動名稱}}」電子門票已準備好。\n活動時間：{{活動時間}}\n活動地點：{{活動地點}}\n\n請查看隨附的個人門票 PDF，並保留以便到場使用。',pushTitle:'{{活動名稱}}電子門票已準備好',pushBody:'{{姓名}}，請點擊查看您的個人門票及活動資料。'};
export const templatesFor=(w:Wallet):NotificationTemplates=>({...defaultTemplates,...w.templates});
export function contrastText(hex:string){const rgb=hex.replace('#','').match(/.{2}/g)?.map(v=>parseInt(v,16))||[255,255,255];return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>155?'#0f172a':'#ffffff';}
export const designFor=(w:Wallet)=>{const d={background:'#ffffff',theme:'#efedf5',text:'auto',...w.design};const panelBackground=d.theme;return {...d,panelBackground,bodyText:d.text==='auto'?contrastText(d.background):d.text,headerText:d.text==='auto'?contrastText(d.theme):d.text};};
export function renderTemplate(text:string,w:Wallet,p:TicketPerson){const values:Record<string,string>={'姓名':p.name,'員工編號':p.staffId,'活動名稱':w.title,'活動時間':w.start.replace('T',' ')+' 至 '+w.end.replace('T',' '),'活動地點':w.venue};for(const f of w.fields)values['欄位:'+f.id]=p.values[f.id]||'';return text.replace(/\{\{([^{}]+)\}\}/g,(_,key)=>values[key]??'');}
export function templateProblem(w:Wallet){const t=templatesFor(w);const allowed=new Set(['姓名','員工編號','活動名稱','活動時間','活動地點',...w.fields.map(f=>'欄位:'+f.id)]);if(Object.values(t).some(v=>!v.trim()))return '請填寫電郵及 APP 通知的標題和內容。';if(Object.values(t).some(v=>[...v.matchAll(/\{\{([^{}]+)\}\}/g)].some(m=>!allowed.has(m[1]))))return '通知模板含有已刪除或無效的變數，請重新插入。';return '';}
export const canNotify=(p:TicketPerson,channel:'EMAIL'|'PUSH')=>channel==='EMAIL'?/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email):p.app;
