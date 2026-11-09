import {CoiManager} from '../coi/CoiManager';
import {AppCoi} from '../coi/AppCoi';
import {validLink} from '../coi/coiModel';
import {ArticleBody,ArticleImage} from './ArticleBody';
import {AppArticleDetailView} from './AppArticleDetailView';
import {ArticleEditorFields,articleCategories} from './ArticleEditorFields';
import DOMPurify from 'dompurify';
import {PolicySettings} from '../policies/PolicySettings';
import {PolicyNotifications} from '../policies/PolicyNotifications';
import {PolicyManager} from '../policies/PolicyManager';
import {PolicyReader} from '../policies/PolicyReader';
import {publishPolicy} from '../policies/policyModel';
import {GoBackButton,GoCmsTable,GoSurface,GoButton,GoModalClose} from '../ui/GoUI';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VoteArticle, VotingCampaign, VoteItem, Activity } from '../../types';
import { 
  Search, Plus, Edit3, Trash2, FileText, CheckCircle2, 
  BarChart2, Eye, Calendar, User, ArrowLeft, Check, 
  Sparkles, Layers, Image as ImageIcon, HelpCircle, X,
  ExternalLink, Sliders, Award, ChevronDown, ChevronUp,
  Tag, Flame, Users, CheckSquare
} from 'lucide-react';
import { AppVotingWidget } from './AppVotingWidget';
import { getCampaignVoteItems } from '../../utils/votingHelpers';

interface ArticleManagerProps {
  articles: VoteArticle[];
  campaigns: VotingCampaign[];
  activities: Activity[];
  onSaveArticle: (article: VoteArticle) => void;
  onDeleteArticle: (articleId: string) => void;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  userVotes?: Record<string, string[]>;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({
  articles,
  campaigns,
  activities,
  onSaveArticle,
  onDeleteArticle,
  onVoteSubmit,
  userVotes = {},
  triggerSound
}) => {
  // Mode: 'LIST' | 'FORM' | 'PREVIEW'
  const [uploadBusy,setUploadBusy]=useState(false);
  const [policyId,setPolicyId]=useState<string>();
  const [notificationId,setNotificationId]=useState<string>();
  const [actionPanel,setActionPanel]=useState<{id:string;mode:'DETAILS'|'REVIEW'|'PUBLISH'}>();
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State
  const [editingArticle, setEditingArticle] = useState<VoteArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<VoteArticle | null>(null);

  // Insert Campaign Modal State
  const [showInsertVoteModal, setShowInsertVoteModal] = useState(false);
  const [selectedVoteCampaignIds, setSelectedVoteCampaignIds] = useState<string[]>([]);
  const [expandedCampaignInModal, setExpandedCampaignInModal] = useState<string | null>(null);

  // Filtered Articles
  const filteredArticles = articles.filter(art => {
    const matchSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || art.category === categoryFilter;
    return matchSearch && matchCat;
  }).sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||Number(b.category==='政策同意書')-Number(a.category==='政策同意書'));

  // Open Create Article
  const handleOpenCreate = () => {
    const newId = `ART-2026-${String(articles.length + 1).padStart(3, '0')}`;
    setEditingArticle({
      id: newId,
      title: '', titleEn:'',contentType:'RICH',richContent:'',important:false,visibility:{mode:'STAFF_TYPES',ids:['S','E','A']},
      category: '公司公告',
      author: 'TVB 互動新聞組',
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      summary: '',
      content: `請在此輸入文章正文內容...\n\n點擊工具欄上的 [📊 關聯活動] 按鈕，即可在文內嵌入包含多個評選投票的活動模組！`,
      linkedCampaignIds: [],
      status: 'PUBLISHED',
      publishDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      viewCount: 0
    });
    setViewMode('FORM');
    triggerSound(600, 'sine', 0.1);
  };

  // Open Edit Article
  const handleOpenEdit = (art: VoteArticle) => {
    setEditingArticle(JSON.parse(JSON.stringify({...art,visibility:art.visibility?.mode==='STAFF_TYPES'?art.visibility:{mode:'STAFF_TYPES',ids:!art.visibility||art.visibility.mode==='ALL'?['S','E','A']:[]},category:art.policy?.enabled?'政策同意書':art.category,contentType:art.contentType||(art.policy?.mode==='PDF'?'PDF':'TEXT'),pdfFile:art.pdfFile||art.policy?.pdf})));
    setViewMode('FORM');
    triggerSound(650, 'sine', 0.1);
  };

  // Open Preview Article
  const handleOpenPreview = (art: VoteArticle) => {
    setPreviewArticle(art);
    setViewMode('PREVIEW');
    triggerSound(700, 'sine', 0.08);
  };

  // Insert Selected Campaign Votes into Article Content
  const handleConfirmInsertVotes = () => {
    if (!editingArticle || selectedVoteCampaignIds.length === 0) {
      setShowInsertVoteModal(false);
      return;
    }

    let insertText = '\n\n';
    const selectedActivities = activities.filter(activity => selectedVoteCampaignIds.includes(activity.id));
    const campaignIds = Array.from(new Set(selectedActivities.flatMap(activity => activity.modules.filter(module => module.type === 'VOTING').map(module => module.resourceId.split('::')[0]))));
    campaignIds.forEach(id => {
      insertText += `[VOTE_ID: ${id}]\n\n`;
    });

    const updatedLinked = Array.from(new Set([...editingArticle.linkedCampaignIds, ...campaignIds]));

    setEditingArticle({
      ...editingArticle,
      content: editingArticle.content + insertText,
      linkedActivityIds: Array.from(new Set([...(editingArticle.linkedActivityIds || []), ...selectedVoteCampaignIds])),
      linkedCampaignIds: updatedLinked
    });

    setShowInsertVoteModal(false);
    setSelectedVoteCampaignIds([]);
    triggerSound(800, 'sine', 0.12);
  };

  // Helper to extract linked campaigns from article
  const getLinkedCampaignsForArticle = (art: VoteArticle): VotingCampaign[] => {
    const matches = art.content.match(/\[VOTE_ID:\s*([^\]]+)\]/g) || [];
    const extractedIds = matches.map(m => m.replace(/\[VOTE_ID:\s*|\]/g, '').trim());
    const allIds = Array.from(new Set([...(art.linkedCampaignIds || []), ...extractedIds]));
    return allIds.map(id => campaigns.find(c => c.id === id)).filter((c): c is VotingCampaign => Boolean(c));
  };

  // Save Article Submit
  const handleSaveArticleSubmit = (e: {preventDefault:()=>void}, candidate:VoteArticle|null=editingArticle) => {
    e.preventDefault();
    if (!candidate) return;
    if (!candidate.title.trim()) {
      alert('請填寫文章標題！');
      return;
    }

    // Auto extract linked campaign IDs from content
    const matches = candidate.content.match(/\[VOTE_ID:\s*([^\]]+)\]/g) || [];
    const extractedIds: string[] = matches.map(m => m.replace(/\[VOTE_ID:\s*|\]/g, '').trim());
    const finalLinked = Array.from(new Set([...candidate.linkedCampaignIds, ...extractedIds]));

    const finalArt: VoteArticle = {
      ...candidate,
      linkedCampaignIds: finalLinked
    };

    if(!finalArt.titleEn?.trim()){alert('請填寫文章標題 EN。');return;}
    const type=finalArt.contentType||'TEXT';
    if(finalArt.visibility?.mode!=='ALL'&&finalArt.visibility&&!finalArt.visibility.ids.length){alert('請至少選擇一類可見員工。');return;}
    if(finalArt.autoSchedule&&(!finalArt.onlineAt||!finalArt.offlineAt||new Date(finalArt.offlineAt)<=new Date(finalArt.onlineAt))){alert('請設定有效的上線及下線時間，下線時間須晚於上線時間。');return;}
    if(type==='TEXT'&&!finalArt.content.trim()||type==='RICH'&&!DOMPurify.sanitize(finalArt.richContent||'',{ALLOWED_TAGS:[]}).replace(/&nbsp;/g,' ').trim()){alert('請填寫文章內容。');return;}
    if(type==='PDF'&&!finalArt.pdfFile&&!finalArt.policy?.pdf||type==='VIDEO'&&!finalArt.videoFile){alert('請上傳內容檔案。');return;}
    if(type==='LINK'&&!/^https?:\/\//i.test(finalArt.linkUrl||'')){alert('請填寫有效的 HTTP 或 HTTPS 鏈接。');return;}
    if(finalArt.policy)finalArt.policy={...finalArt.policy,enabled:finalArt.category==='政策同意書'&&finalArt.policy.enabled,mode:type==='PDF'?'PDF':'TEXT',pdf:finalArt.pdfFile||finalArt.policy.pdf};
    if(finalArt.policy?.enabled&&finalArt.policy.buttonText!==undefined&&!finalArt.policy.buttonText.trim()){alert('請填寫確認按鈕文案。');return;}
    if(finalArt.category==='年度 COI 申報'){const c=finalArt.coi;if(!c||!/^\d{4}$/.test(c.year)||!c.deadline||!validLink(c.url)||!c.people.length){alert('請填寫申報年度、截止時間、有效外部連結及須申報名單。');return;}finalArt.coi={...c,name:finalArt.title,description:finalArt.content};}
    onSaveArticle(publishPolicy(finalArt));
    setViewMode('LIST');
    setActionPanel(undefined);
    triggerSound(880, 'sine', 0.15);
  };

  if(notificationId||policyId){const a=articles.find(a=>a.id===(notificationId||policyId));if(a?.category==='年度 COI 申報'&&a.coi)return <CoiManager initialItem={{...a.coi,name:a.title,description:a.content}} initialView={notificationId?'notify':'progress'} onSave={coi=>onSaveArticle({...a,coi})} onBack={()=>{setNotificationId(undefined);setPolicyId(undefined)}}/>;}
  if(viewMode==='PREVIEW'&&previewArticle?.category==='年度 COI 申報'&&previewArticle.coi)return <div className="h-[700px] max-w-md mx-auto border rounded-2xl overflow-hidden"><AppCoi article={previewArticle} item={{...previewArticle.coi,name:previewArticle.title,description:previewArticle.content}} onBack={()=>setViewMode('LIST')}/></div>;
  if(notificationId){const article=articles.find(a=>a.id===notificationId);if(article?.policy)return <PolicyNotifications article={article} onSaveArticle={onSaveArticle} onBack={()=>setNotificationId(undefined)}/>;}
  if(policyId)return <PolicyManager articles={articles} onSaveArticle={onSaveArticle} initialId={policyId} onBack={()=>setPolicyId(undefined)}/>;
  if(viewMode==='PREVIEW'&&previewArticle?.policy?.enabled)return <div className="space-y-4"><GoBackButton onClick={()=>setViewMode('LIST')}/><div className="h-[700px] max-w-md mx-auto border rounded-2xl overflow-hidden"><PolicyReader key={previewArticle.id} article={previewArticle} onBack={()=>setViewMode('LIST')} preview/></div></div>;
  if(viewMode==='PREVIEW'&&previewArticle?.contentType)return <div className="space-y-4"><GoBackButton onClick={()=>setViewMode('LIST')}/><div className="h-[700px] max-w-md mx-auto border rounded-2xl overflow-hidden"><AppArticleDetailView article={previewArticle} campaigns={campaigns} activities={activities} onBack={()=>setViewMode('LIST')} triggerSound={triggerSound}/></div></div>;
  return (
    <div className="w-full space-y-6">

      {/* ========================================================================= */}
      {/* 視圖一：文章管理列表 (Article List) */}
      {/* ========================================================================= */}
      {actionPanel&&(()=>{const art=articles.find(a=>a.id===actionPanel.id);if(!art)return null;return <div className="fixed inset-0 z-[100] bg-black/50 p-5 flex items-center justify-center"><GoSurface className="go-type go-preview-scroll p-5 w-full max-w-3xl space-y-5"><div className="flex justify-between items-center"><h3>{{DETAILS:'文章詳情',REVIEW:'審核記錄',PUBLISH:'發佈文章'}[actionPanel.mode]}</h3><GoModalClose onClick={()=>setActionPanel(undefined)}/></div><p className="font-semibold">{art.pinned&&<span className="mr-1 text-xs text-amber-600">置頂</span>}{art.title}</p>
      {actionPanel.mode==='DETAILS'&&<><dl className="grid grid-cols-2 gap-4 text-sm">{[['文章 ID',art.id],['英文標題',art.titleEn||'—'],['文章分類',art.category],['狀態',art.status==='PUBLISHED'?'已發佈':'草稿'],['作者',art.author],['是否重要',art.important?'是':'否'],['內容類型',art.contentType||'TEXT'],['可見範圍',art.visibility?.mode==='ALL'?'所有人':art.visibility?.ids.join('、')||'所有人'],['發佈時間',art.publishDate],['是否置頂',art.pinned?'是':'否'],['自動上下線',art.autoSchedule?`${art.onlineAt} 至 ${art.offlineAt}`:'未啟用'],['關聯活動',(art.linkedActivityIds||[]).join('、')||'—']].map(([label,value])=><div key={label}><dt className="text-slate-500">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl><h3>文章內容</h3><ArticleBody article={art}/></>}
      {actionPanel.mode==='REVIEW'&&<GoCmsTable><thead><tr><th>審核時間</th><th>審核人員</th><th>結果</th><th>審核意見</th></tr></thead><tbody>{art.reviewRecords?.map((r,i)=><tr key={i}><td>{r.at}</td><td>{r.reviewer}</td><td>{r.result}</td><td>{r.comment}</td></tr>)}{!art.reviewRecords?.length&&<tr><td colSpan={4}>暫無審核記錄</td></tr>}</tbody></GoCmsTable>}
      {actionPanel.mode==='PUBLISH'&&<><p>確認發佈此文章？發佈後按可見範圍及上下線設定展示。</p><GoButton onClick={()=>handleSaveArticleSubmit({preventDefault(){}},{...art,status:'PUBLISHED',publishDate:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Hong_Kong'})})}>確認發佈</GoButton></>}
      </GoSurface></div>})()}
      {viewMode === 'LIST' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                  內容發布管理
                </span>
                <span className="text-xs text-slate-400">文章列表</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                文章列表
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                選擇文章要關聯的活動，並查看關聯活動 ID。
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              type="button"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>新建文章</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="搜尋文章標題或摘要..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">文章分類：</span>
              {(['ALL', ...articleCategories]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? '全部分類' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <GoCmsTable>
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4">文章標題</th>
                    <th className="py-3 px-4">文章分類</th>
                    <th className="py-3 px-4">關聯活動</th>
                    <th className="py-3 px-4 text-center">瀏覽量</th>
                    <th className="py-3 px-4">發布時間</th>
                    <th className="py-3 px-4 text-center">狀態</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FileText size={36} className="mx-auto mb-2 opacity-40" />
                        <p>未找到符合條件的文章</p>
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => {
                      const legacyCampaigns = getLinkedCampaignsForArticle(art);
                      const linkedCamps = activities.filter(activity => art.linkedActivityIds?.includes(activity.id) || (!art.linkedActivityIds && activity.modules.some(module => module.type === 'VOTING' && legacyCampaigns.some(campaign => campaign.id === module.resourceId.split('::')[0]))));

                      return (
                        <tr key={art.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <ArticleImage
                                src={art.coverImage}
                                alt={art.title}
                                className="w-12 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {art.title}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                                  <span>{art.id}</span>
                                  <span>•</span>
                                  <span>作者：{art.author}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-[11px] whitespace-nowrap">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {linkedCamps.length > 0 ? (
                              <div className="space-y-1.5">
                                {linkedCamps.map(activity => (
                                  <div key={activity.id} className="p-2 rounded-xl border border-amber-200 bg-amber-50">
                                    <div className="text-xs font-mono text-blue-600 whitespace-nowrap">{activity.id}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">無關聯活動</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {art.viewCount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {art.publishDate.substring(0, 16)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-[11px] whitespace-nowrap">
                              {art.status === 'PUBLISHED' ? '已發布' : '草稿'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                              {['預覽','查看詳情','編輯','發佈'].map(label=><button key={label} type="button" disabled={label==='發佈'&&art.status==='PUBLISHED'} onClick={()=>{if(label==='預覽')handleOpenPreview(art);else if(label==='編輯')handleOpenEdit(art);else setActionPanel({id:art.id,mode:label==='查看詳情'?'DETAILS':'PUBLISH'});}} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">{label==='預覽'&&<Eye size={12}/>} {label==='編輯'&&<Edit3 size={12}/>} {label}</button>)}
                              <details className="shrink-0 text-left"><summary className="cursor-pointer list-none px-2.5 py-1 border border-slate-300 rounded-lg text-[11px] font-bold">更多</summary><div className="flex flex-col gap-1 mt-2 p-2 border border-slate-200 bg-white dark:bg-slate-900 rounded-lg">
                                <button type="button" className="text-left px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setActionPanel({id:art.id,mode:'REVIEW'});}}>查看審核記錄</button>
                                <button type="button" className="text-left px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');onSaveArticle({...art,pinned:!art.pinned});}}>{art.pinned?'取消置頂':'置頂'}</button>
                                {(art.category==='政策同意書'||art.category==='年度 COI 申報')&&<><button type="button" className="text-left px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setPolicyId(art.id);}}>完成進度</button><button type="button" className="text-left px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={event=>{event.currentTarget.closest('details')?.removeAttribute('open');setNotificationId(art.id);}}>提醒與跟進</button></>}
                              </div></details>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </GoCmsTable>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 視圖二：寫文章 / 編輯文章表單 */}
      {/* ========================================================================= */}
      {viewMode === 'FORM' && editingArticle && (
        <form onSubmit={handleSaveArticleSubmit} className="space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <GoBackButton onClick={()=>setViewMode('LIST')}/>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {editingArticle.title ? `編輯文章：${editingArticle.title}` : '新建文章'}
                </h2>
                <span className="text-xs font-mono text-slate-400">文章編號：{editingArticle.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={uploadBusy}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={15} />
                <span>保存並發布文章</span>
              </button>
            </div>
          </div>

          <ArticleEditorFields article={editingArticle} onChange={setEditingArticle} activities={activities} busyChange={setUploadBusy} onLink={()=>{setSelectedVoteCampaignIds(editingArticle.linkedActivityIds||[]);setShowInsertVoteModal(true)}}/>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 視圖三：文章即時預覽 (包含真實解析渲染活動及多個投票組件) */}
      {/* ========================================================================= */}
      {viewMode === 'PREVIEW' && previewArticle && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewMode('LIST');
                  triggerSound(500, 'sine', 0.08);
                }}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                title="返回列表"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  文章與活動預覽模式 (前台 App 渲染效果)
                </h2>
                <span className="text-xs font-mono text-slate-400">{previewArticle.title}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenEdit(previewArticle)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 size={14} />
              <span>進入編輯</span>
            </button>
          </div>

          {/* Simulated App Mobile View Container */}
          <div className="max-w-md mx-auto bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
              <img src={previewArticle.coverImage} alt={previewArticle.title} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-2">
                <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full font-bold text-[10px]">
                  {previewArticle.category}
                </span>
                <h1 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                  {previewArticle.title}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{previewArticle.author}</span>
                  <span>•</span>
                  <span>{previewArticle.publishDate.substring(0, 10)}</span>
                </div>
              </div>
            </div>

            {/* Article Content with rendered [VOTE_ID] campaign widgets */}
            <div className="space-y-4">
              {(() => {
                const parts = previewArticle.content.split(/(\[VOTE_ID:\s*[^\]]+\])/g);
                return parts.map((part, index) => {
                  const match = part.match(/\[VOTE_ID:\s*([^\]]+)\]/);
                  if (match) {
                    const campaignId = match[1].trim();
                    const campaign = campaigns.find(c => c.id === campaignId);
                    if (!campaign) {
                      return (
                        <div key={index} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-600">
                          [找不到活動編號為 {campaignId} 的投票活動]
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="my-3">
                        <AppVotingWidget
                          campaign={campaign}
                          onVoteSubmit={onVoteSubmit}
                          userVotedOptionIds={userVotes[campaign.id] || []}
                          isLoggedIn={true}
                          triggerSound={triggerSound}
                        />
                      </div>
                    );
                  }

                  if (!part.trim()) return null;

                  return (
                    <div key={index} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line shadow-xs font-sans">
                      {part}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 彈出視窗：關聯活動 Modal ([📊 關聯活動]) */}
      {/* 按照「一個活動關聯多個投票」的形式清楚展示 */}
      {/* ========================================================================= */}
      {showInsertVoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    關聯活動
                  </h3>
                  <p className="text-[11px] text-slate-400">勾選要關聯至文章的活動，以下顯示活動 ID 和活動名稱</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInsertVoteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Campaign Selection List (Each Campaign with its nested Vote Items) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activities.map(activity => (
                <label key={activity.id} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer">
                  <input type="checkbox" checked={selectedVoteCampaignIds.includes(activity.id)}
                    onChange={event => setSelectedVoteCampaignIds(ids => event.target.checked ? [...ids, activity.id] : ids.filter(id => id !== activity.id))} />
                  <div><div className="text-xs font-mono text-blue-600">{activity.id}</div><div className="text-sm font-bold">{activity.title}</div></div>
                </label>
              ))}
              {!activities.length && <p className="text-sm text-slate-500">暫無可關聯活動，請先建立活動。</p>}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                已選取 <strong className="text-amber-600 font-bold">{selectedVoteCampaignIds.length}</strong> 個活動
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInsertVoteModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={selectedVoteCampaignIds.length === 0}
                  onClick={handleConfirmInsertVotes}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>確認關聯至文章</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
