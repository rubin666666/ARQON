'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable diagram must be keyboard-focusable for arrow-key panning. */
import { useRef, useState } from 'react';
import Image from 'next/image';

export function DiagramViewer({src,alt,en}:{src:string;alt:string;en:boolean}) {
  const [scale,setScale]=useState(1);
  const viewport=useRef<HTMLElement>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinch=useRef<{distance:number;scale:number}|null>(null);
  const scaleRef=useRef(1);
  function zoom(next:number) {
    const value=Math.max(1,Math.min(4,next));
    scaleRef.current=value; setScale(value);
  }
  function release(id:number) { pointers.current.delete(id); pinch.current=null; }
  return <div className="diagram-viewer">
    <fieldset className="diagram-toolbar"><legend className="sr-only">{en?'Diagram zoom':'Масштаб схеми'}</legend>
      <button type="button" className="button button-secondary" disabled={scale<=1} onClick={()=>zoom(scale-.5)} aria-label={en?'Zoom out':'Зменшити'}>−</button>
      <output aria-live="polite">{Math.round(scale*100)}%</output>
      <button type="button" className="button button-secondary" disabled={scale>=4} onClick={()=>zoom(scale+.5)} aria-label={en?'Zoom in':'Збільшити'}>+</button>
      <button type="button" className="text-link" onClick={()=>{zoom(1);viewport.current?.scrollTo(0,0);}}>{en?'Reset':'Скинути'}</button>
    </fieldset>
    <p className="engineering-caption">{en?'Use + / − or pinch to zoom. Drag to explore the diagram.':'Змінюйте масштаб кнопками + / − або двома пальцями. Перетягуйте схему, щоб роздивитися деталі.'}</p>
    <section ref={viewport} className="diagram-viewport" tabIndex={0} aria-label={en?'Zoomable drying diagram':'Схема сушіння з масштабуванням'}
      onPointerDown={event=>{if(event.pointerType==='mouse'&&event.button!==0)return;event.currentTarget.setPointerCapture(event.pointerId);pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.current.size===2){const [a,b]=[...pointers.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),scale:scaleRef.current};}}}
      onPointerMove={event=>{const previous=pointers.current.get(event.pointerId);if(!previous)return;pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.current.size===2&&pinch.current){const [a,b]=[...pointers.current.values()];if(pinch.current.distance>0)zoom(pinch.current.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance);}else if(pointers.current.size===1){event.currentTarget.scrollLeft+=previous.x-event.clientX;event.currentTarget.scrollTop+=previous.y-event.clientY;}}}
      onPointerUp={event=>release(event.pointerId)} onPointerCancel={event=>release(event.pointerId)} onLostPointerCapture={event=>release(event.pointerId)}>
      <div className="diagram-canvas" style={{width:`${scale*100}%`}}><Image src={src} alt={alt} width={1536} height={864} draggable={false}/></div>
    </section>
  </div>;
}
