import React,{useState,useEffect} from 'react';
import DOMPurify from 'dompurify';
import type {VoteArticle} from '../../types';
import {PdfPages} from '../policies/PdfPages';
import {downloadPolicyFile} from '../policies/PolicySettings';
import {GoButton,GoNotice} from '../ui/GoUI';
import {resolveLocalMedia} from '../../utils/localMedia';
export function useArticleMedia(ref:string){const [url,setUrl]=useState('');useEffect(()=>{let active=true,created='';setUrl('');if(ref)resolveLocalMedia(ref).then(value=>{created=value;if(active)setUrl(value);else if(value.startsWith('blob:'))URL.revokeObjectURL(value)}).catch(()=>{});return()=>{active=false;if(created.startsWith('blob:'))URL.revokeObjectURL(created)}},[ref]);return url;}
export function ArticleImage({src,alt,className}:{src:string;alt:string;className?:string}){const url=useArticleMedia(src);return url?<img src={url} alt={alt} className={className}/>:<div className={className+' bg-slate-100'} aria-label={alt}/>;}
export function ArticleBody({article,onLoaded,onError}:{article:Pick<VoteArticle,'content'|'contentType'|'richContent'|'pdfFile'|'videoFile'|'linkUrl'>;onLoaded?:()=>void;onError?:(m:string)=>void}){
 const [error,setError]=useState(''),[ready,setReady]=useState(false);const video=useArticleMedia(article.videoFile?.ref||'');const type=article.contentType||'TEXT';const fail=(m:string)=>{setError(m);onError?.(m)};
 return <div className="space-y-3">{type==='RICH'?<div className="break-words leading-7 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_h2]:text-xl [&_img]:max-w-full" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(article.richContent||'')}}/>:type==='PDF'&&article.pdfFile?<><GoButton variant="secondary" onClick={()=>downloadPolicyFile(article.pdfFile!).catch(()=>fail('PDF 下載失敗，請重試。'))}>下載 {article.pdfFile.name}</GoButton>{!ready&&<p>正在載入 PDF…</p>}<PdfPages file={article.pdfFile} onLoaded={()=>{setReady(true);onLoaded?.()}} onError={fail}/></>:type==='VIDEO'?<video controls preload="metadata" src={video||undefined} aria-label="文章視頻" className="w-full rounded-xl bg-black" onEnded={()=>onLoaded?.()} onError={()=>fail('視頻無法播放，請重新上傳有效檔案。')}/>:type==='LINK'?<a className="text-blue-600 underline break-all" href={/^https?:\/\//i.test(article.linkUrl||'')?article.linkUrl:undefined} target="_blank" rel="noopener noreferrer">開啟鏈接：{article.linkUrl}</a>:<p className="whitespace-pre-wrap leading-7">{article.content}</p>}{error&&<GoNotice>{error}</GoNotice>}</div>;
}
