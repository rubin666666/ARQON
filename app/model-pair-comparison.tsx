import {localText,type SiteConfig} from '@/lib/site';
import {groupSpecifications} from '@/lib/model-specification-groups';
type Model=SiteConfig['models'][number];
export function ModelPairComparison({models,rows,en,onCalculate}:{models:Model[];rows:Model['specifications'];en:boolean;onCalculate:(id:string)=>void}){
 return <div className="model-pair-comparison"><div className="pair-model-names">{models.map(model=><strong key={model.id}>{model.name}</strong>)}</div>
 {groupSpecifications(rows).map(group=><section key={group.id}><h3>{en?group.en:group.uk}</h3>{group.rows.map(spec=><article className="pair-spec" data-pair-spec={spec.id} key={spec.id}><h4>{localText(spec.label,en)}</h4><dl>{models.map(model=><div key={model.id}><dt>{model.name}</dt><dd>{localText(model.specifications.find(row=>row.id===spec.id)?.value??{uk:'—',en:'—'},en)}</dd></div>)}</dl></article>)}</section>)}
 <div className="pair-actions">{models.map(model=><button type="button" className="button" key={model.id} onClick={()=>onCalculate(model.id)}>{en?'Calculate':'Розрахувати'} {model.name}</button>)}</div></div>;
}
