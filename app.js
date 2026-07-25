const collator = new Intl.Collator("ko-KR", { sensitivity: "base" });

const MODE1_RULES = [
  {
    name: "레보투스시럽", unit: "ml", freq: "tid", dur: "",
    type: "lookup",
    table: { 3:[10,20], 5:[20,30] },
    missing: "용량 확인 필요"
  },
  { name: "클래리건조시럽", unit: "ml", freq: "bid", dur: "5d", type: "range", min: d=>d/0.6, max: d=>d/0.3 },
  { name: "대웅아지트로마이신건조시럽", unit: "ml", freq: "qd", dur: "3d", type: "lowerOnly", min: d=>d/0.25 },
  { name: "크린세프 건조시럽", unit: "ml", freq: "tid", dur: "", type: "range", min: d=>d/0.53, max: d=>d/0.26 },
  { name: "옴니세프세립", unit: "g", freq: "tid", dur: "", type: "range", min: d=>d/0.06, max: d=>d/0.03 },
  { name: "바난건조시럽", unit: "ml", freq: "bid-tid", dur: "", type: "range", min: d=>d/0.45, max: d=>d/0.3 },
  { name: "아모크라듀오(bid)", unit: "ml", freq: "bid", dur: "", type: "range", min: d=>d/0.56, max: d=>d/0.31 },
  { name: "아모크라듀오(tid)", unit: "ml", freq: "tid", dur: "", type: "range", min: d=>(d*1.5)/0.56, max: d=>(d*1.5)/0.31 },
  {
    name: "타미플루캡슐용량", unit: "mg", freq: "bid", dur: "",
    type: "lookup",
    table: { 75:[40, Infinity], 60:[23,40], 45:[15,23], 30:[10,15] },
    missing: "용량 확인 필요"
  },
  {
    name: "한미플루현탁액", unit: "ml", freq: "bid", dur: "",
    type: "lookup",
    table: { 12.5:[40,Infinity], 10:[23,40], 7.5:[15,23], 5:[10,15], 4.5:[9,10], 4:[8,9], 3.5:[7,8], 3:[6,7], 2.5:[5,6], 2:[4,5], 1.5:[3,4] },
    missing: "용량 확인"
  },
  { name: "삼아아토크건조시럽", unit: "g", freq: "qd", dur: "", type: "lowerOnly", min: d=>round1(d/0.1) },
  { name: "씨투스 건조시럽(bid)", unit: "g", freq: "bid", dur: "", type: "lowerOnly", min: d=>round1(d/0.035) },
  { name: "씨투스 건조시럽(qd)", unit: "g", freq: "qd", dur: "", type: "lowerOnly", min: d=>round1(d/0.07) },
  { name: "어린이부루펜시럽", unit: "ml", freq: "tid", dur: "", type: "range", min: d=>d/0.5, max: d=>d/0.25 },
  { name: "맥시부펜시럽", unit: "ml", freq: "tid", dur: "", type: "range", min: d=>d/0.58, max: d=>d/0.42 },
  { name: "세토펜정325", unit: "정", freq: "tid", dur: "", type: "range", min: d=>(d*325)/32/0.47, max: d=>(d*325)/32/0.31 },
  { name: "세토펜현탁액", unit: "ml", freq: "tid", dur: "", type: "range", min: d=>d/0.47, max: d=>d/0.31 }
].sort((a,b)=>collator.compare(a.name,b.name));

const HEALTH_KR_DIRECT_URLS = {
  "대웅아지트로마이신건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AKP08C0117"
};

const MODE2_RULES = [
  { name:"레보투스시럽", type:"text", calc:w=>(w>10 && w<20) ? "3mL tid" : (w>=20 && w<=30) ? "5mL tid" : (w<=10) ? "체중 범위 확인 필요 (10-20kg 3ml tid)" : "체중 범위 확인 필요 (20-30kg 5ml tid)" },
  { name:"클래리건조시럽", type:"range", unit:"ml", freq:"bid", dur:"5d", min:w=>w*0.3, max:w=>w*0.6 },
  {
    name:"두드리진시럽(=이치리진)",
    type:"dual",
    ageText:a=> a>=6 ? "25-50ml/d" : "25ml/d",
    weightText:w=> `${round2(w*0.3)}ml/d`
  },
  { name:"대웅아지트로마이신건조시럽", type:"single", unit:"ml", freq:"qd", dur:"3d", val:w=>w*0.25 },
  { name:"세토펜정325", type:"text", calc:w=>`${round2(w*0.031)} ~ ${round2(w*0.046)}정 tid` },
  { name:"세토펜현탁액", type:"range", unit:"ml", freq:"tid", dur:"", min:w=>w*0.31, max:w=>w*0.47 },
  { name:"옴니세프세립", type:"range", unit:"g", freq:"tid", dur:"", min:w=>w*0.03, max:w=>w*0.06 },
  { name:"바난건조시럽", type:"range", unit:"ml", freq:"bid-tid", dur:"", min:w=>w*0.3, max:w=>w*0.45 },
  { name:"크린세프건조시럽", type:"range", unit:"ml", freq:"tid", dur:"", min:w=>w*0.26, max:w=>w*0.53 },
  { name:"아모크라듀오시럽(bid)", type:"range", unit:"ml", freq:"bid", dur:"", min:w=>w*0.31, max:w=>w*0.56 },
  { name:"아모크라듀오시럽(tid)", type:"range", unit:"ml", freq:"tid", dur:"", min:w=>(w*0.31)/1.5, max:w=>(w*0.56)/1.5 },
  { name:"어린이부루펜시럽", type:"range", unit:"ml", freq:"tid", dur:"", min:w=>w*0.25, max:w=>w*0.5 },
  { name:"맥시부펜시럽", type:"range", unit:"ml", freq:"tid", dur:"", min:w=>w*0.42, max:w=>w*0.58 },
  {
    name:"아디팜정",
    type:"dual",
    ageText:a=> a>=6 ? "5-10정/d (50-100mg/d)" : "5정/d (50mg/d)",
    weightText:w=> `${round2(w*0.06)}정/d (${round2(w*0.6)}mg/d)`
  },
  { name:"코니톱시럽(bid)(=암브로콜 록솔씨)", type:"text", calc:w=> w>=22?"15.0mL bid (30mL/d)":w>=16?"10.0mL bid (20mL/d)":w>=12?"7.5mL bid (15mL/d)":w>=8?"5.0mL bid (10mL/d)":w>=4?"2.5mL bid (5mL/d)":"투여정보없음"},
  { name:"코니톱시럽(tid)(=암브로콜 록솔씨)", type:"text", calc:w=> w>=22?"10.0mL tid (30mL/d)":w>=16?"6.7mL tid (20.1mL/d)":w>=12?"5.0mL tid (15mL/d)":w>=8?"3.4mL tid (10.2mL/d)":w>=4?"1.7mL tid (5.1mL/d)":"투여x"},
  { name:"삼아아토크건조시럽", type:"text", calc:w=>`${round2(w*0.1)}g/d` },
  { name:"씨투스건조시럽", type:"text", calc:w=>`${round2(w*0.035)}g bid (${round2(w*0.07)}g/d)` },
  { name:"타미플루캡슐", type:"text", calc:w=> w>40?"75mg bid":w>23?"60mg bid":w>15?"45mg bid":w>=10?"30mg bid":w>0?"현탁액으로 갈것":"투여정보없음" },
  { name:"한미플루현탁용분말", type:"text", calc:w=> w>40?"12.5mL bid":w>23?"10.0mL bid":w>15?"7.5mL bid":w>=10?"5.0mL bid":w>=9?"4.5mL bid":w>=8?"4.0mL bid":w>=7?"3.5mL bid":w>=6?"3.0mL bid":w>=5?"2.5mL bid":w>=4?"2.0mL bid":w>=3?"1.5mL bid":"투여정보없음" },
  { name:"소아용프리마란시럽", type:"text", calc:w=> w<12.2?"2세 미만 금기(확인요망)":w>=40?"10mL bid (Total: 20mL/d)":`${round2(w*0.25)}mL bid (${round2(w*0.5)}mL/d)` },
  { name:"프리마란정5", type:"text", calc:w=> {
    if (w < 12.2) return "2세 미만 금기";
    if (w >= 40) return "1정 bid, 5mg bid (2정/d, 10mg/d)";
    const singleMg = round2((w * 0.25) / 2);
    const singleTab = round2(singleMg / 5);
    const dailyMg = round2(w * 0.25);
    const dailyTab = round2(dailyMg / 5);
    return `${singleTab}정 bid, ${singleMg}mg bid (${dailyTab}정/d, ${dailyMg}mg/d)`;
  } },
  { name:"엘도스시럽", type:"text", calc:w=> w>=30?"10ml bid":w>=20?"5ml tid":w>=15?"5ml bid":"정보없음" },
  { name:"보령메이액트세립", type:"range", unit:"g", freq:"tid", dur:"", min:w=>Math.min(round2(w*0.03),2), max:w=>Math.min(round2(w*0.06),2) },
  {
    name:"셉트린정",
    type:"dual",
    ageText:a=> a<(2/12) ? "2개월 미만 금기" : (a>=6 && a<=11) ? "1정 bid" : (a>=3 && a<=5) ? "1/2정 bid" : "정보없음",
    weightText:w=> `${round2(w*0.0375)}정 bid (TMP ${round2(w*6)}mg/d, SMX ${round2(w*30)}mg/d)`
  }
].sort((a,b)=>collator.compare(a.name,b.name));

const MODE3_RULES = [
  {
    name:"뮤테란과립200",
    calc:a=> {
      if (a < 2) return "2세 미만 영아 복용하지 말것";
      const lines = [];
      if (a >= 2 && a < 6) lines.push("급성질환: 100 mg tid");
      else if (a >= 6 && a <= 14) lines.push("급성질환: 200 mg bid");

      if (a >= 6 && a <= 14) lines.push("만성질환: 100 mg tid");

      if (a >= 2 && a < 6) lines.push("낭성섬유증: 100 mg qid");
      else if (a >= 6) lines.push("낭성섬유증: 200 mg tid");

      return lines.length ? lines.join("\n") : "용량 확인 필요";
    }
  },
  { name:"액티피드시럽", calc:a=> a<=2?"2세 이하 금기":a>=12?"10mL q4-6. 1일 최대 4회(40mL) lexi":a>=6?"5mL q4-6. 1일 최대 4회(20mL) lexi":"2.5ml q6. 1일 최대 10ml[??]" },
  { name:"페니라민정", calc:a=> a<2?"2세 미만 복용하지 말것":a<6?"1mg q4-6h, 최대 6mg/d":a<12?"2mg q4-6h, 최대 12mg/d":"4mg q4-6h, 최대 24mg/d" },
  { name:"씨잘액", calc:a=> a>=6?"10mL qd":a>=2?"2.5mL bid":a>=1?"2.5mL qd":"투여x" },
  { name:"코미시럽 (=콜민에이)", calc:a=> a>=12?"10mL q4h (Max 60mL/d)":a>=6?"5mL q4h (Max 30mL/d)":a>=2?"의사 지시에 따름":"투여정보x" },
  { name:"움카민시럽", calc:a=> a>=12?"9mL tid":a>=6?"6mL tid":a>=1?"3mL tid":"사용되지 않아야 한다" },
  { name:"이텐시럽", calc:a=> a>=10?"5mg bid, 필요시 10mL bid":a>=3?"5mL bid":a>=0.5?"2.5mL bid":"투여x" },
  { name:"푸마티펜정", calc:a=> a>=10?"1정 bid (필요시 2정 bid)":a>=3?"1정 bid":"투여정보없음" },
  { name:"듀락칸이지시럽", calc:a=> a>=7?"처음 2~3일간 15mL/d, 그 후 10mL/d":a>=1?"5~10mL/d":"5mL/d" },
  { name:"포리부틴드라이", calc:a=> a>=5?"10ml tid":a>=1?"5ml tid":a>=0.5?"5ml bid":"2.5ml bid-tid" },
  { name:"포타겔현탁액", calc:a=> a>=19?"성인 용량: 20ml tid":"19세 미만 소아 금기 (복용하지 않음)" },
  { name:"프리비투스 현탁액", calc:a=> a>=15?"5ml tid":a>=7?"5ml bid":a>=4?"3ml bid":a>=2?"2ml bid":"투여정보없음" },
  { name:"노테몬패취", calc:a=> a>=9?"2mg":a>=3?"1mg":a>=0.5?"0.5mg":"투여정보x" },
  { name:"루키오 / 싱귤레어", calc:a=> a>=15?"10mg 정제 qd":a>=6?"5mg 츄정 qd":a>=2?"4mg 츄정 qd /\n4mg 세립제 qd":a>=0.5?"4mg 세립제 qd":"투여정보없음" },
  { name:"리나치올시럽", calc:a=> a<(24/12)?"24개월 미만 금기":(a>=6 && a<=12)?"250mg(12.5mL) tid":(a>=2)?"1일 250-500mg(12.5-25mL) 4회분할":"정보없음" },
  { name:"리나치올시럽5%", calc:a=> a>=13?"250-500mg(5-10mL) tid-qid":a>=6?"250mg(5mL) tid":a>=2?"1일 250-500mg(5-10mL) 4회분할":"정보없음" },
  { name:"헤브론시럽", calc:a=> a>=15?"100mg(5mL) tid":a>=4?"100mg(5mL) bid":a>=2?"50mg(2.5mL) tid":"정보없음" },
  { name:"후로스판액", calc:a=> "10mL bid" }
].sort((a,b)=>collator.compare(a.name,b.name));

const MERGED_MODE2_RULES = [
  ...MODE2_RULES.map(r => ({ ...r, basis: "weight", key: `W|${r.name}` })),
  ...MODE3_RULES.map(r => ({ ...r, basis: "age", key: `A|${r.name}` }))
].sort((a,b) => {
  const byName = collator.compare(a.name, b.name);
  if (byName !== 0) return byName;
  return collator.compare(a.basis, b.basis);
});

const MODE_COMPOSITION_HINTS = {
  "뮤테란과립200": "Acetylcysteine 200mg/g",
  "페니라민정": "Chlorpheniramine 2mg",
  "액티피드시럽": "Pseudoephedrine HCl 6mg/ml\nTriprolidine HCl 0.25mg/ml",
  "대웅아지트로마이신건조시럽": "40mg/ml",
  "옴니세프세립": "Cefdinir\n100 mg / 1 g",
  "두드리진시럽(=이치리진)": "Hydroxyzine HCl\n200 mg / 100 mL",
  "움카민시럽": "Pelargonium sidoides 11% EtOH extract · Maltodextrin mixture (1:4.56)\n1,144 mg / 100 mL",
  "듀락칸이지시럽": "Lactulose concentrate\n134 g / 100 mL",
  "이텐시럽": "Ketotifen fumarate\n0.276 mg/mL (Ketotifen 0.2 mg/mL)",
  "레보투스시럽": "Levodropropizine\n6 mg / mL",
  "코니톱시럽(bid)(=암브로콜 록솔씨)": "Ambroxol HCl 150mg/100mL\nClenbuterol HCl 0.1mg/100mL",
  "코니톱시럽(tid)(=암브로콜 록솔씨)": "Ambroxol HCl 150mg/100mL\nClenbuterol HCl 0.1mg/100mL",
  "맥시부펜시럽": "Dexibuprofen\n12 mg / mL",
  "루키오 / 싱귤레어": "Montelukast sodium",
  "코미시럽 (=콜민에이)": "Phenylephrine HCl + Chlorpheniramine\n1 mg + 0.4 mg / mL",
  "바난건조시럽": "Cefpodoxime Proxetil 50mg/g (Cefpodoxime 10mg/mL)",
  "바난 건조시럽": "Cefpodoxime Proxetil 50mg/g (Cefpodoxime 10mg/mL)",
  "크린세프건조시럽": "Cefaclor hydrate\n25 mg / mL",
  "삼아아토크건조시럽": "Formoterol Fumarate Hydrate 40μg/g",
  "클래리건조시럽": "Clarithromycin\n125 mg / 5 mL",
  "세토펜현탁액": "Acetaminophen\n32 mg / mL",
  "타미플루캡슐": "Oseltamivir",
  "소아용프리마란시럽": "Mequitazine\n500 μg / mL",
  "노테몬패취": "Tulobuterol",
  "씨잘액": "Levocetirizine\n0.5 mg / mL",
  "포리부틴드라이": "Trimebutine maleate\n7.87 mg / g (4.8 mg/mL)",
  "씨투스건조시럽": "Pranlukast\n100 mg / g",
  "포타겔현탁액": "Dioctahedral smectite\n150 mg / mL",
  "아디팜정": "Hydroxyzine HCl\n10 mg / tab",
  "푸마티펜정": "Ketotifen Fumarate 1.38mg(Ketotifen 1mg)",
  "아모크라듀오시럽(bid)": "Amoxicillin 40mg/mL\nPotassium Clavulanate 5.7mg/mL",
  "아모크라듀오시럽(tid)": "Amoxicillin 40mg/mL\nPotassium Clavulanate 5.7mg/mL",
  "프리마란정5": "Mequitazine\n5 mg / tab",
  "프리비투스현탁액": "Levocloperastine fendizoate\n7.08 mg / mL",
  "프리비투스 현탁액": "Levocloperastine fendizoate\n7.08 mg / mL",
  "어린이부루펜시럽": "Ibuprofen\n20 mg / mL",
  "한미플루현탁용분말": "Oseltamivir phosphate\n함량 정보: DB",
  "세토펜정325": "Acetaminophen\n325 mg / tab",
  "리나치올시럽": "Carbocysteine\n20 mg / mL (2%)",
  "리나치올시럽5%": "Carbocysteine\n50 mg / mL (5%)",
  "헤브론시럽": "Ivy leaf 70% Ethanol Fluid Ext.\n20 mg / mL",
  "엘도스시럽": "Erdosteine\n70 mg / g (3.5% 현탁액)",
  "보령메이액트세립": "Cefditoren Pivoxil\n100 mg / g",
  "셉트린정": "Sulfamethoxazole 400mg + Trimethoprim 80mg / tab",
  "후로스판액": "Phloroglucinol Hydrate\n8 mg / mL"
};

const MODE2_RESULT_HINTS = {
  "뮤테란과립200": "1. 급성질환\n6 ～ 14세 200 mg bid\n2 ～ 5세 100 mg tid\n\n2. 만성질환\n6 ～ 14세 100 mg tid\n\n3. 낭성섬유증\n6세 이상 200 mg tid\n2 ～ 5세 100 mg qid\n\n2세 미만 영아 복용하지 말것",
  "페니라민정": "12Y↑: 4mg을 4~6시간마다 복용; 최대 24mg/일\n6-12미만 : 2mg을 4~6시간마다 복용; 최대 12mg/일\n2-6미만 : 1mg을 4~6시간마다 복용; 최대6mg/일",
  "액티피드시럽": "12Y : 10mL q4-6. 1일 최대 4회(40mL) lexi\n\n6-12Y : 5mL q4-6. 1일 최대 4회(20mL) lexi\n\n2-5Y : 2.5ml q6. 1일 최대 10ml[??]\n\n2세 이하 금기",
  "레보투스시럽": "20-30 kg : 5ml tid q6\n\n10-20 kg : 3ml tid q6",
  "맥시부펜시럽": "(0.42-0.58)ml/kg",
  "바난건조시럽": "(0.3-0.45)ml/kg bid-tid",
  "삼아아토크건조시럽": "0.1g/kg/d 2-3회 분할",
  "세토펜정325": "(0.031 ~ 0.046)정/kg",
  "세토펜현탁액": "(0.31-0.47)ml/kg",
  "옴니세프세립": "(0.03-0.06)g/kg tid",
  "소아용프리마란시럽": "40kg↑ 20ml/d\n\n40kg ↓ 0.5ml/kg/d",
  "씨잘액": "6Y- : 10ml(5mg) qd\n\n2-6Y : 2.5ml(1.25mg) bid\n\n1-2Y : 2.5mL(1.25mg) qd",
  "씨투스건조시럽": "0.035g/kg bid",
  "이텐시럽": "3Y- : ~10ml/3 tid  5ml bid\n\n0.5-3Y : ~5ml/3 tid  2.5ml bid",
  "아모크라듀오시럽(bid)": "(0.31-0.56)ml/kg bid",
  "아모크라듀오시럽(tid)": "(0.21-0.37)ml/kg tid",
  "어린이부루펜시럽": "(0.25-0.5)ml/kg",
  "아디팜정": "불안, 소양\n6세 이상: 5-10정/d(50-100mg/d)\n6세 미만: 5정/d(50mg/d)\n\n진정보조\n0.06정/kg(0.6mg/kg)",
  "코니톱시럽(bid)(=암브로콜 록솔씨)": "22-35kg : 15.0mL bid\n\n16-22kg : 10.0mL bid\n\n12-16kg : 7.5mL bid\n\n8-12kg : 5.0mL bid\n\n4-8kg : 2.5mL bid",
  "코니톱시럽(tid)(=암브로콜 록솔씨)": "22-35kg : 10.0mL tid\n\n16-22kg : 6.7mL tid\n\n12-16kg : 5mL tid\n\n8-12kg : 3.4mL tid\n\n4-8kg : 1.7mL tid",
  "코미시럽 (=콜민에이)": "12Y- : 10ml q4. ~60ml/d\n\n6-12Y : 5ml q4. ~30ml/d\n\n2-6Y : 의사지시",
  "크린세프건조시럽": "(0.26-0.53)ml/kg tid",
  "클래리건조시럽": "(0.3- 0.6)ml/kg bid",
  "두드리진시럽(=이치리진)": "불안, 소양\n6세 이상: 25-50ml/d\n6세 미만: 25ml/d\n\n진정보조\n0.3ml/kg",
  "타미플루캡슐": "40kg- : 75mg bid\n\n23-40kg : 60mg bid\n\n15-23kg : 45mg bid\n\n-15kg : 30mg bid",
  "포리부틴드라이": "5Y- : 10ml tid\n\n1-5Y : 5ml tid\n\n0.5-1Y : 5ml bid\n\n-0.5Y : 2.5ml bid-tid",
  "포타겔현탁액": "19세 미만 소아: 복용 금지\n\n19세 이상(성인): 20ml tid",
  "프리비투스 현탁액": "15Y↑ : 5ml tid\n7-15Y : 5ml bid\n4-7Y : 3ml bid\n2-4Y : 2ml bid",
  "푸마티펜정": "3Y- : 1정 bid\n\n0.5-3Y : (초기)하루 0.05정/kg ~5일, (유지)하루 0.1정/kg",
  "프리마란정5": "40kg↑: 10mg/d\n\n40kg↓: 0.25mg/kg/d",
  "한미플루현탁용분말": "40kg-  : 12.5ml bid\n\n23-40kg : 10ml bid\n\n15-23kg : 7.5ml bid\n\n-15kg : 5ml bid",
  "대웅아지트로마이신건조시럽": "0.25 ml/kg qd 3d\n\n(0.125-0.25)ml/kg qd 5d (평균 0.15)\n\n0.75ml/kg qd 1d[급성 중이염]",
  "루키오 / 싱귤레어": "15Y- : 10 mg 정제 qd\n\n6-14Y : 5 mg 츄정 qd\n\n2-5Y : 4 mg 츄정 qd\n\n0.5-5Y : 4 mg 세립제 qd",
  "움카민시럽": "12Y↑: 9mL tid\n\n6~12Y : 6mL tid\n\n1~6Y : 3mL tid",
  "노테몬패취": "9Y- : 2mg \n\n3-9Y : 1mg \n\n0.5-3Y : 0.5mg",
  "툴로부테롤패치": "9Y- : 2mg\n3-9Y : 1mg\n0.5-3Y : 0.5mg",
  "듀락칸이지시럽": "7-14Y : 15ml/d 2-3일간 →그 후 10ml/d \n\n1-6Y : 5-10ml/d \n\n-1Y : 5ml/d",
  "리나치올시럽": "6-12Y : 250mg(12.5mL) tid\n\n2-5Y : 1일 250-500mg(12.5-25mL) 4회분할\n\n24개월 미만 금기",
  "리나치올시럽5%": "13-18Y : 250-500mg(5-10mL) tid-qid\n\n6-12Y : 250mg(5mL) tid\n\n2-5Y : 1일 250-500mg(5-10mL) 4회분할",
  "헤브론시럽": "15Y↑ : 100mg(5mL) tid\n\n4-14Y : 100mg(5mL) bid\n\n2-3Y : 50mg(2.5mL) tid",
  "엘도스시럽": "30kg↑ : 10mL bid\n\n20-30kg : 5mL tid\n\n15-19kg : 5mL bid",
  "보령메이액트세립": "(0.03-0.06)g/kg tid, 최대 2g tid(최대 6g/d)",
  "셉트린정": "체중기준(1일량): TMP 6mg/kg + SMX 30mg/kg → 1일 2회 분할 (0.0375정/kg/dose)\n\n6-11Y : 1정 bid\n\n3-5Y : 1/2정 bid\n\n2개월 미만 금기",
  "후로스판액": "소아 : 10mL bid (연령·증상에 따라 증감)"
};

const MODE2_HEALTH_KR_URLS = {
  "뮤테란과립200": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A1530A0107",
  "대웅아지트로마이신건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AKP08C0117",
  "액티피드시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2019101700024",
  "옴니세프세립": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11ABBBBB1453",
  "두드리진시럽(=이치리진)": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017010400043",
  "움카민시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2018020100039",
  "듀락칸이지시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2013010200015",
  "이텐시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AMMMMM2439",
  "레보투스시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11ABBBBB2578",
  "코니톱시럽(bid)(=암브로콜 록솔씨)": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017120400015",
  "코니톱시럽(tid)(=암브로콜 록솔씨)": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017120400015",
  "아모크라듀오시럽(bid)": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AGGGGA0133",
  "아모크라듀오시럽(tid)": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AGGGGA0133",
  "맥시부펜시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11APPPPP0411",
  "코미시럽 (=콜민에이)": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017120400018",
  "바난건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A0101A0356",
  "크린세프건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A0030A0436",
  "삼아아토크건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2019101700031",
  "클래리건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AKKKKK0492",
  "세토펜현탁액": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A0610B0025",
  "세토펜정325": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11ABBBBB0331",
  "타미플루캡슐": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AGGGGA5141",
  "소아용프리마란시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A1310A0163",
  "씨잘액": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11APPPPP0967",
  "포리부틴드라이": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A0500A0120",
  "씨투스건조시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2010080200004",
  "포타겔현탁액": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2019102400021",
  "아디팜정": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AFFFFF0070",
  "페니라민정": "https://www.health.kr/searchDrug/search.asp?keyword=%ED%8E%98%EB%8B%88%EB%9D%BC%EB%AF%BC%EC%A0%95",
  "푸마티펜정": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A1110B0213",
  "프리마란정5": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11ABBBBB0909",
  "프리비투스현탁액": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2019102400019",
  "프리비투스 현탁액": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2019102400019",
  "어린이부루펜시럽": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A0500A0154",
  "한미플루현탁용분말": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2018092000014",
  "루키오 / 싱귤레어": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2016053100032",
  "노테몬패취": "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2010050400011",
  "리나치올시럽": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11A3060A0162",
  "리나치올시럽5%": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11A3060A0211",
  "헤브론시럽": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11AOOOOO0915",
  "엘도스시럽": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11ABBBBB2036",
  "보령메이액트세립": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11ABBBBB1234",
  "셉트린정": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11A0500A0065",
  "후로스판액": "https://health.kr/searchDrug/result_drug.asp?drug_cd=A11AJJJJJ0115"
};

const MODE1_TO_MODE2_TOOLTIP_NAME = {
  "아지트로": "대웅아지트로마이신건조시럽",
  "크린세프 건조시럽": "크린세프건조시럽",
  "아모크라듀오(bid)": "아모크라듀오시럽(bid)",
  "아모크라듀오(tid)": "아모크라듀오시럽(tid)",
  "타미플루캡슐용량": "타미플루캡슐",
  "한미플루현탁액": "한미플루현탁용분말",
  "씨투스 건조시럽(bid)": "씨투스건조시럽",
  "씨투스 건조시럽(qd)": "씨투스건조시럽"
};

const MODE1_TOOLTIP_OVERRIDES = {
  "씨투스 건조시럽(qd)": "0.07g/kg qd"
};

const state = {
  activeMode: "mode1",
  selected: {
    mode1: new Set(),
    mode2: new Set(),
    mode3: new Set()
  },
  mode1Dose: {},
  mode1Period: {},
  mode2Weight: "",
  mode2BirthYymmdd: "",
  mode2AgeDirect: "",
  mode3Dose: {},
  mode3Freq: {},
  mode3Weight: "",
  mode3BirthYymmdd: "",
  mode3AgeDirect: ""
};

init();

function init() {
  bindTopControls();
  bindTabs();
  renderAllModeTables();
  renderMode();
}

function bindTopControls() {
  document.getElementById("btn-reset-checks").addEventListener("click", () => {
    state.selected.mode1.clear();
    state.selected.mode2.clear();
    renderAllModeTables();
    renderMode();
  });

  document.getElementById("btn-reset-inputs").addEventListener("click", () => {
    clearModeInputs(state.activeMode);
    renderAllModeTables();
    renderMode();
  });

  document.getElementById("btn-reset-mode").addEventListener("click", () => {
    clearModeInputs(state.activeMode);
    state.selected[state.activeMode].clear();
    renderAllModeTables();
    renderMode();
  });
}

function bindTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      state.activeMode = tab.dataset.mode;
      renderMode();
    });
  });
}

function clearModeInputs(mode) {
  if (mode === "mode1") {
    state.mode1Dose = {};
    state.mode1Period = {};
  }
  if (mode === "mode2") {
    state.mode2Weight = "";
    state.mode2BirthYymmdd = "";
    state.mode2AgeDirect = "";
  }
  if (mode === "mode3") {
    state.mode3Dose = {};
    state.mode3Freq = {};
    state.mode3Weight = "";
    state.mode3BirthYymmdd = "";
    state.mode3AgeDirect = "";
  }
}

function renderMode() {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.mode === state.activeMode));
  document.querySelectorAll(".mode").forEach(sec => sec.classList.toggle("active", sec.id === state.activeMode));

  const help = {
    mode1: "선택 약품별 추정 범위 계산후, 최종 몸무게 범위를 표시합니다.",
    mode2: "몸무게 기준 약품과 나이 기준 약품을 한 화면에서 함께 계산합니다.",
    mode3: "입력된 처방 용량과 횟수를 몸무게/나이 기준으로 감사합니다."
  };
  document.getElementById("modeHelp").textContent = help[state.activeMode];

  const mode2Weight = document.getElementById("mode2Weight");
  if (mode2Weight) mode2Weight.value = state.mode2Weight;
  const b1 = document.getElementById("mode2BirthYymmdd");
  const b3 = document.getElementById("mode2AgeDirect");
  if (b1) b1.value = state.mode2BirthYymmdd;
  if (b3) b3.value = state.mode2AgeDirect;

  const mode3Weight = document.getElementById("mode3Weight");
  if (mode3Weight) mode3Weight.value = state.mode3Weight;
  const b31 = document.getElementById("mode3BirthYymmdd");
  const b33 = document.getElementById("mode3AgeDirect");
  if (b31) b31.value = state.mode3BirthYymmdd;
  if (b33) b33.value = state.mode3AgeDirect;

  renderMode1Results();
  renderMode2Results();
  renderMode3Results();
}

function renderAllModeTables() {
  renderMode1Table();
  renderMode2Table();
  renderMode3Table();
  bindModeInputs();
}

function renderMode1Table() {
  const tbody = document.querySelector("#mode1Table tbody");
  tbody.innerHTML = MODE1_RULES.map(m => {
    const checked = state.selected.mode1.has(m.name) ? "checked" : "";
    const doseVal = state.mode1Dose[m.name] ?? "";
    const periodVal = state.mode1Period[m.name] ?? "3d";
    const mode2Name = MODE1_TO_MODE2_TOOLTIP_NAME[m.name] || m.name;
    const link = MODE2_HEALTH_KR_URLS[mode2Name] || "";
    const comp = getCompositionHint(m.name);
    const cellTitleAttr = comp ? ` title="${escapeAttr(comp)}"` : "";
    const nameHtml = link
      ? `<a class="med-link" href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(m.name)}</a>`
      : `<span class="med-name-text">${escapeHtml(m.name)}</span>`;
    const freqCell = m.name === "대웅아지트로마이신건조시럽"
      ? `qd <select class="m1-period" data-med="${escapeAttr(m.name)}">
          <option value="3d" ${periodVal === "3d" ? "selected" : ""}>3d</option>
          <option value="5d" ${periodVal === "5d" ? "selected" : ""}>5d</option>
          <option value="1d" ${periodVal === "1d" ? "selected" : ""}>1d</option>
        </select>`
      : (m.name === "클래리건조시럽" ? "bid 5d" : escapeHtml(m.freq || "-"));
    return `
      <tr data-med="${escapeAttr(m.name)}">
        <td><input type="checkbox" class="m1-check" data-med="${escapeAttr(m.name)}" ${checked}></td>
        <td${cellTitleAttr}>${nameHtml}</td>
        <td><input type="number" min="0" step="0.1" class="m1-dose" data-med="${escapeAttr(m.name)}" value="${escapeAttr(doseVal)}" placeholder="용량"></td>
        <td>${escapeHtml(m.unit || "-")}</td>
        <td>${freqCell}</td>
        <td class="row-result muted" id="m1-res-${idSafe(m.name)}">-</td>
      </tr>
    `;
  }).join("");
}

function renderMode2Table() {
  const tbody = document.querySelector("#mode2Table tbody");
  const tableEl = document.getElementById("mode2Table");
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width:760px)").matches;
  if (tableEl) tableEl.classList.toggle("mobile-single", !!isMobile);

  if (isMobile) {
    const renderSide = (m) => {
      const checked = state.selected.mode2.has(m.key) ? "checked" : "";
      const basisClass = m.type === "dual" ? "both" : (m.basis === "weight" ? "weight" : "age");
      const hint = getCompositionHint(m.name);
      const cellTitleAttr = hint ? ` title="${escapeAttr(hint)}"` : "";
      const nameHtml = getMode2NameCellHtml(m.name);
      return `
        <td><input type="checkbox" class="m2-check" data-key="${escapeAttr(m.key)}" ${checked}></td>
        <td class="med-name ${basisClass}"${cellTitleAttr}>${nameHtml}</td>
        <td id="m2-res-${idSafe(m.key)}" class="row-result muted m2-res-cell" data-med="${escapeAttr(m.name)}">-</td>
      `;
    };

    tbody.innerHTML = MERGED_MODE2_RULES.map(m => `<tr class="m2-single-row">${renderSide(m)}</tr>`).join("");
    return;
  }

  const third = Math.ceil(MERGED_MODE2_RULES.length / 3);
  const col1 = MERGED_MODE2_RULES.slice(0, third);
  const col2 = MERGED_MODE2_RULES.slice(third, third * 2);
  const col3 = MERGED_MODE2_RULES.slice(third * 2);
  const rowCount = Math.max(col1.length, col2.length, col3.length);

  const renderSide = (m) => {
    if (!m) return `<td></td><td></td><td></td>`;
    const checked = state.selected.mode2.has(m.key) ? "checked" : "";
    const basisClass = m.type === "dual" ? "both" : (m.basis === "weight" ? "weight" : "age");
    const hint = getCompositionHint(m.name);
    const cellTitleAttr = hint ? ` title="${escapeAttr(hint)}"` : "";
    const nameHtml = getMode2NameCellHtml(m.name);
    return `
      <td><input type="checkbox" class="m2-check" data-key="${escapeAttr(m.key)}" ${checked}></td>
      <td class="med-name ${basisClass}"${cellTitleAttr}>${nameHtml}</td>
      <td id="m2-res-${idSafe(m.key)}" class="row-result muted m2-res-cell" data-med="${escapeAttr(m.name)}">-</td>
    `;
  };

  let html = "";
  for (let i = 0; i < rowCount; i += 1) {
    html += `<tr>${renderSide(col1[i])}${renderSide(col2[i])}${renderSide(col3[i])}</tr>`;
  }
  tbody.innerHTML = html;
}

function renderMode3Table() {
  const tbody = document.querySelector("#mode3Table tbody");
  const tableEl = document.getElementById("mode3Table");
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width:760px)").matches;
  if (tableEl) tableEl.classList.toggle("mobile-single", !!isMobile);

  const renderSide = (m) => {
    if (!m) return `<td></td><td></td><td></td><td></td><td></td>`;
    const checked = state.selected.mode3.has(m.key) ? "checked" : "";
    const basisClass = m.type === "dual" ? "basis-dual" : m.basis === "weight" ? "basis-weight" : "basis-age";
    const hint = getCompositionHint(m.name);
    const cellTitleAttr = hint ? ` title="${escapeAttr(hint)}"` : "";
    const unit = getMode3Unit(m);
    const doseVal = state.mode3Dose[m.key] ?? "";
    const freqVal = state.mode3Freq[m.key] ?? "";
    return `
      <td><input type="checkbox" class="m3-check" data-key="${escapeAttr(m.key)}" ${checked}></td>
      <td class="med-name ${basisClass}"${cellTitleAttr}>${getMode2NameCellHtml(m.name)}</td>
      <td>
        <div class="audit-dose-wrap">
          <input type="number" class="m3-dose audit-dose-input" data-key="${escapeAttr(m.key)}" min="0" step="0.1" value="${escapeAttr(doseVal)}" placeholder="용량" />
          <span class="audit-unit-text">${escapeHtml(unit)}</span>
        </div>
      </td>
      <td><input type="number" class="m3-freq audit-freq-input" data-key="${escapeAttr(m.key)}" min="1" step="1" value="${escapeAttr(freqVal)}" placeholder="예: 2" /></td>
      <td id="m3-res-${idSafe(m.key)}" class="row-result muted m3-res-cell" data-med="${escapeAttr(m.name)}">-</td>
    `;
  };

  if (isMobile) {
    tbody.innerHTML = MERGED_MODE2_RULES.map(m => `<tr class="m3-single-row">${renderSide(m)}</tr>`).join("");
    return;
  }

  const third = Math.ceil(MERGED_MODE2_RULES.length / 3);
  const col1 = MERGED_MODE2_RULES.slice(0, third);
  const col2 = MERGED_MODE2_RULES.slice(third, third * 2);
  const col3 = MERGED_MODE2_RULES.slice(third * 2);
  const rowCount = Math.max(col1.length, col2.length, col3.length);

  let html = "";
  for (let i = 0; i < rowCount; i += 1) {
    html += `<tr>${renderSide(col1[i])}${renderSide(col2[i])}${renderSide(col3[i])}</tr>`;
  }
  tbody.innerHTML = html;
}

function bindModeInputs() {
  document.querySelectorAll(".m1-check").forEach(chk => {
    chk.onchange = () => {
      const med = chk.dataset.med;
      if (chk.checked) state.selected.mode1.add(med);
      else state.selected.mode1.delete(med);
      renderMode1Results();
    };
  });

  document.querySelectorAll(".m1-dose").forEach(inp => {
    inp.oninput = () => {
      state.mode1Dose[inp.dataset.med] = inp.value;
      renderMode1Results();
    };
  });

  document.querySelectorAll(".m1-period").forEach(sel => {
    sel.onchange = () => {
      state.mode1Period[sel.dataset.med] = sel.value;
      renderMode1Results();
    };
  });

  document.querySelectorAll(".m2-check").forEach(chk => {
    chk.onchange = () => {
      const key = chk.dataset.key;
      if (chk.checked) state.selected.mode2.add(key);
      else state.selected.mode2.delete(key);
      renderMode2Results();
    };
  });

  const mode2Weight = document.getElementById("mode2Weight");
  mode2Weight.oninput = () => {
    state.mode2Weight = mode2Weight.value;
    renderMode2Results();
  };

  const b1 = document.getElementById("mode2BirthYymmdd");
  const b3 = document.getElementById("mode2AgeDirect");
  if (b1) b1.oninput = () => { state.mode2BirthYymmdd = b1.value.trim(); renderMode2Results(); };
  if (b3) b3.oninput = () => { state.mode2AgeDirect = b3.value; renderMode2Results(); };

  document.querySelectorAll(".m3-check").forEach(chk => {
    chk.onchange = () => {
      const key = chk.dataset.key;
      if (chk.checked) state.selected.mode3.add(key);
      else state.selected.mode3.delete(key);
      renderMode3Results();
    };
  });

  document.querySelectorAll(".m3-dose").forEach(inp => {
    inp.oninput = () => {
      state.mode3Dose[inp.dataset.key] = inp.value;
      renderMode3Results();
    };
  });

  document.querySelectorAll(".m3-freq").forEach(inp => {
    inp.oninput = () => {
      state.mode3Freq[inp.dataset.key] = inp.value;
      renderMode3Results();
    };
  });

  const mode3Weight = document.getElementById("mode3Weight");
  if (mode3Weight) mode3Weight.oninput = () => {
    state.mode3Weight = mode3Weight.value;
    renderMode3Results();
  };

  const mode3Birth = document.getElementById("mode3BirthYymmdd");
  const mode3Age = document.getElementById("mode3AgeDirect");
  if (mode3Birth) mode3Birth.oninput = () => {
    state.mode3BirthYymmdd = mode3Birth.value.trim();
    renderMode3Results();
  };
  if (mode3Age) mode3Age.oninput = () => {
    state.mode3AgeDirect = mode3Age.value;
    renderMode3Results();
  };
}

function renderMode1Results() {
  const warnBox = document.getElementById("mode1Warnings");
  warnBox.innerHTML = "";

  const selected = MODE1_RULES.filter(m => state.selected.mode1.has(m.name));
  const allRanges = [];

  MODE1_RULES.forEach(m => {
    const cell = document.getElementById(`m1-res-${idSafe(m.name)}`);
    const mode2HintKey = MODE1_TO_MODE2_TOOLTIP_NAME[m.name] || m.name;
    cell.title = MODE1_TOOLTIP_OVERRIDES[m.name] || MODE2_RESULT_HINTS[mode2HintKey] || "";
    cell.className = "row-result muted";
    cell.textContent = "-";

    if (!state.selected.mode1.has(m.name)) return;

    const dose = toNum(state.mode1Dose[m.name]);
    const period = state.mode1Period[m.name] || "3d";
    const res = calcMode1(m, dose, period);

    if (res.status === "ok") {
      cell.className = "row-result ok";
      cell.textContent = res.text;
      allRanges.push(res.range);
    } else if (res.status === "warn") {
      cell.className = "row-result warn";
      cell.textContent = res.text;
      warnBox.innerHTML += `<div class="warn-item">${escapeHtml(m.name)}: ${escapeHtml(res.text)}</div>`;
    } else {
      cell.className = "row-result ex";
      cell.textContent = res.text;
      warnBox.innerHTML += `<div class="warn-item ex-item">${escapeHtml(m.name)}: ${escapeHtml(res.text)}</div>`;
    }
  });

  const finalEl = document.getElementById("mode1Final");
  if (!selected.length) {
    finalEl.className = "final-value state-warn";
    finalEl.textContent = "약품선택후 용량입력";
    return;
  }
  if (!allRanges.length) {
    finalEl.className = "final-value state-ex";
    finalEl.textContent = "계산 가능한 약품 범위가 없습니다.";
    return;
  }

  const low = Math.max(...allRanges.map(r => r[0]));
  const high = Math.min(...allRanges.map(r => r[1]));
  if (low <= high) {
    finalEl.className = "final-value state-ok";
    const hiTxt = Number.isFinite(high) ? `${round1(high)} kg` : "제한없음";
    finalEl.textContent = `${round1(low)} kg ~ ${hiTxt}`;
  } else {
    finalEl.className = "final-value state-warn";
    finalEl.textContent = "겹치는 몸무게 범위 없음";
  }
}

function calcMode1(rule, dose, period = "") {
  if (rule.type === "exception") {
    return { status: "ex", text: rule.message || "용량 확인 필요" };
  }

  if (dose === null || dose <= 0) {
    return { status: "warn", text: "입력값 확인 필요" };
  }

  if (rule.name === "대웅아지트로마이신건조시럽") {
    if (period === "5d") {
      const min = dose / 0.25;
      const max = dose / 0.125;
      return { status:"ok", text:`${round1(min)} ~ ${round1(max)} kg`, range:[min,max] };
    }
    if (period === "1d") {
      const min = dose / 0.75;
      return { status:"ok", text:`${round1(min)} kg 이상`, range:[min,Infinity] };
    }
    const min = dose / 0.25;
    return { status:"ok", text:`${round1(min)} kg 이상`, range:[min,Infinity] };
  }

  if (rule.type === "range") {
    const min = rule.min(dose);
    const max = rule.max(dose);
    if (!isFinite(min) || !isFinite(max) || min <= 0 || max <= 0) {
      return { status: "warn", text: "계산 불가" };
    }
    return { status: "ok", text: `${round1(min)} ~ ${round1(max)} kg`, range:[min,max] };
  }

  if (rule.type === "lowerOnly") {
    const min = rule.min(dose);
    if (!isFinite(min) || min <= 0) return { status:"warn", text:"계산 불가" };
    return { status: "ok", text: `${round1(min)} kg 이상`, range:[min,Infinity] };
  }

  if (rule.type === "lookup") {
    const key = Number(dose);
    const hit = rule.table[key];
    if (!hit) return { status:"ex", text: rule.missing || "용량 확인 필요" };
    const [min,max] = hit;
    const maxTxt = Number.isFinite(max) ? `${round1(max)} kg` : "제한없음";
    return { status:"ok", text:`${round1(min)} kg ~ ${maxTxt}`, range:[min,max] };
  }

  return { status:"ex", text:"용량 확인 필요" };
}

function renderMode2Results() {
  const warnBox = document.getElementById("mode2Warnings");
  warnBox.innerHTML = "";
  const weight = toNum(state.mode2Weight);
  const age = resolveAge();
  const agePrecise = resolveAgePrecise();
  const ageValueEl = document.getElementById("mode2AgeValue");
  if (ageValueEl) ageValueEl.textContent = age === null ? "-" : `${round1(age)}세`;

  let hasWeightSelected = false;
  let hasAgeSelected = false;

  MERGED_MODE2_RULES.forEach(m => {
    const cell = document.getElementById(`m2-res-${idSafe(m.key)}`);
    if (!cell) return;
    cell.title = MODE2_RESULT_HINTS[m.name] || "";
    cell.className = "row-result muted";
    cell.textContent = "-";

    if (!state.selected.mode2.has(m.key)) return;

    if (m.type === "dual") {
      hasWeightSelected = true;
      hasAgeSelected = true;

      const isAnxietyPair = (m.name === "두드리진시럽(=이치리진)" || m.name === "아디팜정");
      const ageLabel = isAnxietyPair ? "불안, 소양" : "나이기준";
      const weightLabel = isAnxietyPair ? "진정보조" : "체중기준";

      const ageLine = (age === null || age < 0)
        ? `${ageLabel}: 나이 입력 필요`
        : `${ageLabel}: ${m.ageText(age)}`;
      const weightLine = (weight === null || weight <= 0)
        ? `${weightLabel}: 몸무게 입력 필요`
        : `${weightLabel}: ${m.weightText(weight)}`;
      const separator = isAnxietyPair ? "\n" : "\n\n";
      const dualText = formatMode2TextForViewport(m.name, `${ageLine}${separator}${weightLine}`);

      const hasMissing = (age === null || age < 0 || weight === null || weight <= 0);
      cell.className = hasMissing ? "row-result warn" : "row-result ok";
      if (dualText.includes("\n")) {
        cell.innerHTML = escapeHtml(dualText).replace(/\n/g, "<br>");
      } else {
        cell.textContent = dualText;
      }
      return;
    }

    if (m.basis === "weight") {
      hasWeightSelected = true;
      if (weight === null || weight <= 0) {
        cell.className = "row-result warn";
        cell.textContent = "몸무게 입력 필요";
        return;
      }
      const res = calcMode2(m, weight);
      const out = formatMode2TextForViewport(m.name, res.text);
      cell.className = res.status === "ex" ? "row-result ex" : "row-result ok";
      if (out.includes("\n")) {
        cell.innerHTML = escapeHtml(out).replace(/\n/g, "<br>");
      } else {
        cell.textContent = out;
      }
      return;
    }

    hasAgeSelected = true;
    const ageForRule = (m.name === "액티피드시럽" || m.name === "뮤테란과립200" || m.name === "페니라민정" || m.name === "리나치올시럽") ? agePrecise : age;
    if (ageForRule === null || ageForRule < 0) {
      cell.className = "row-result warn";
      cell.textContent = "나이 입력 필요";
      return;
    }
    const main = m.calc(ageForRule);
    const sub = m.extra ? ` (${m.extra(ageForRule)})` : "";
    const out = formatMode2TextForViewport(m.name, `${main}${sub}`);
    cell.className = "row-result ok";
    if (out.includes("\n")) {
      cell.innerHTML = escapeHtml(out).replace(/\n/g, "<br>");
    } else {
      cell.textContent = out;
    }
  });

  if (hasWeightSelected && (weight === null || weight <= 0)) {
    warnBox.innerHTML += `<div class="warn-item">몸무게 기준 약품 계산을 위해 몸무게(kg)를 입력하세요.</div>`;
  }
  if (hasAgeSelected && (age === null || age < 0)) {
    warnBox.innerHTML += `<div class="warn-item">나이 기준 약품 계산을 위해 생년월일(YYMMDD) 또는 나이를 입력하세요.</div>`;
  }

  const chlorSummary = getChlorpheniramineSummary(agePrecise);
  if (chlorSummary) {
    warnBox.innerHTML += `<div class="warn-item summary-item ${chlorSummary.level}">${escapeHtml(chlorSummary.text)}</div>`;
  }
}

function calcMode2(rule, weight) {
  if (rule.type === "text") {
    return { status:"ok", text: rule.calc(weight) };
  }
  if (rule.type === "single") {
    const v = rule.val(weight);
    return { status:"ok", text:`${round2(v)} ${rule.unit} ${rule.freq}${rule.dur?` / ${rule.dur}`:""}` };
  }
  if (rule.type === "range") {
    const a = rule.min(weight), b = rule.max(weight);
    return { status:"ok", text:`${round2(a)} ~ ${round2(b)} ${rule.unit} ${rule.freq}${rule.dur?` / ${rule.dur}`:""}` };
  }
  return { status:"ex", text:"용량 확인 필요" };
}

function renderMode3Results() {
  const warnBox = document.getElementById("mode3Warnings");
  warnBox.innerHTML = "";

  const weight = toNum(state.mode3Weight);
  const age = resolveMode3Age();
  const agePrecise = resolveMode3AgePrecise();
  const ageValueEl = document.getElementById("mode3AgeValue");
  if (ageValueEl) ageValueEl.textContent = age === null ? "-" : `${round1(age)}세`;

  let hasWeightSelected = false;
  let hasAgeSelected = false;

  MERGED_MODE2_RULES.forEach(m => {
    const cell = document.getElementById(`m3-res-${idSafe(m.key)}`);
    if (!cell) return;
    cell.title = MODE2_RESULT_HINTS[m.name] || "";
    cell.className = "row-result muted";
    cell.textContent = "-";

    if (!state.selected.mode3.has(m.key)) return;

    if (m.basis === "weight" || m.type === "dual") hasWeightSelected = true;
    if (m.basis === "age" || m.type === "dual") hasAgeSelected = true;

    const dose = toNum(state.mode3Dose[m.key]);
    const freq = (state.mode3Freq[m.key] || "").trim();
    const audit = auditMode3Medication(m, {
      weight,
      age,
      agePrecise,
      dose,
      freq
    });

    if (audit.status === "empty") {
      cell.className = "row-result warn";
      cell.textContent = audit.text;
      return;
    }

    if (audit.status === "warn") {
      cell.className = "row-result warn";
    } else if (audit.status === "ex") {
      cell.className = "row-result ex";
    } else {
      cell.className = "row-result ok";
    }

    if (audit.text.includes("\n")) {
      cell.innerHTML = escapeHtml(audit.text).replace(/\n/g, "<br>");
      return;
    }
    cell.textContent = audit.text;
  });

  if (hasWeightSelected && (weight === null || weight <= 0)) {
    warnBox.innerHTML += `<div class="warn-item">체중 기준 감사가 필요한 약품이 있어 몸무게(kg)를 입력하세요.</div>`;
  }
  if (hasAgeSelected && (age === null || age < 0)) {
    warnBox.innerHTML += `<div class="warn-item">나이 기준 감사가 필요한 약품이 있어 생년월일 또는 나이를 입력하세요.</div>`;
  }
}

function auditMode3Medication(rule, ctx) {
  if (ctx.dose === null || ctx.dose <= 0 || !ctx.freq) {
    return { status: "empty", text: "입력값 확인" };
  }

  const normalizedCtx = {
    ...ctx,
    dose: normalizeMode3Dose(rule, ctx.dose)
  };

  if (rule.type === "dual") {
    return auditMode3Dual(rule, normalizedCtx);
  }

  if (rule.basis === "weight") {
    if (normalizedCtx.weight === null || normalizedCtx.weight <= 0) return { status: "warn", text: "체중 기준 확인" };
    return auditMode3Weight(rule, normalizedCtx);
  }

  if (normalizedCtx.age === null || normalizedCtx.age < 0) return { status: "warn", text: "나이 기준 확인" };
  return auditMode3Age(rule, normalizedCtx);
}

function auditMode3Dual(rule, ctx) {
  const parts = [];
  const ageAudit = (ctx.age === null || ctx.age < 0)
    ? { status: "warn", text: "나이 기준 확인" }
    : auditTextExpectation(rule.ageText(ctx.age), ctx.dose, ctx.freq, getMode3Unit(rule), rule.name);
  const weightAudit = (ctx.weight === null || ctx.weight <= 0)
    ? { status: "warn", text: "체중 기준 확인" }
    : auditTextExpectation(rule.weightText(ctx.weight), ctx.dose, ctx.freq, getMode3Unit(rule), rule.name);

  if (ageAudit.status === "ok") return { status: "ok", text: `적정 (나이기준)` };
  if (weightAudit.status === "ok") return { status: "ok", text: `적정 (체중기준)` };

  parts.push(`나이기준: ${ageAudit.text}`);
  parts.push(`체중기준: ${weightAudit.text}`);

  if (ageAudit.status === "ex" && weightAudit.status === "ex") {
    return { status: "ex", text: parts.join("\n") };
  }
  if (ageAudit.text === "과량 가능" && weightAudit.text === "과량 가능") {
    return { status: "ex", text: "과량 가능" };
  }
  if (ageAudit.text === "저용량 가능" && weightAudit.text === "저용량 가능") {
    return { status: "warn", text: "저용량 가능" };
  }
  return { status: "warn", text: parts.join("\n") };
}

function auditMode3Weight(rule, ctx) {
  if (rule.type === "range") {
    return compareDoseAndFreq(ctx.dose, ctx.freq, rule.min(ctx.weight), rule.max(ctx.weight), rule.freq);
  }
  if (rule.type === "single") {
    const expected = rule.val(ctx.weight);
    return compareDoseAndFreq(ctx.dose, ctx.freq, expected, expected, rule.freq);
  }
  if (rule.type === "text") {
    return auditTextWeightRule(rule, ctx);
  }
  return { status: "warn", text: "기준 없음 / 확인 필요" };
}

function auditMode3Age(rule, ctx) {
  const ruleAge = (rule.name === "액티피드시럽" || rule.name === "뮤테란과립200" || rule.name === "페니라민정" || rule.name === "리나치올시럽") ? ctx.agePrecise : ctx.age;
  const recommendation = rule.calc(ruleAge);
  return auditTextAgeRule(rule, recommendation, ctx);
}

function auditTextWeightRule(rule, ctx) {
  switch (rule.name) {
    case "레보투스시럽": {
      if (ctx.weight <= 10) return { status: "warn", text: "체중 범위 확인 필요 (10-20kg 3ml tid)" };
      if (ctx.weight > 30) return { status: "warn", text: "체중 범위 확인 필요 (20-30kg 5ml tid)" };
      const expectedDose = (ctx.weight > 10 && ctx.weight < 20) ? 3 : 5;
      return compareDoseAndFreq(ctx.dose, ctx.freq, expectedDose, expectedDose, "tid");
    }
    case "세토펜정325":
      return compareDoseAndFreq(ctx.dose, ctx.freq, ctx.weight * 0.031, ctx.weight * 0.046, "tid");
    case "삼아아토크건조시럽":
      return compareDailyDose(ctx.dose, ctx.freq, ctx.weight * 0.1, ["bid", "tid"]);
    case "씨투스건조시럽":
      return compareDoseAndFreq(ctx.dose, ctx.freq, ctx.weight * 0.035, ctx.weight * 0.035, "bid");
    case "코니톱시럽(bid)(=암브로콜 록솔씨)":
      return auditConitop(ctx, "bid");
    case "코니톱시럽(tid)(=암브로콜 록솔씨)":
      return auditConitop(ctx, "tid");
    case "타미플루캡슐": {
      const expected = ctx.weight > 40 ? 75 : ctx.weight > 23 ? 60 : ctx.weight > 15 ? 45 : ctx.weight >= 10 ? 30 : null;
      if (expected === null) return { status: "warn", text: "기준 없음 / 확인 필요" };
      return compareDoseAndFreq(ctx.dose, ctx.freq, expected, expected, "bid");
    }
    case "한미플루현탁용분말": {
      const expected = ctx.weight > 40 ? 12.5 : ctx.weight > 23 ? 10 : ctx.weight > 15 ? 7.5 : ctx.weight >= 10 ? 5 : ctx.weight >= 9 ? 4.5 : ctx.weight >= 8 ? 4 : ctx.weight >= 7 ? 3.5 : ctx.weight >= 6 ? 3 : ctx.weight >= 5 ? 2.5 : ctx.weight >= 4 ? 2 : ctx.weight >= 3 ? 1.5 : null;
      if (expected === null) return { status: "warn", text: "기준 없음 / 확인 필요" };
      return compareDoseAndFreq(ctx.dose, ctx.freq, expected, expected, "bid");
    }
    case "소아용프리마란시럽": {
      if (ctx.weight < 12.2) return { status: "ex", text: "금기" };
      const expected = ctx.weight >= 40 ? 10 : round2(ctx.weight * 0.25);
      return compareDoseAndFreq(ctx.dose, ctx.freq, expected, expected, "bid");
    }
    case "프리마란정5": {
      if (ctx.weight < 12.2) return { status: "ex", text: "금기" };
      const expected = ctx.weight >= 40 ? 1 : round2((ctx.weight * 0.25) / 10);
      return compareDoseAndFreq(ctx.dose, ctx.freq, expected, expected, "bid");
    }
    default:
      return auditTextExpectation(rule.calc(ctx.weight), ctx.dose, ctx.freq, getMode3Unit(rule), rule.name);
  }
}

function auditTextAgeRule(rule, recommendation, ctx) {
  if (/금기|복용하지 말것|사용되지 않아야/.test(recommendation)) {
    return { status: "ex", text: "금기" };
  }
  if (rule.name === "뮤테란과립200" || rule.name === "듀락칸이지시럽" || rule.name === "루키오 / 싱귤레어") {
    return { status: "warn", text: "기준 여러개 / 확인 필요" };
  }
  return auditTextExpectation(recommendation, ctx.dose, ctx.freq, getMode3Unit(rule), rule.name);
}

function auditConitop(ctx, freq) {
  let expected = null;
  if (ctx.weight >= 22) expected = freq === "bid" ? 15 : 10;
  else if (ctx.weight >= 16) expected = freq === "bid" ? 10 : 6.7;
  else if (ctx.weight >= 12) expected = freq === "bid" ? 7.5 : 5;
  else if (ctx.weight >= 8) expected = freq === "bid" ? 5 : 3.4;
  else if (ctx.weight >= 4) expected = freq === "bid" ? 2.5 : 1.7;
  if (expected === null) return { status: "warn", text: "기준 없음 / 확인 필요" };
  return compareDoseAndFreq(ctx.dose, ctx.freq, expected, expected, freq);
}

function auditTextExpectation(text, dose, freq, unit, name) {
  const upperText = String(text || "");

  if (/의사/.test(upperText)) return { status: "warn", text: "기준 없음 / 확인 필요" };
  if (/금기|복용하지 말것|사용되지 않아야/.test(upperText)) return { status: "ex", text: "금기" };
  if (upperText.includes("\n")) return { status: "warn", text: "기준 여러개 / 확인 필요" };

  const cleaned = upperText.replace(/\(.*?\)/g, "").trim();
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-~]\s*(\d+(?:\.\d+)?)\s*(ml|mg|정|g)/i);
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(ml|mg|정|g)/i);
  const expectedFreq = extractExpectedFreq(cleaned);

  if (rangeMatch) {
    return compareDoseAndFreq(dose, freq, Number(rangeMatch[1]), Number(rangeMatch[2]), expectedFreq || "", unit);
  }
  if (singleMatch) {
    return compareDoseAndFreq(dose, freq, Number(singleMatch[1]), Number(singleMatch[1]), expectedFreq || "", unit);
  }
  if (/q4-6/i.test(cleaned)) {
    return checkFreqOnly(freq, "q4-6h");
  }
  return { status: "warn", text: name === "페니라민정" ? "나이 기준 확인" : "기준 없음 / 확인 필요" };
}

function compareDailyDose(dose, freqInput, expectedDaily, allowedFreqs) {
  const perDay = getFrequencyCount(freqInput);
  const acceptedCounts = allowedFreqs.flatMap(getAcceptedFrequencyCounts);
  if (!perDay || (acceptedCounts.length && !acceptedCounts.includes(perDay))) return { status: "warn", text: "횟수 확인" };
  const enteredDaily = dose * perDay;
  return compareValue(enteredDaily, expectedDaily);
}

function compareDoseAndFreq(dose, freqInput, minDose, maxDose, expectedFreq) {
  const valueResult = compareRangeValue(dose, minDose, maxDose);
  if (valueResult.status === "ok") {
    return checkFreqOnly(freqInput, expectedFreq);
  }
  return valueResult;
}

function checkFreqOnly(freqInput, expectedFreq) {
  if (!expectedFreq) return { status: "ok", text: "적정" };
  const enteredCount = getFrequencyCount(freqInput);
  const acceptedCounts = getAcceptedFrequencyCounts(expectedFreq);
  if (!enteredCount || (acceptedCounts.length && !acceptedCounts.includes(enteredCount))) return { status: "warn", text: "횟수 확인" };
  return { status: "ok", text: "적정" };
}

function compareRangeValue(value, min, max) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const tol = Math.max(0.05, high * 0.05);
  if (value < low - tol) return { status: "warn", text: "저용량 가능" };
  if (value > high + tol) return { status: "ex", text: "과량 가능" };
  return { status: "ok", text: "적정" };
}

function compareValue(value, expected) {
  const tol = Math.max(0.05, expected * 0.05);
  if (value < expected - tol) return { status: "warn", text: "저용량 가능" };
  if (value > expected + tol) return { status: "ex", text: "과량 가능" };
  return { status: "ok", text: "적정" };
}

function extractExpectedFreq(text) {
  const norm = normalizeFreq(text);
  return norm || "";
}

function normalizeFreq(text) {
  const s = String(text || "").toLowerCase().replace(/\s+/g, "");
  if (!s) return "";
  if (s.includes("bid-tid")) return "bid-tid";
  if (s.includes("q4-6")) return "q4-6h";
  if (s.includes("qid")) return "qid";
  if (s.includes("tid")) return "tid";
  if (s.includes("bid")) return "bid";
  if (s.includes("qd")) return "qd";
  if (s.includes("q4")) return "q4h";
  if (s.includes("q6")) return "q6h";
  return s;
}

function freqToTimesPerDay(freq) {
  if (freq === "qd") return 1;
  if (freq === "bid") return 2;
  if (freq === "tid") return 3;
  if (freq === "qid") return 4;
  return null;
}

function getFrequencyCount(freqInput) {
  const direct = toNum(freqInput);
  if (direct !== null && direct > 0) return direct;
  const freqNorm = normalizeFreq(freqInput);
  return freqToTimesPerDay(freqNorm);
}

function getAcceptedFrequencyCounts(expectedFreq) {
  const expectedNorm = normalizeFreq(expectedFreq);
  if (!expectedNorm) return [];
  if (expectedNorm === "bid-tid") return [2, 3];
  if (expectedNorm === "q4-6h") return [4, 5, 6];
  if (expectedNorm === "q4h") return [6];
  if (expectedNorm === "q6h") return [4];
  const perDay = freqToTimesPerDay(expectedNorm);
  return perDay ? [perDay] : [];
}

function getMode3Unit(rule) {
  if (rule.unit) return rule.unit;
  const unitMap = {
    "레보투스시럽": "ml",
    "세토펜정325": "정",
    "삼아아토크건조시럽": "g",
    "씨투스건조시럽": "g",
    "타미플루캡슐": "mg",
    "한미플루현탁용분말": "ml",
    "소아용프리마란시럽": "ml",
    "프리마란정5": "정",
    "액티피드시럽": "ml",
    "페니라민정": "정",
    "씨잘액": "ml",
    "코미시럽 (=콜민에이)": "ml",
    "움카민시럽": "ml",
    "이텐시럽": "ml",
    "푸마티펜정": "정",
    "듀락칸이지시럽": "ml",
    "포리부틴드라이": "ml",
    "포타겔현탁액": "ml",
    "프리비투스 현탁액": "ml",
    "노테몬패취": "mg",
    "루키오 / 싱귤레어": "mg",
    "뮤테란과립200": "포",
    "아디팜정": "정",
    "두드리진시럽(=이치리진)": "ml",
    "코니톱시럽(bid)(=암브로콜 록솔씨)": "ml",
    "코니톱시럽(tid)(=암브로콜 록솔씨)": "ml",
    "리나치올시럽": "ml",
    "리나치올시럽5%": "ml",
    "헤브론시럽": "ml",
    "엘도스시럽": "ml",
    "셉트린정": "정",
    "후로스판액": "ml"
  };
  return unitMap[rule.name] || "-";
}

function normalizeMode3Dose(rule, dose) {
  if (rule.name === "뮤테란과립200") return dose * 200;
  return dose;
}

function parseYymmddToDate(yymmdd) {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = Number(yymmdd.slice(0,2));
  const mm = Number(yymmdd.slice(2,4));
  const dd = Number(yymmdd.slice(4,6));
  const currentYY = new Date().getFullYear() % 100;
  const year = yy > currentYY ? 1900 + yy : 2000 + yy;
  const dt = new Date(year, mm-1, dd);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function resolveMode3Age() {
  const direct = toNum(state.mode3AgeDirect);
  if (direct !== null) return direct;
  const dt = parseYymmddToDate((state.mode3BirthYymmdd || "").trim());
  return dt ? calcAgeLikeSheet(dt) : null;
}

function resolveMode3AgePrecise() {
  const direct = toNum(state.mode3AgeDirect);
  if (direct !== null) return direct;
  const dt = parseYymmddToDate((state.mode3BirthYymmdd || "").trim());
  return dt ? calcAgePreciseYears(dt) : null;
}

function resolveAge() {
  const direct = toNum(state.mode2AgeDirect);
  if (direct !== null) return direct;
  const dt = parseYymmddToDate((state.mode2BirthYymmdd || "").trim());
  return dt ? calcAgeLikeSheet(dt) : null;
}

function resolveAgePrecise() {
  const direct = toNum(state.mode2AgeDirect);
  if (direct !== null) return direct;
  const dt = parseYymmddToDate((state.mode2BirthYymmdd || "").trim());
  return dt ? calcAgePreciseYears(dt) : null;
}

function calcAgePreciseYears(birth) {
  const now = new Date();
  const ms = now.getTime() - birth.getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return ms / (1000 * 60 * 60 * 24 * 365.2425);
}

function getChlorpheniramineSummary(age) {
  const pheniramineSelected = state.selected.mode2.has("A|페니라민정");
  const comiSelected = state.selected.mode2.has("A|코미시럽 (=콜민에이)");
  if (!pheniramineSelected && !comiSelected) return null;

  if (age === null || age < 0) {
    return {
      level: "summary-warn",
      text: "Chlorpheniramine 총량: 나이 입력 후 확인"
    };
  }

  if (age < 2) {
    return {
      level: "summary-warn",
      text: "Chlorpheniramine 총량: 2세 미만 기준 금기/투여정보 확인 필요"
    };
  }

  const refMax = age < 6 ? 6 : age < 12 ? 12 : 24;
  let total = 0;
  const notes = [];

  if (pheniramineSelected) {
    total += refMax;
    notes.push(`페니라민정 ${refMax}mg/d`);
  }

  if (comiSelected) {
    if (age < 6) {
      notes.push("코미시럽 의사지시량 확인 필요");
    } else {
      const comiMaxMl = age < 12 ? 30 : 60;
      const comiMg = round2(comiMaxMl * 0.4);
      total += comiMg;
      notes.push(`코미시럽 ${comiMg}mg/d`);
    }
  }

  if (comiSelected && age < 6) {
    const prefix = pheniramineSelected ? `Chlorpheniramine 총량: 페니라민정 ${refMax}mg/d + 코미시럽 의사지시량` : "Chlorpheniramine 총량: 코미시럽 의사지시량";
    return {
      level: "summary-warn",
      text: `${prefix} / 기준 최대 ${refMax}mg/d (확인 필요)`
    };
  }

  const status = total <= refMax ? "적정" : "초과";
  return {
    level: total <= refMax ? "summary-ok" : "summary-ex",
    text: `Chlorpheniramine 총량: ${round2(total)}mg/d / 최대 ${refMax}mg/d (${status})`
  };
}

function formatMode2TextForViewport(name, text) {
  const out = String(text ?? "");
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width:760px)").matches;
  if (!isMobile) return out;

  if (name === "뮤테란과립200") return out.replace(/\n+/g, " / ");
  if (name === "아디팜정") return out.replace(/\n{2,}/g, "\n");
  if (name === "액티피드시럽" || name === "프리마란정5" || name === "소아용프리마란시럽") {
    return out.replace(/\n+/g, " ");
  }
  return out;
}

function calcAgeLikeSheet(birth) {
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years -= 1;
  if (years >= 1) return years;

  let months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;
  return round1(months / 12);
}

function toNum(v){
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function round1(n){ return Math.round(n*10)/10; }
function round2(n){ return Math.round(n*100)/100; }
function idSafe(s){ return s.replace(/[^\w가-힣]/g,"_"); }
function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}
function escapeAttr(s){ return escapeHtml(s); }

function getHealthKrLink(name) {
  const direct = HEALTH_KR_DIRECT_URLS[name];
  if (direct) return direct;
  return `https://www.health.kr/searchDrug/search.asp?keyword=${encodeURIComponent(name)}`;
}

function getCompositionHint(name) {
  const mode2Name = MODE1_TO_MODE2_TOOLTIP_NAME[name] || name;
  return MODE_COMPOSITION_HINTS[mode2Name] || MODE_COMPOSITION_HINTS[name] || "성분/함량 정보: 내부 확인 필요";
}

function getMode2NameCellHtml(name) {
  if (name === "루키오 / 싱귤레어") {
    const urlLukio = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2016053100032";
    const urlSingulair = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AHHHHH0379";
    return `<a class="med-link" href="${escapeAttr(urlLukio)}" target="_blank" rel="noopener noreferrer">루키오</a> / <a class="med-link" href="${escapeAttr(urlSingulair)}" target="_blank" rel="noopener noreferrer">싱귤레어</a>`;
  }
  if (name === "코미시럽 (=콜민에이)") {
    const urlComi = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017120400018";
    const urlColmin = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11AOOOOO3890";
    return `<a class="med-link" href="${escapeAttr(urlComi)}" target="_blank" rel="noopener noreferrer">코미시럽</a> (=<a class="med-link" href="${escapeAttr(urlColmin)}" target="_blank" rel="noopener noreferrer">콜민에이</a>)`;
  }
  if (name === "코니톱시럽(bid)(=암브로콜 록솔씨)") {
    const urlConitop = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017120400015";
    const urlAmbrocol = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A2140A0165";
    const urlRoxol = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2018020100029";
    return `<a class="med-link" href="${escapeAttr(urlConitop)}" target="_blank" rel="noopener noreferrer">코니톱시럽(bid)</a>(=<a class="med-link" href="${escapeAttr(urlAmbrocol)}" target="_blank" rel="noopener noreferrer">암브로콜</a> <a class="med-link" href="${escapeAttr(urlRoxol)}" target="_blank" rel="noopener noreferrer">록솔씨</a>)`;
  }
  if (name === "코니톱시럽(tid)(=암브로콜 록솔씨)") {
    const urlConitop = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2017120400015";
    const urlAmbrocol = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=A11A2140A0165";
    const urlRoxol = "https://www.health.kr/searchDrug/result_drug.asp?drug_cd=2018020100029";
    return `<a class="med-link" href="${escapeAttr(urlConitop)}" target="_blank" rel="noopener noreferrer">코니톱시럽(tid)</a>(=<a class="med-link" href="${escapeAttr(urlAmbrocol)}" target="_blank" rel="noopener noreferrer">암브로콜</a> <a class="med-link" href="${escapeAttr(urlRoxol)}" target="_blank" rel="noopener noreferrer">록솔씨</a>)`;
  }
  const displayName = name === "뮤테란과립200" ? `${name}mg` : name;
  const link = MODE2_HEALTH_KR_URLS[name] || "";
  return link
    ? `<a class="med-link" href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayName)}</a>`
    : `<span class="med-name-text">${escapeHtml(displayName)}</span>`;
}


