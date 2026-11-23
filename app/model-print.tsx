'use client';
import {createPortal} from 'react-dom';
import {localText,type SiteConfig} from '@/lib/site';
import {groupSpecifications} from '@/lib/model-specification-groups';

export function ModelPrint({model,en}:{model:SiteConfig['models'][number];en:boolean}){
 return <><button type="button" className="text-link" onClick={()=>window.print()}>{en?'Print specifications':'Друкувати характеристики'}</button>{typeof document!=='undefined'&&createPortal(<article className="model-print-sheet">
  <p>ARQON · SAHARA</p><h1>{model.name} — {en?'Specifications':'Характеристики'}</h1>
  <p>{localText(model.description,en)}</p>
  {groupSpecifications(model.specifications).map(group=><section key={group.id}><h2>{en?group.en:group.uk}</h2><table><tbody>{group.rows.map(spec=><tr key={spec.id} data-print-spec={spec.id}><th scope="row">{localText(spec.label,en)}</th><td>{localText(spec.value,en)}</td></tr>)}</tbody></table></section>)}
  {localText(model.equipment,en)&&<p>{localText(model.equipment,en)}</p>}
 </article>,document.body)}</>;
}
