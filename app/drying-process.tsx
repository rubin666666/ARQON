import description from '@/config/dryer-description.json';
const stages=[description.steps[0],description.steps[1],description.steps[4]];
export function DryingMarkers({activeStage}:{activeStage?:number}){
 return <span className="drying-markers" aria-hidden="true"><span data-active={activeStage===1} className="drying-marker stage-loading">1</span><span data-active={activeStage===2} className="drying-marker stage-drying">2</span><span data-active={activeStage===3} className="drying-marker stage-cooling">3</span></span>;
}
export function DryingProcess({en,compact=false,activeStage}:{en:boolean;compact?:boolean;activeStage?:number}){
 return <ol className={`drying-process${compact?' drying-process-compact':''}`} aria-label={en?'Three stages on the diagram':'Три кроки на схемі'}>{stages.map((stage,index)=><li key={stage.title.en} aria-current={activeStage===index+1?'step':undefined}><span className="process-number" aria-hidden="true">{index+1}</span><div><h3>{stage.title[en?'en':'uk']}</h3>{!compact&&stage.paragraphs.map(paragraph=><p key={paragraph.en}>{paragraph[en?'en':'uk']}</p>)}</div></li>)}</ol>;
}
