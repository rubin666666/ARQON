import { Fragment } from 'react';

export function CopyAccent({ text, phrase }: { text: string; phrase: string }) {
  return <>{text.split(phrase).map((part, index) => <Fragment key={index}>{index > 0 && <strong className="copy-accent">{phrase}</strong>}{part}</Fragment>)}</>;
}
