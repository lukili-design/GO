import type {VoteArticle} from '../types';
export function articleIsVisible(article:VoteArticle,employee:{employeeId:string;dept:string;staffType?:string;office?:string},now=Date.now()){
 if(article.status!=='PUBLISHED')return false;
 const offices=article.visibleOffices??(article.visibleOffice?[article.visibleOffice]:undefined);
 if(offices&&(!employee.office||!offices.includes(employee.office)))return false;
 const scope=article.visibility;
 if(scope?.mode==='STAFF_TYPES'&&(!employee.staffType||!scope.ids.includes(employee.staffType)))return false;
 if(scope?.mode==='EMPLOYEES'&&!scope.ids.includes(employee.employeeId))return false;
 if(scope?.mode==='DEPARTMENTS'&&!scope.ids.includes(employee.dept))return false;
 if(article.autoSchedule){const start=Date.parse(`${article.onlineAt}+08:00`),end=Date.parse(`${article.offlineAt}+08:00`);if(!Number.isFinite(start)||!Number.isFinite(end)||now<start||now>=end)return false;}
 return true;
}
