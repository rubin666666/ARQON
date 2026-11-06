import description from '@/config/dryer-description.json';
const stages=[description.steps[0],description.steps[1],description.steps[4]];
export function DryingMarkers(){
 return <span className="drying-markers" aria-hidden="true"><span className="drying-marker stage-loading">1</span><span className="drying-marker stage-drying">2</span><span className="drying-marker stage-cooling">3</span></span>;
}
export function DryingProcess({en,compact=false}:{en:boolean;compact?:boolean}){
 return <ol className={`drying-process${compact?' drying-process-compact':''}`} aria-label={en?'Three stages on the diagram':'Три кроки на схемі'}>{stages.map((stage,index)=><li key={stage.title.en}><span className="process-number" aria-hidden="true">{index+1}</span><div><h3>{stage.title[en?'en':'uk']}</h3>{!compact&&stage.paragraphs.map(paragraph=><p key={paragraph.en}>{paragraph[en?'en':'uk']}</p>)}</div></li>)}</ol>;
}
