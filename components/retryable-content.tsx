'use client';
import {Component, lazy, Suspense, type ComponentType, type ReactNode} from 'react';

export function LoadingPanel({en,error,retry}:{en:boolean;error?:boolean;retry?:()=>void}) {
  return <div className="content-loading" aria-live="polite"><output>{error?(en?'Could not load this content. Check your connection and retry.':'Не вдалося завантажити вміст. Перевірте з’єднання та спробуйте ще раз.'):(en?'Loading…':'Завантаження…')}</output>{error&&<button type="button" className="button" onClick={retry}>{en?'Try again':'Спробувати ще раз'}</button>}</div>;
}
class LoadBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?this.props.fallback:this.props.children;}
}
export function retryable<P extends object>(load:()=>Promise<{default:ComponentType<P>}>, moduleName:string, exportName='default') {
  return class RetryableContent extends Component<P & {loadingFallback?:(error:boolean,retry:()=>void)=>ReactNode;en:boolean}> {
    state={attempt:0,Content:lazy(load)};
    retry=()=>this.setState(({attempt}:{attempt:number})=>({attempt:attempt+1,Content:lazy(async()=>{
      // Safari caches failed module requests. The build supplies the exact chunk
      // URL so an explicit retry can use a fresh URL without reloading the page.
      const path=document.querySelector<HTMLMetaElement>(`meta[name="arqon-module-${moduleName}"]`)?.content;
      if(!path)return load();
      const url=new URL(path,location.href);
      if(url.origin!==location.origin)throw new Error('Invalid module origin');
      url.searchParams.set('retry',String(Date.now()));
      const loadedModule=await import(/* @vite-ignore */ url.href) as Record<string,ComponentType<P>>;
      return {default:loadedModule[exportName]};
    })}));
    render(){
      const {loadingFallback,...props}=this.props;
      const fallback=(error:boolean)=>loadingFallback?loadingFallback(error,this.retry):<LoadingPanel en={this.props.en} error={error} retry={this.retry}/>;
      const Content=this.state.Content;
      return <LoadBoundary key={this.state.attempt} fallback={fallback(true)}><Suspense fallback={fallback(false)}><Content {...props as P}/></Suspense></LoadBoundary>;
    }
  };
}
