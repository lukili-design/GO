import React,{useState} from 'react';
import type {VoteArticle} from '../../types';
import {GoSurface,GoButton,GoBackButton,GoCmsTable,GoNotice,GoModalClose,formControlClass} from '../ui/GoUI';
import {ArticleBody} from '../voting/ArticleBody';
import {policyStaff,usePolicyRecords,PolicyVersion} from './policyModel';
import {downloadPolicyFile} from './PolicySettings';

const stamp=(value?:string)=>value?new Date(value).toLocaleString('zh-HK',{timeZone:'Asia/Hong_Kong',hour12:false}):'—';
export function PolicyManager({articles,onSaveArticle,initialId,onBack}:{articles:VoteArticle[];onSaveArticle:(a:VoteArticle)=>void;initialId:string;onBack:()=>void}){
 const [version,setVersion]=useState<number>();
 const [downloadOpen,setDownloadOpen]=useState(false);
 const [filters,setFilters]=useState({dept:'ALL',division:'ALL',businessUnit:'ALL',office:'ALL'});
 const [status,setStatus]=useState('ALL'),[message,setMessage]=useState(''),[signature,setSignature]=useState(''),[history,setHistory]=useState<PolicyVersion>(),[exporting,setExporting]=useState(false);
 const records=usePolicyRecords(),article=articles.find(a=>a.id===initialId),p=article?.policy;
 const v=p?.versions.find(x=>x.version===version)||p?.versions.at(-1),isLatest=v?.version===p?.versions.at(-1)?.version;
 const targets=isLatest?p?.targets:v?.targets;
 const rows=policyStaff.filter(s=>targets?.includes(s.employeeId)).map(s=>{
  const r=records.find(r=>r.articleId===initialId&&r.employeeId===s.employeeId&&r.round===v?.round);
  const signedVersion=p?.versions.find(x=>x.version===r?.version);
  const complete=!!r?.agreedAt&&(!signedVersion?.signature||!!r.signature);
  return {...s,r,complete,status:complete?'已確認':'未確認'};
 });
 const scoped=rows.filter(r=>Object.entries(filters).every(([key,value])=>value==='ALL'||r[key as keyof typeof filters]===value));
 const filtered=scoped.filter(r=>status==='ALL'||(status==='PENDING'?!r.complete:r.status===status));
 const agreed=scoped.filter(r=>r.complete).length,opened=scoped.filter(r=>r.r).length,pending=scoped.filter(r=>!r.complete);
 const rate=(count:number)=>scoped.length?Math.round(count/scoped.length*1000)/10:0;
 const filterLabels={dept:'部門（DDS）',division:'事業部',businessUnit:'業務單位',office:'辦公地點'};
 async function exportReport(format:'xlsx'|'csv'){
  if(!article||!v)return;setExporting(true);try{
   const headers=['文章','查看版本','部門（DDS）','事業部','業務單位','辦公地點','員工編號','姓名','閱讀狀態','狀態','已確認版本','開啟時間（香港）','確認時間（香港）','已提交簽名'];
   const data=filtered.map(r=>[article.title,`V${v.version}`,r.dept,r.division,r.businessUnit,r.office,r.employeeId,r.name,r.r?.openedAt?'已讀':'未讀',r.status,r.r?.version?`V${r.r.version}`:'—',stamp(r.r?.openedAt),stamp(r.r?.agreedAt),r.r?.signature?'是':'否']);
   let blob:Blob;
   if(format==='csv'){
    const escape=(value:unknown)=>{let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'};
    blob=new Blob(['\uFEFF'+[headers,...data].map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
   }else{
    const {default:ExcelJS}=await import('exceljs');const book=new ExcelJS.Workbook(),summary=book.addWorksheet('完成進度總覽'),sheet=book.addWorksheet('員工確認記錄');
    summary.addRows([['文章',article.title],['查看版本',`V${v.version}`],['匯出時間（香港）',stamp(new Date().toISOString())],...Object.entries(filters).map(([key,value])=>[filterLabels[key as keyof typeof filters],value==='ALL'?'全部':value]),['記錄狀態篩選',status==='ALL'?'全部':status==='PENDING'?'未確認':status],['目標用戶總數',scoped.length],['閱讀率',`${rate(opened)}%`],['確認完成率',`${rate(agreed)}%`],['尚未完成',pending.length]]);
    summary.columns=[{width:24},{width:65}];sheet.addRows([headers,...data]);sheet.columns=headers.map((_,i)=>({width:i===0?45:25}));sheet.getRow(1).font={bold:true};sheet.views=[{state:'frozen',ySplit:1}];sheet.autoFilter={from:'A1',to:{row:Math.max(1,sheet.rowCount),column:headers.length}};
    blob=new Blob([await book.xlsx.writeBuffer() as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
   }
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${article.title.replace(/[\\/:*?"<>|]/g,'_')}-V${v.version}-確認記錄.${format}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }catch{setMessage('匯出失敗，請重試。')}finally{setExporting(false)}
 }
 if(!article||!p)return <div className="go-type space-y-4"><GoBackButton onClick={onBack}/><GoNotice>文章已不存在或未設定閱讀確認。</GoNotice></div>;
 return <div className="go-type space-y-5">
 <GoSurface className="p-5 space-y-4"><GoBackButton onClick={onBack}/><h2>{article.title} · 完成進度</h2><div className="grid md:grid-cols-2 gap-4"><label>查看版本<select aria-label="查看政策版本" className={formControlClass} value={v?.version||''} onChange={e=>setVersion(Number(e.target.value))}>{!p.versions.length&&<option value="">尚未發布</option>}{p.versions.map(x=><option key={x.version} value={x.version}>V{x.version} · {stamp(x.publishedAt)}</option>)}</select></label></div>{!isLatest&&<p className="text-xs text-slate-500">正在查看歷史版本。</p>}</GoSurface>
 {message&&<GoNotice>{message}</GoNotice>}
 <GoSurface className="p-5 space-y-4"><h3>進度總覽</h3><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{Object.entries(filterLabels).map(([key,label])=><label key={key}>{label}<select aria-label={label+'篩選'} className={formControlClass} value={filters[key as keyof typeof filters]} onChange={e=>setFilters({...filters,[key]:e.target.value})}><option value="ALL">全部</option>{[...new Set(rows.map(r=>r[key as keyof typeof filters]))].map(x=><option key={x}>{x}</option>)}</select></label>)}</div>
 <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4"><div className="bg-slate-50 rounded-xl p-4"><p>目標用戶總數</p><h2>{scoped.length}</h2></div><div className="bg-slate-50 rounded-xl p-4"><p>閱讀率</p><h2>{rate(opened)}%</h2><p className="text-xs text-slate-500">{opened} 人已開啟</p></div><div className="bg-blue-50 rounded-xl p-4"><p>確認完成率</p><h2>{rate(agreed)}%</h2><progress aria-label="確認完成率" className="w-full" value={agreed} max={scoped.length||1}/><p className="text-xs">{agreed} / {scoped.length} 人</p></div><button type="button" className="bg-amber-50 text-left rounded-xl p-4" onClick={()=>setStatus('PENDING')}><p>尚未完成</p><h2>{pending.length}</h2><p className="text-xs text-amber-700">點擊查看人員</p></button></div><p className="text-xs text-slate-500">統計按所選版本、組織及地點計算；閱讀率以開啟文章為準，需要簽名者須提交簽名才計入完成。</p></GoSurface>
 <GoSurface className="p-5 space-y-4"><div className="flex flex-wrap justify-between gap-3"><h3>員工確認記錄{article.id==='ART-POLICY-DEMO'&&<span className="ml-2 text-xs font-normal text-slate-500">演示資料</span>}</h3><div className="relative"><GoButton disabled={!v||exporting} onClick={()=>setDownloadOpen(!downloadOpen)} aria-expanded={downloadOpen}>下載報表</GoButton>{downloadOpen&&<div className="absolute right-0 top-full mt-2 z-20 min-w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">{(['xlsx','csv'] as const).map(format=><button key={format} type="button" className="block w-full rounded-lg px-4 py-2 text-left text-sm hover:bg-slate-50" onClick={()=>{setDownloadOpen(false);void exportReport(format)}}>{format==='xlsx'?'Excel (.xlsx)':'CSV (.csv)'}</button>)}</div>}</div></div><label className="block max-w-xs">確認狀態<select aria-label="確認狀態" className={formControlClass} value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">全部狀態</option><option value="PENDING">未確認</option><option value="已確認">已確認</option></select></label><p className="text-xs text-slate-500">共 {filtered.length} 人；匯出內容依目前篩選條件產生。</p>
 <GoCmsTable><thead><tr>{['員工編號','姓名','部門（DDS）','事業部','業務單位','辦公地點','閱讀狀態','狀態','已確認版本','確認時間','簽名'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{filtered.map(r=><tr key={r.employeeId}><td>{r.employeeId}</td><td>{r.name}</td><td>{r.dept}</td><td>{r.division}</td><td>{r.businessUnit}</td><td>{r.office}</td><td>{r.r?.openedAt?'已讀':'未讀'}</td><td>{r.status}</td><td>{r.r?.version?`V${r.r.version}`:'—'}</td><td>{stamp(r.r?.agreedAt)}</td><td>{r.r?.signature?<GoButton variant="secondary" onClick={()=>setSignature(r.r!.signature!)}>查看簽名</GoButton>:'—'}</td></tr>)}{!filtered.length&&<tr><td colSpan={11}>沒有符合條件的員工</td></tr>}</tbody></GoCmsTable>{v&&<GoButton variant="secondary" onClick={()=>setHistory(v)}>查看版本內容</GoButton>}</GoSurface>
 {(signature||history)&&<div className="fixed inset-0 z-[100] bg-black/50 p-5 flex items-center justify-center"><GoSurface className="go-preview-scroll p-5 w-full max-w-2xl space-y-4"><div className="flex justify-between"><h3>{signature?'手寫簽名':`政策版本 V${history?.version}`}</h3><GoModalClose onClick={()=>{setSignature('');setHistory(undefined)}}/></div>{signature?<img src={signature} alt="員工手寫簽名" className="bg-white border w-full"/>:<><h3>{history?.title}</h3>{history&&<ArticleBody article={{...history,pdfFile:history.pdf,contentType:history.contentType||(history.mode==='PDF'?'PDF':'TEXT')}}/>}{history?.attachments.map(f=><GoButton key={f.ref} variant="secondary" onClick={()=>downloadPolicyFile(f).catch(()=>setMessage('文件下載失敗'))}>{f.name}</GoButton>)}</>}</GoSurface></div>}
 </div>;
}
