export function normalizeNumericText(value) { return value.replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'); }
export function parseNumericText(value) {
 const text=normalizeNumericText(value);
 return text===''?null:/^-?\d+(?:\.\d*)?$/.test(text)?Number(text):NaN;
}
export function formatNumericText(value, en=false) {
 const text=normalizeNumericText(value);
 if(!/^-?\d+(?:\.\d*)?$/.test(text))return value;
 const [whole,decimal]=text.split('.');
 return whole.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(decimal!==undefined?(en?'.':',')+decimal:'');
}
