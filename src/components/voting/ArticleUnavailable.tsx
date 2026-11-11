import React from 'react';
import {ArrowLeft,FileQuestion} from 'lucide-react';
import {GoButton} from '../ui/GoUI';

export function ArticleUnavailable({onBack}:{onBack:()=>void}){
 return <div className="go-type h-full bg-white flex flex-col">
  <header className="go-app-header"><GoButton variant="quiet" onClick={onBack}><ArrowLeft size={18}/>返回</GoButton></header>
  <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
   <div className="mb-6 rounded-full bg-slate-100 p-6 text-slate-400"><FileQuestion size={48} strokeWidth={1.5}/></div>
   <h2 className="text-xl font-semibold">暫時無法查看此文章</h2>
   <p style={{fontSize:16,lineHeight:1.75}} className="mt-3 text-slate-700">請將 TVB GO 更新至最新版本後再試。</p>
   <GoButton className="mt-8">前往升級</GoButton>
  </main>
 </div>;
}
