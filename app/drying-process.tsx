import description from '@/config/dryer-description.json';
const stages=[description.steps[0],description.steps[1],description.steps[4]];
export function DryingMarkers({activeStage,en=false,onSelect}:{activeStage?:number;en?:boolean;onSelect?:(stage:number)=>void}){
 const positions=['stage-loading','stage-drying','stage-cooling'];
 return <span className="drying-markers" aria-hidden={onSelect?undefined:true}>{stages.map((stage,index)=>onSelect?<button type="button" key={index} className={`drying-marker ${positions[index]}`} data-active={activeStage===index+1} aria-pressed={activeStage===index+1} aria-controls="drying-stage-description" aria-label={`${en?'Read stage':'Читати етап'} ${index+1}: ${stage.title[en?'en':'uk']}`} onClick={()=>onSelect(index+1)}>{index+1}</button>:<span key={index} className={`drying-marker ${positions[index]}`} data-active={activeStage===index+1}>{index+1}</span>)}</span>;
}
export function DryingProcess({en,compact=false,activeStage}:{en:boolean;compact?:boolean;activeStage?:number}){
 return <ol className={`drying-process${compact?' drying-process-compact':''}`} aria-label={en?'Three stages on the diagram':'Три кроки на схемі'}>{stages.map((stage,index)=><li key={stage.title.en} aria-current={activeStage===index+1?'step':undefined}><span className="process-number" aria-hidden="true">{index+1}</span><div><h3>{stage.title[en?'en':'uk']}</h3>{!compact&&stage.paragraphs.map(paragraph=><p key={paragraph.en}>{paragraph[en?'en':'uk']}</p>)}</div></li>)}</ol>;
}
