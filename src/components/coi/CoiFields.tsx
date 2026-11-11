import React from 'react';
import {GoCmsFormSection,formControlClass as control} from '../ui/GoUI';
import {Coi} from './coiModel';
export function CoiFields({value:draft,onChange}:{value:Coi;onChange:(c:Coi)=>void}){
 return <><GoCmsFormSection title="COI申報設定"><div className="grid md:grid-cols-2 gap-4">{[['year','申報年度','number'],['url','外部申報連結','url']].map(([key,label,type])=><label key={key}>{label} *<input required type={type} className={control} value={String(draft[key as keyof Coi]||'')} onChange={e=>onChange({...draft,[key]:e.target.value})}/></label>)}</div></GoCmsFormSection></>;
}
