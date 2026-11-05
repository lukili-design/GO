import {test} from 'node:test';
import assert from 'node:assert/strict';
import {withActivityProjects,activityProjectsProblem} from './activityProjects';
import type {Activity} from '../types';
const base={id:'a',title:'活動',modules:[{id:'vote',type:'VOTING',title:'投票',enabled:true,order:1}]} as Activity;
test('project relations preserve voting and do not change source data',()=>{
 const next=withActivityProjects(base,[{id:'p',name:'組合',checkInId:'c',lotteryIds:['d1','d2'],order:5},{id:'p2',name:'抽獎',lotteryIds:['d3'],order:3}]);
 assert.equal(base.modules.length,1);assert.equal(next.modules.length,5);
 assert.deepEqual(next.projects?.map(p=>p.order),[1,2]);
 assert.deepEqual(next.modules.filter(m=>m.type==='LOTTERY').map(m=>m.resourceId),['d1','d2','d3']);
});
test('reject empty, unnamed, and missing linked resources',()=>{
 const checkIn={id:'c',checkIn:{}} as Activity;
 const make=(checkInId:string|undefined,lotteryIds:string[])=>withActivityProjects(base,[{id:'p',name:'測試',checkInId,lotteryIds,order:1}]);
 assert.notEqual(activityProjectsProblem(make(undefined,[]),[],[]),'');
 assert.notEqual(activityProjectsProblem(make('missing',[]),[checkIn],[]),'');
 assert.notEqual(activityProjectsProblem(make(undefined,['missing']),[],[]),'');
 assert.equal(activityProjectsProblem(make('c',[]),[checkIn],[]),'');
 assert.equal(activityProjectsProblem(make(undefined,['d']),[],['d']),'');
 assert.equal(activityProjectsProblem(make('c',['d']),[checkIn],['d']),'');
});

test('source managers own associations and clearing a source removes stale project links',async()=>{
 const {relatedActivityProjects}=await import('./activityProjects');
 const activity=withActivityProjects(base,[{id:'stale',name:'舊關聯',checkInId:'c',lotteryIds:['d1'],order:1}]);
 const resources=[{id:'c',title:'簽到',checkIn:{},sourceActivityId:'a'} as Activity,{id:'c2',title:'僅簽到',checkIn:{},sourceActivityId:'a'} as Activity];
 const draws=[{id:'d1',title:'抽獎一',sourceActivityId:'a',source:'ACTIVITY',activityId:'c'},{id:'d2',title:'抽獎二',sourceActivityId:'a',source:'CSV',activityId:'',sourceCheckInId:'c'},{id:'d3',title:'獨立抽獎',sourceActivityId:'a',source:'CSV',activityId:''}];
 const result=relatedActivityProjects(activity,resources,draws);
 assert.deepEqual(result.map(p=>[p.checkInId,p.lotteryIds]),[['c',['d1','d2']],['c2',[]],[undefined,['d3']]]);
 assert.deepEqual(relatedActivityProjects(activity,resources.map(c=>({...c,sourceActivityId:undefined})),draws.map(d=>({...d,sourceActivityId:undefined}))),[]);
});
