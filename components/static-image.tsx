import {useState,type ImgHTMLAttributes} from 'react';
const placeholder='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><g fill="none" stroke="#888" stroke-width="3"><rect x="156" y="114" width="88" height="72" rx="8"/><circle cx="181" cy="135" r="7"/><path d="m160 178 25-27 18 18 15-15 23 24"/></g></svg>');
// Keep image dimensions and selectors intact, including images inside picture.
export default function StaticImage({onError,src,srcSet,alt,...props}:ImgHTMLAttributes<HTMLImageElement>){
 const [failed,setFailed]=useState<ImgHTMLAttributes<HTMLImageElement>['src']>();
 const unavailable=!!src&&failed===src;
 const showPlaceholder=(image:HTMLImageElement)=>{
   if(unavailable)return;
   const picture=image.parentElement;
   if(picture?.tagName==='PICTURE')picture.querySelectorAll('source').forEach(source=>source.removeAttribute('srcset'));
   setFailed(src);
 };
 // eslint-disable-next-line @next/next/no-img-element
 return <img {...props} ref={image=>{if(image?.complete&&image.naturalWidth===0&&image.currentSrc)queueMicrotask(()=>{if(image.isConnected)showPlaceholder(image);});}} src={unavailable?placeholder:src} srcSet={unavailable?undefined:srcSet} alt={alt||''} data-unavailable={unavailable||undefined} onError={event=>{showPlaceholder(event.currentTarget);onError?.(event);}}/>;
}
