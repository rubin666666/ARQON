const groups = [
  {id:'performance', uk:'Продуктивність та умови сушіння', en:'Capacity and drying conditions', ids:['spec-0','spec-1','spec-2','grain-temperature']},
  {id:'construction', uk:'Габарити та конструкція', en:'Dimensions and construction', ids:['spec-3','spec-4','spec-5','spec-7','spec-9','spec-11']},
  {id:'power', uk:'Потужність обладнання', en:'Equipment power', ids:['spec-8','spec-10','spec-12','spec-13','spec-14','spec-15','electrical-working','burner-total']},
];
const groupedIds = new Set(groups.flatMap(group=>group.ids));

export function groupSpecifications<T extends {id:string}>(specifications:T[]) {
  return [...groups.map(group=>({...group,rows:specifications.filter(spec=>group.ids.includes(spec.id))})),
    {id:'other',uk:'Інші характеристики',en:'Other specifications',rows:specifications.filter(spec=>!groupedIds.has(spec.id))}].filter(group=>group.rows.length);
}
