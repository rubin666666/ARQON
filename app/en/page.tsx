import Home from '../home';
import { metadataFor } from '@/lib/metadata';
export const dynamic = 'force-static';
export const metadata = metadataFor(true);
export default function Page() {
  return <Home initialEnglish />;
}
