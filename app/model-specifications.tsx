import {useId,useRef} from 'react';
import {localText, type SiteConfig} from '@/lib/site';

import {groupSpecifications} from '@/lib/model-specification-groups';

export function ModelSpecifications({specifications,en}:{specifications:SiteConfig['models'][number]['specifications'];en:boolean}) {
  const headingPrefix=useId();
  const navigation=useRef<HTMLElement>(null);
  const sections = groupSpecifications(specifications);
  function jump(id:string){
    const heading=document.getElementById(`${headingPrefix}-${id}`);
    const body=heading?.closest('.model-dialog-scroll');
    if(!heading||!body)return;
    heading.focus({preventScroll:true});
    const inset=parseFloat(getComputedStyle(body).paddingTop)+12;
    body.scrollTo({top:body.scrollTop+heading.getBoundingClientRect().top-body.getBoundingClientRect().top-(navigation.current?.offsetHeight??0)-inset,behavior:'instant'});
  }
  const labels:Record<string,string>={performance:en?'Capacity':'Продуктивність',construction:en?'Construction':'Конструкція',power:en?'Power':'Потужність'};
  return <><nav className="model-spec-nav" ref={navigation} aria-label={en?'Specification groups':'Групи характеристик'}>{sections.map(group=><button type="button" key={group.id} onClick={()=>jump(group.id)}>{labels[group.id]??(en?group.en:group.uk)}</button>)}</nav><div className="model-specification-groups">{sections.map(group=><section className="model-specification-group" key={group.id} aria-labelledby={`${headingPrefix}-${group.id}`}>
    <h3 tabIndex={-1} id={`${headingPrefix}-${group.id}`}>{en?group.en:group.uk}</h3>
    <dl className="model-specs">{group.rows.map(spec=><div key={spec.id} data-spec-id={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl>
  </section>)}</div></>;
}
