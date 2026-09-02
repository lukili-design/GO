/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VoteArticle, VotingCampaign } from '../../types';
import { 
  Search, Plus, Edit3, Trash2, FileText, CheckCircle2, 
  BarChart2, Eye, Calendar, User, ArrowLeft, Check, 
  Sparkles, Layers, Image as ImageIcon, HelpCircle, X,
  ExternalLink, Sliders
} from 'lucide-react';
import { AppVotingWidget } from './AppVotingWidget';

interface ArticleManagerProps {
  articles: VoteArticle[];
  campaigns: VotingCampaign[];
  onSaveArticle: (article: VoteArticle) => void;
  onDeleteArticle: (articleId: string) => void;
  onVoteSubmit?: (campaignId: string, phaseId: string, optionIds: string[]) => void;
  userVotes?: Record<string, string[]>;
  triggerSound: (freq: number, type: OscillatorType, duration: number) => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({
  articles,
  campaigns,
  onSaveArticle,
  onDeleteArticle,
  onVoteSubmit,
  userVotes = {},
  triggerSound
}) => {
  // Mode: 'LIST' | 'FORM' | 'PREVIEW'
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'PREVIEW'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form State
  const [editingArticle, setEditingArticle] = useState<VoteArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<VoteArticle | null>(null);

  // Insert Vote Modal State
  const [showInsertVoteModal, setShowInsertVoteModal] = useState(false);
  const [selectedVoteCampaignIds, setSelectedVoteCampaignIds] = useState<string[]>([]);

  // Filtered Articles
  const filteredArticles = articles.filter(art => {
    const matchSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || art.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Open Create Article
  const handleOpenCreate = () => {
    const newId = `ART-2026-${String(articles.length + 1).padStart(3, '0')}`;
    setEditingArticle({
      id: newId,
      title: '',
      category: '焦點專題',
      author: 'TVB GO 互動編輯組',
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      summary: '',
      content: `請在此輸入文章正文內容...\n\n點擊工具欄上的 [📊 插入投票] 按鈕，即可在文內嵌入一個或多個即時互動投票活動模組！`,
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
    setEditingArticle(JSON.parse(JSON.stringify(art)));
    setViewMode('FORM');
    triggerSound(650, 'sine', 0.1);
  };

  // Open Preview Article
  const handleOpenPreview = (art: VoteArticle) => {
    setPreviewArticle(art);
    setViewMode('PREVIEW');
    triggerSound(700, 'sine', 0.08);
  };

  // Insert Selected Votes into Article Content
  const handleConfirmInsertVotes = () => {
    if (!editingArticle || selectedVoteCampaignIds.length === 0) {
      setShowInsertVoteModal(false);
      return;
    }

    let insertText = '\n\n';
    selectedVoteCampaignIds.forEach(id => {
      insertText += `[VOTE_ID: ${id}]\n\n`;
    });

    const updatedLinked = Array.from(new Set([...editingArticle.linkedCampaignIds, ...selectedVoteCampaignIds]));

    setEditingArticle({
      ...editingArticle,
      content: editingArticle.content + insertText,
      linkedCampaignIds: updatedLinked
    });

    setShowInsertVoteModal(false);
    setSelectedVoteCampaignIds([]);
    triggerSound(800, 'sine', 0.12);
  };

  // Save Article Submit
  const handleSaveArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!editingArticle.title.trim()) {
      alert('請填寫文章標題！');
      return;
    }

    // Auto extract linked campaign IDs from content
    const matches = editingArticle.content.match(/\[VOTE_ID:\s*([^\]]+)\]/g) || [];
    const extractedIds: string[] = matches.map(m => m.replace(/\[VOTE_ID:\s*|\]/g, '').trim());
    const finalLinked = Array.from(new Set([...editingArticle.linkedCampaignIds, ...extractedIds]));

    const finalArt: VoteArticle = {
      ...editingArticle,
      linkedCampaignIds: finalLinked
    };

    onSaveArticle(finalArt);
    setViewMode('LIST');
    triggerSound(880, 'sine', 0.15);
  };

  return (
    <div className="w-full space-y-6">

      {/* ========================================================================= */}
      {/* 視圖一：文章管理列表 (Article List) */}
      {/* ========================================================================= */}
      {viewMode === 'LIST' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                  內容管理中心
                </span>
                <span className="text-xs text-slate-400">文章與互動投票關聯</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                文章列表與投票關聯管理
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                在文章正文中一鍵插入多個投票活動佔位符，前台 App 即刻渲染高互動投票卡片。
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
              <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">專題分類：</span>
              {(['ALL', '焦點專題', '幕後花絮', '活動公告'] as const).map((cat) => (
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
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4">文章標題</th>
                    <th className="py-3 px-4">專題分類</th>
                    <th className="py-3 px-4">關聯投票活動</th>
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
                      const voteMatches = (art.content.match(/\[VOTE_ID:\s*([^\]]+)\]/g) || []).length;
                      return (
                        <tr key={art.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={art.coverImage}
                                alt={art.title}
                                className="w-12 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div>
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
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-[11px]">
                              {art.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {voteMatches > 0 ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                                <BarChart2 size={13} className="text-amber-600" />
                                <span>已關聯 {voteMatches} 個投票模組</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">無關聯投票</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                            {art.viewCount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {art.publishDate}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                              {art.status === 'PUBLISHED' ? '已發布' : '草稿'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Preview Button */}
                              <button
                                onClick={() => handleOpenPreview(art)}
                                type="button"
                                title="預覽文章與投票組件"
                                className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Eye size={12} />
                                <span>預覽</span>
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEdit(art)}
                                type="button"
                                title="編輯文章"
                                className="px-2 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Edit3 size={12} />
                                <span>編輯</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  if (confirm(`確定要刪除「${art.title}」文章嗎？`)) {
                                    onDeleteArticle(art.id);
                                    triggerSound(350, 'triangle', 0.15);
                                  }
                                }}
                                type="button"
                                title="刪除文章"
                                className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
                  {editingArticle.title ? `編輯文章：${editingArticle.title}` : '新建專題文章'}
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
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={15} />
                <span>保存並發布文章</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 標題 */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  文章標題 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="請輸入吸引人的文章標題..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 分類 */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  專題分類
                </label>
                <select
                  value={editingArticle.category}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="焦點專題">焦點專題</option>
                  <option value="幕後花絮">幕後花絮</option>
                  <option value="活動公告">活動公告</option>
                  <option value="節目資訊">節目資訊</option>
                </select>
              </div>

              {/* 封面圖 */}
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  文章封面圖網址
                </label>
                <input
                  type="text"
                  value={editingArticle.coverImage}
                  onChange={(e) => setEditingArticle({ ...editingArticle, coverImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 作者 */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  發布作者
                </label>
                <input
                  type="text"
                  value={editingArticle.author}
                  onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 摘要 */}
              <div className="md:col-span-3 space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  文章簡述/導言
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.summary}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  placeholder="請輸入文章導言摘要..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Editor Toolbar & Content */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  文章正文內容 (支援插入多個互動投票模組)
                </label>

                {/* 🌟 核心按鈕：[📊 插入投票] */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVoteCampaignIds([]);
                    setShowInsertVoteModal(true);
                    triggerSound(700, 'sine', 0.1);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <BarChart2 size={14} className="text-amber-100" />
                  <span>📊 插入投票</span>
                </button>
              </div>

              <textarea
                rows={10}
                value={editingArticle.content}
                onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                placeholder="在正文中任意位置輸入 [VOTE_ID: 活動編號]，發布後系統將自動將其替換為即時互動投票組件..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              />

              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <HelpCircle size={14} className="text-indigo-500 shrink-0" />
                <span>提示：您可以多次點擊「📊 插入投票」，一篇文章內可自由嵌入多個不同投票活動（如最佳男主角、最佳女主角、最佳劇集等）。</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 視圖三：文章即時預覽 (包含真實解析渲染投票卡片) */}
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
                  文章預覽模式 (前台 App 渲染效果)
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
              <div className="p-4 space-y-3">
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

            {/* Article Content with rendered [VOTE_ID] widgets */}
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
                          [找不到活動編號為 {campaignId} 的投票模組]
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
      {/* 彈出視窗：插入投票活動 Modal ([📊 插入投票]) */}
      {/* ========================================================================= */}
      {showInsertVoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    插入投票活動模組
                  </h3>
                  <p className="text-[11px] text-slate-400">勾選欲插入文章之進行中投票活動（支援多選）</p>
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

            {/* Campaign Selection List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {campaigns.map((camp) => {
                const isSelected = selectedVoteCampaignIds.includes(camp.id);
                const curPhase = camp.phases.find(p => p.id === camp.currentPhaseId) || camp.phases[0];

                return (
                  <div
                    key={camp.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedVoteCampaignIds(selectedVoteCampaignIds.filter(id => id !== camp.id));
                      } else {
                        setSelectedVoteCampaignIds([...selectedVoteCampaignIds, camp.id]);
                      }
                      triggerSound(700, 'sine', 0.05);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}>
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                      </div>

                      <img src={camp.coverImage} alt={camp.title} className="w-12 h-8 rounded-lg object-cover border shrink-0" />

                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {camp.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{camp.id}</span>
                          <span>•</span>
                          <span>階段：{curPhase?.name}</span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full font-bold text-[10px] shrink-0">
                      {camp.status === 'ACTIVE' ? '進行中' : '可插入'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                已選取 <strong className="text-amber-600 font-bold">{selectedVoteCampaignIds.length}</strong> 個投票模組
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
                  <span>確認插入文章</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
