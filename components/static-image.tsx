import type {ImgHTMLAttributes} from 'react';
// Pages has no image-optimization server. Preserve dimensions, lazy loading and
// the supplied asset URL while sharing the same page components with Vinext.
export default function StaticImage(props:ImgHTMLAttributes<HTMLImageElement>){
 // eslint-disable-next-line @next/next/no-img-element
 return <img {...props} alt={props.alt||''}/>;
}
