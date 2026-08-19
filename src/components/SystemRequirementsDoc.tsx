/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const SystemRequirementsDoc: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-slate-900 dark:text-slate-100 shadow-sm font-sans">
      
      {/* Title */}
      <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
        需求說明文檔
      </h2>

      <div className="space-y-6 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
        
        {/* Section 1: 用戶端 (APP + PC) 業務邏輯 */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white">
            用戶端 (APP + PC) 業務邏輯：
          </h3>

          <div className="space-y-1.5 pl-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">四種訪客類型定義與區別：</p>
            <p><strong>個人訪客：</strong>1 人單獨到訪，生成 1 張個人專屬通行證。</p>
            <p><strong>多人同行：</strong>多人同時同行到訪，共用 1 張電子通行證（1 個二維碼），展示全員名單，由代表出示條碼一次性同行核銷入場。</p>
            <p><strong>多人分行：</strong>多人分頭 / 不同時間到訪，每位成員需填寫獨立電郵，系統生成專屬電子通行證（如 PASS-B002-1、PASS-B002-2），可獨立下載/發送電郵並各自獨立掃碼入場。</p>
            <p><strong>團隊訪客：</strong>團體/劇組同列進出，僅填寫領隊聯絡人與總人數，生成 1 張團體通行證由領隊統一帶隊核銷。</p>
          </div>

          <div className="space-y-1.5 pl-2 pt-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">APP【我的預約】4 個 Tab 頁面狀態規則：</p>
            <p><strong>待審核：</strong>等待審核中，可取消預約，不提供通行證下載/分享。-需要在CMS配置訪客預約需要審核才顯示此模塊。</p>
            <p><strong>待到訪：</strong>審核通過或免審自動生效，具備「查看通行證」按鈕（支援保存圖片、發送電郵、取消預約）。</p>
            <p><strong>進行中：</strong>現場安保終端首次掃碼核銷成功後轉入，單次訪問當天有效，多次訪問在有效期內可重複通行。</p>
            <p><strong>歷史/已取消：</strong>已簽退離場或被主動取消的歸檔紀錄。</p>
          </div>

          <div className="space-y-1.5 pl-2 pt-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">二維碼有效性：</p>
            <p><strong>單次有效：</strong>預約當天日期可以掃碼成功、到達第二個自然日自動變為【歷史】</p>
            <p><strong>有效期內多次有效：</strong>預約開始當天-預約結束時間可以多次掃碼、達到結束時間自動變為【歷史】</p>
          </div>
        </div>

        {/* Section 2: CMS 後台管理端 業務邏輯 */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm sm:text-base text-slate-950 dark:text-white">
            CMS 後台管理端 業務邏輯：
          </h3>

          <div className="space-y-1.5 pl-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">審核狀態 (Approval Status)：</p>
            <p><strong>待審核 ：</strong>等待審批，無法生成有效電子通行證。</p>
            <p><strong>已核准 ：</strong>審核通過或免審自動放行。</p>
            <p><strong>已拒絕：</strong>管理員駁回申請。</p>
            <p><strong>已取消：</strong>發起人主動撤回。</p>
          </div>

          <div className="space-y-1.5 pl-2 pt-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">到訪狀態 ：</p>
            <p><strong>待到訪 ：</strong>已核准生效，訪客尚未掃碼。</p>
            <p><strong>進行中：</strong>安保終端掃碼核銷成功，正在廠區內訪問。</p>
            <p><strong>歷史：</strong>訪客時間到期或單次預約已過期。</p>
            <p><strong>已取消 (Cancelled)：</strong>預約遭取消。</p>
          </div>
        </div>

      </div>

    </div>
  );
};
