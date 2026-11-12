'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- The image region supports keyboard panning. */
import {useRef,useState} from 'react';
import Image from 'next/image';

export function GalleryImage({src,alt,outline,en,onNavigate}:{src:string;alt:string;outline:boolean;en:boolean;onNavigate:(direction:number)=>void}){
 const [scale,setScale]=useState(1);
 const scaleRef=useRef(1);
 const viewport=useRef<HTMLElement>(null);
 const pointers=useRef(new Map<number,{x:number;y:number}>());
 const gesture=useRef<{x:number;y:number;multiple:boolean}|null>(null);
 const pinch=useRef<{distance:number;scale:number}|null>(null);
 function zoom(next:number){const value=Math.max(1,Math.min(4,next));scaleRef.current=value;setScale(value);if(value===1)viewport.current?.scrollTo(0,0);}
 function release(id:number){pointers.current.delete(id);pinch.current=null;}
 return <div className="gallery-image-tools">
 <fieldset className="gallery-zoom"><legend className="sr-only">{en?'Image zoom':'Масштаб зображення'}</legend>
 <button type="button" disabled={scale<=1} onClick={()=>zoom(scale-.5)} aria-label={en?'Zoom out image':'Зменшити зображення'}>−</button>
 <output aria-live="polite">{Math.round(scale*100)}%</output>
 <button type="button" disabled={scale>=4} onClick={()=>zoom(scale+.5)} aria-label={en?'Zoom in image':'Збільшити масштаб зображення'}>+</button>
 <button type="button" className="gallery-fit" disabled={scale===1} onClick={()=>zoom(1)}>{en?'Fit':'Вмістити'}</button>
 <span>{scale>1?(en?'Drag to explore':'Перетягуйте зображення'):(en?'Swipe to switch · Pinch to zoom':'Гортайте фото · Збільшуйте двома пальцями')}</span>
 </fieldset>
 <section className="gallery-image-viewport" ref={viewport} tabIndex={0} aria-label={en?'Zoomable gallery image':'Зображення галереї з масштабуванням'} onKeyDown={event=>{if(scaleRef.current>1&&event.key.startsWith('Arrow'))event.stopPropagation();}}
 onPointerDown={event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  event.currentTarget.setPointerCapture(event.pointerId);
  pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
  if(pointers.current.size===1)gesture.current={x:event.clientX,y:event.clientY,multiple:false};
  if(pointers.current.size===2){if(gesture.current)gesture.current.multiple=true;const [a,b]=[...pointers.current.values()];pinch.current={distance:Math.hypot(a.x-b.x,a.y-b.y),scale:scaleRef.current};}
 }}
 onPointerMove={event=>{const previous=pointers.current.get(event.pointerId);if(!previous)return;pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.current.size===2&&pinch.current){const [a,b]=[...pointers.current.values()];if(pinch.current.distance>0)zoom(pinch.current.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.current.distance);}else if(scaleRef.current>1){event.currentTarget.scrollLeft+=previous.x-event.clientX;event.currentTarget.scrollTop+=previous.y-event.clientY;}}}
 onPointerUp={event=>{const start=gesture.current;if(pointers.current.size===1&&start&&!start.multiple&&scaleRef.current===1&&event.pointerType==='touch'){const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)onNavigate(dx<0?1:-1);}gesture.current=null;release(event.pointerId);}}
 onPointerCancel={event=>{gesture.current=null;release(event.pointerId);}} onLostPointerCapture={event=>release(event.pointerId)}>
 <div className="gallery-image-canvas" style={{width:`${scale*100}%`,height:`${scale*100}%`}}><Image src={src} alt={alt} width={1024} height={1024} draggable={false} className={outline?'series-outline':undefined}/></div>
 </section></div>;
}
