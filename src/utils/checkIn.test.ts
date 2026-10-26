import test from 'node:test';
import assert from 'node:assert/strict';
import {expectedCheckInMailTime,checkInSettingsProblem,checkInSendProblem,activityDisplayStatus,assignGroups,banquetDemo,checkInProblem,parsePeopleCSV,publishProblem} from './checkIn';
function fixture(){const a=banquetDemo();a.startTime='2027-02-01 18:00:00';a.endTime='2027-02-01 22:00:00';a.checkIn!.opensAt='2027-02-01 17:30:00';return a;}
const ms=(s:string)=>new Date(s).getTime();
test('draft never auto-publishes; published status follows times',()=>{const a=fixture();assert.equal(activityDisplayStatus(a,ms('2027-02-02T00:00:00')),'草稿');a.status='PUBLISHED';assert.equal(activityDisplayStatus(a,ms('2027-02-01T17:59:59')),'待開始');assert.equal(activityDisplayStatus(a,ms('2027-02-01T18:00:00')),'進行中');assert.equal(activityDisplayStatus(a,ms('2027-02-01T22:00:00')),'已結束');});
test('CSV handles BOM, quotes, duplicates and invalid email',()=>{const result=parsePeopleCSV('\uFEFF員工編號,姓名,部門,電郵\r\n1,"陳,小明",行政部,a@example.com\r\n1,重複,行政部,b@example.com\n2,無效,行政部,bad',[]);assert.equal(result.people.length,1);assert.equal(result.people[0].name,'陳,小明');assert.equal(result.errors.length,2);assert.equal(parsePeopleCSV('員工編號,姓名,部門,電郵\n1,小明,行政部,a@example.com',result.people).people.length,0);});
test('publish requires complete allocation and generated invitations; no emails sent',()=>{const a=fixture();assert.match(publishProblem(a),/導入/);a.checkIn!.people=parsePeopleCSV('員工編號,姓名,部門,電郵\n1,小明,行政部,a@example.com\n2,小李,財務部,b@example.com',[]).people;assert.match(publishProblem(a),/分組/);a.checkIn!.people=assignGroups(a.checkIn!);assert.match(publishProblem(a),/邀請函/);a.checkIn!.people=a.checkIn!.people.map(p=>({...p,invitationReady:true}));assert.equal(publishProblem(a),'');assert.ok(a.checkIn!.people.every(p=>p.mailStatus==='NOT_SENT'));a.checkIn!.people[1].seat=a.checkIn!.people[0].seat;assert.match(publishProblem(a),/重複/);});
test('check in allows early admission only after publishing and open time, rejects duplicate/foreign/late',()=>{const a=fixture();const p=parsePeopleCSV('員工編號,姓名,部門,電郵\n1,小明,行政部,a@example.com',[]).people[0];assert.match(checkInProblem(a,p,ms('2027-02-01T17:30:00')),/發布/);a.status='PUBLISHED';assert.match(checkInProblem(a,p,ms('2027-02-01T17:29:59')),/開放/);assert.equal(checkInProblem(a,p,ms('2027-02-01T17:30:00')),'');assert.match(checkInProblem(a,p,ms('2027-02-01T22:00:00')),/結束/);assert.match(checkInProblem(a,undefined),/無效/);p.checkedAt='2027-02-01 17:35:00';assert.match(checkInProblem(a,p),/重複/);});
test('grouping respects capacity, preserves identities and flags sent invitations for refresh',()=>{const a=fixture();a.checkIn!.capacity=2;a.checkIn!.people=parsePeopleCSV('員工編號,姓名,部門,電郵\n1,A,行政,a@example.com\n2,B,財務,b@example.com\n3,C,行政,c@example.com',[]).people;a.checkIn!.people[0].mailStatus='SENT';const assigned=assignGroups(a.checkIn!);assert.equal(new Set(assigned.map(p=>p.group)).size,2);assert.equal(new Set(assigned.map(p=>p.group+':'+p.seat)).size,3);assert.equal(assigned.find(p=>p.employeeId==='1')!.needsResend,true);assert.equal(assigned.find(p=>p.employeeId==='1')!.token,a.checkIn!.people[0].token);});

test('configured check-in cutoff is enforced with legacy end-time fallback',()=>{
 const a=fixture();a.status='PUBLISHED';const p=parsePeopleCSV('員工編號,姓名,部門,電郵\n1,小明,行政部,a@example.com',[]).people[0];
 a.checkIn!.closesAt='2027-02-01 19:00:00';
 assert.equal(checkInProblem(a,p,ms('2027-02-01T18:59:59')),'');
 assert.match(checkInProblem(a,p,ms('2027-02-01T19:00:00')),/截止/);
 a.checkIn!.closesAt='2027-02-01 23:00:00';assert.match(checkInSettingsProblem(a),/活動結束/);
 a.checkIn!.closesAt='2027-02-01 17:00:00';assert.match(checkInSettingsProblem(a),/晚於開放/);
 delete a.checkIn!.closesAt;assert.equal(checkInSettingsProblem(a),'');
});
test('email delivery requires publication, valid content, and scheduled time',()=>{
 const a=fixture();assert.match(checkInSendProblem(a),/發布/);a.status='PUBLISHED';
 a.checkIn!.emailSendAt='2027-02-01 12:00:00';
 assert.match(checkInSendProblem(a,ms('2027-02-01T11:59:59')),/尚未到/);
 assert.equal(checkInSendProblem(a,ms('2027-02-01T12:00:00')),'');
 a.checkIn!.emailSubject=' ';assert.match(checkInSendProblem(a),/主旨/);
 delete a.checkIn!.emailSubject;a.checkIn!.emailSendAt='2027-02-01 22:00:00';assert.match(checkInSettingsProblem(a),/發送時間/);
});

test('CSV company column preserves quoted names and supports legacy templates',()=>{
 const parsed=parsePeopleCSV('員工編號,姓名,部門,公司,電郵\n1,小明,行政部,"TVB, Limited",a@example.com',[]);
 assert.equal(parsed.errors.length,0);assert.equal(parsed.people[0].company,'TVB, Limited');assert.equal(parsed.people[0].email,'a@example.com');
 assert.equal(parsePeopleCSV('員工編號,姓名,部門,電郵\n2,小李,行政部,b@example.com',[]).people[0].company,'');
 assert.equal(parsePeopleCSV('員工編號,姓名,部門,公司,電郵\n1,小明,行政部,TVB,bad',[]).errors.length,1);
});
test('expected email time prefers individual schedule and only falls back to future initial batch',()=>{
 const c=fixture().checkIn!;c.emailSendAt='2027-02-01 12:00:00';const p=parsePeopleCSV('員工編號,姓名,部門,電郵\n1,小明,行政部,a@example.com',[]).people[0];
 assert.equal(expectedCheckInMailTime(p,c,ms('2027-02-01T11:00:00')),c.emailSendAt);
 assert.equal(expectedCheckInMailTime(p,c,ms('2027-02-01T13:00:00')),'');
 p.mailStatus='SENT';assert.equal(expectedCheckInMailTime(p,c,ms('2027-02-01T11:00:00')),'');
 p.scheduledSendAt='2027-02-02 12:00:00';assert.equal(expectedCheckInMailTime(p,c),p.scheduledSendAt);
});
