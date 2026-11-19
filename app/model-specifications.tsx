import {useId} from 'react';
import {localText, type SiteConfig} from '@/lib/site';

const groups = [
  {id:'performance', uk:'Продуктивність та умови сушіння', en:'Capacity and drying conditions', ids:['spec-0','spec-1','spec-2','grain-temperature']},
  {id:'construction', uk:'Габарити та конструкція', en:'Dimensions and construction', ids:['spec-3','spec-4','spec-5','spec-7','spec-9','spec-11']},
  {id:'power', uk:'Потужність обладнання', en:'Equipment power', ids:['spec-8','spec-10','spec-12','spec-13','spec-14','spec-15','electrical-working','burner-total']},
];
const groupedIds = new Set(groups.flatMap(group=>group.ids));

export function ModelSpecifications({specifications,en}:{specifications:SiteConfig['models'][number]['specifications'];en:boolean}) {
  const headingPrefix=useId();
  const sections = [...groups.map(group=>({...group,rows:specifications.filter(spec=>group.ids.includes(spec.id))})),
    {id:'other',uk:'Інші характеристики',en:'Other specifications',rows:specifications.filter(spec=>!groupedIds.has(spec.id))}];
  return <div className="model-specification-groups">{sections.filter(group=>group.rows.length).map(group=><section className="model-specification-group" key={group.id} aria-labelledby={`${headingPrefix}-${group.id}`}>
    <h3 id={`${headingPrefix}-${group.id}`}>{en?group.en:group.uk}</h3>
    <dl className="model-specs">{group.rows.map(spec=><div key={spec.id} data-spec-id={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl>
  </section>)}</div>;
}
