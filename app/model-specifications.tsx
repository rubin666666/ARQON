import {useId} from 'react';
import {localText, type SiteConfig} from '@/lib/site';

import {groupSpecifications} from '@/lib/model-specification-groups';

export function ModelSpecifications({specifications,en}:{specifications:SiteConfig['models'][number]['specifications'];en:boolean}) {
  const headingPrefix=useId();
  const sections = groupSpecifications(specifications);
  return <div className="model-specification-groups">{sections.map(group=><section className="model-specification-group" key={group.id} aria-labelledby={`${headingPrefix}-${group.id}`}>
    <h3 id={`${headingPrefix}-${group.id}`}>{en?group.en:group.uk}</h3>
    <dl className="model-specs">{group.rows.map(spec=><div key={spec.id} data-spec-id={spec.id}><dt>{localText(spec.label,en)}</dt><dd>{localText(spec.value,en)}</dd></div>)}</dl>
  </section>)}</div>;
}
