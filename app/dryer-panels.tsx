'use client';
import {Tabs} from '@base-ui/react/tabs';
import description from '@/config/dryer-description.json';
export default function DryerPanels({en}:{en:boolean}) {
const t=(uk:string,english:string)=>en?english:uk;
const copy=(value:{uk:string;en:string})=>value[en?'en':'uk'];
 const cards=(items:{title:{uk:string;en:string};paragraphs:{uk:string;en:string}[];points?:{uk:string;en:string}[];after?:{uk:string;en:string}}[],numbered=false)=><div className="dryer-description-grid">{items.map((item,index)=><div className="dryer-description-item" key={item.title.en}><h4>{numbered&&<span className="dryer-description-number">{String(index+1).padStart(2,'0')} </span>}{copy(item.title)}</h4><div className="dryer-description-body">{item.paragraphs.map(p=><p key={p.en}>{copy(p)}</p>)}{item.points&&<ul>{item.points.map(p=><li key={p.en}>{copy(p)}</li>)}</ul>}{item.after&&<p>{copy(item.after)}</p>}</div></div>)}</div>;
return (     <Tabs.Root defaultValue="process" className="dryer-dialog-tabs">
       <Tabs.List className="dryer-dialog-tablist" aria-label={t('Розділи опису сушарки','Dryer description sections')}>
         <Tabs.Tab value="process">{t('Процес сушіння','Drying process')}</Tabs.Tab>
         <Tabs.Tab value="controls">{t('Керування','Controls')}</Tabs.Tab>
         <Tabs.Tab value="benefits">{t('Переваги','Benefits')}</Tabs.Tab>
       </Tabs.List>
       <Tabs.Panel keepMounted value="process" className="dryer-dialog-panel"><h3>{copy(description.processTitle)}</h3>{cards(description.steps,true)}</Tabs.Panel>
       <Tabs.Panel keepMounted value="controls" className="dryer-dialog-panel"><h3>{t('Керування та режими роботи','Control and operating regimes')}</h3><div className="dryer-description-controls">{cards([description.overview,description.features[1]])}{cards([description.features[0],description.features[2]])}</div></Tabs.Panel>
       <Tabs.Panel keepMounted value="benefits" className="dryer-dialog-panel"><h3>{copy(description.benefitsTitle)}</h3>{cards(description.benefits,true)}</Tabs.Panel>
     </Tabs.Root>);
}
