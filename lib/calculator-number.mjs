export function normalizeNumericText(value) { return value.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'); }
export function parseNumericText(value) {
 const text=normalizeNumericText(value);
 return text===''?null:/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)?Number(text):NaN;
}
// Commit numeric text without rounding or silently accepting invalid input.
export function commitNumericText(value) {
 const text=normalizeNumericText(value);
 if(!Number.isFinite(parseNumericText(text)))return text;
 return text.replace(/^(-?)\./,'$10.').replace(/\.$/,'');
}
export function formatNumericText(value, en=false) {
 const text=normalizeNumericText(value);
 if(!/^-?\d+(?:\.\d*)?$/.test(text))return value;
 const [whole,decimal]=text.split('.');
 return whole.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(decimal!==undefined?(en?'.':',')+decimal:'');
}
