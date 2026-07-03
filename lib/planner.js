export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSM7daC7q_w6V_GF5ufjbmwtCLhhxpitQgGyZpT9gIl4lVp9hrwqOByFYe54Ye85uiqsYCfAuJTl-H7/pub?output=csv'
export const MEAL_TOLERANCE = 30

export const FILLER_FOODS = new Set([
  'Whole Wheat Roti (Ready to eat)','Cooked White Rice','Cooked Oats','Plain Cooked Poha',
  'Whole Milk','Plain Curd (Dahi)','Raw Banana','Raw Apple','Raw Orange','Raw Guava',
])

export const DAL_POOL = [
  'Cooked Moong Dal','Cooked Toor Dal','Cooked Masoor Dal','Cooked Chana Dal',
  'Cooked Rajma (Kidney Beans)','Cooked Chole (Chickpeas)','Cooked Black Chana',
]

export const STATES = [
  'All India','Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Nagaland','Odisha','Punjab',
  'Rajasthan','Tamil Nadu','Uttar Pradesh','Uttarakhand','West Bengal',
]

const NON_VEG_POOL_ALL = [
  'Cooked Skinless Chicken Breast','Cooked Chicken Thigh','Cooked Fish',
  'Cooked Tuna','Cooked Mutton','Cooked Prawns',
]

const EXCLUDED = new Set(['Raw Peanuts','Raw Almonds','Raw Walnuts'])

const PROTEIN_QTY = {
  standard: {'1a':100,'1b':125,'2a':150,'2b':175,'3a':175,'3b':200,'3c':225,'3d':250},
  tofu:     {'1a':150,'1b':175,'2a':200,'2b':225,'3a':225,'3b':250,'3c':275,'3d':300},
  nonveg:   {'1a':75,'1b':100,'2a':125,'2b':150,'3a':175,'3b':175,'3c':200,'3d':225},
}
const SOY_CHUNKS_QTY    = {'1a':100,'1b':125,'2a':150,'2b':175,'3a':175,'3b':200,'3c':200,'3d':200}
const VEGEGG_SOY_QTY    = {'1a':125,'1b':150,'2a':200,'2b':225,'3a':250,'3b':275,'3c':300,'3d':325}
const VEGEGG_PANEER_QTY = {'1a':175,'1b':200,'2a':250,'2b':275,'3a':300,'3b':325,'3c':350,'3d':375}
const VEGEGG_EGG_QTY    = 100

const CATEGORIES = {
  vegetarian: {
    A: {breakfast:['Cooked Soy Chunks (TVP)','standard'], lunch:['Firm Tofu','tofu'],         dinner:['Low Fat Paneer','standard']},
    B: {breakfast:['Cooked Soy Chunks (TVP)','standard'], lunch:['Low Fat Paneer','standard'], dinner:['Firm Tofu','tofu']},
  },
  vegetarian_egg: {
    A: {breakfast:['Cooked Soy Chunks (TVP)','vegegg_soy'], lunch:['Whole Egg (Boiled)','vegegg_egg'], dinner:['Low Fat Paneer','vegegg_paneer']},
  },
  non_vegetarian: {
    A: {breakfast:['Cooked Soy Chunks (TVP)','standard'], lunch:['NON_VEG','nonveg'], dinner:['Low Fat Paneer','standard']},
    B: {breakfast:['Cooked Soy Chunks (TVP)','standard'], lunch:['NON_VEG','nonveg'], dinner:['Firm Tofu','tofu']},
  },
}

function r(n) { return Math.round(n * 10) / 10 }
function macrosPerG(food, grams) {
  const f = grams / 100
  return { calories:r(food.calories*f), protein:r(food.protein*f), carbs:r(food.carbs*f), fat:r(food.fat*f), fibre:r(food.fibre*f) }
}
function addMacros(a, b) { return { calories:r(a.calories+b.calories), protein:r(a.protein+b.protein), carbs:r(a.carbs+b.carbs), fat:r(a.fat+b.fat), fibre:r(a.fibre+b.fibre) } }
function zeroMacros() { return {calories:0,protein:0,carbs:0,fat:0,fibre:0} }
function macroPctRemaining(achieved, target) {
  const res = {}
  for (const k of ['carbs','fat','fibre']) res[k] = target[k]>0 ? Math.max(0,(target[k]-achieved[k])/target[k]*100) : 0
  return res
}
function shuffle(arr) {
  const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a
}
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)] }

function parseCSVLine(line) {
  const result=[]; let cur='',inQ=false
  for(const ch of line) {
    if(ch==='"') inQ=!inQ
    else if(ch===','&&!inQ) {result.push(cur);cur=''}
    else cur+=ch
  }
  result.push(cur); return result
}

export async function getFoodDatabase() {
  const res  = await fetch(CSV_URL)
  const text = await res.text()
  const lines = text.trim().split('\n')
  const headers = parseCSVLine(lines[0]).map(h=>h.trim().replace(/"/g,''))
  const foods = {}
  for (let i=1;i<lines.length;i++) {
    const row = parseCSVLine(lines[i])
    if (row.length < headers.length) continue
    const obj = {}; headers.forEach((h,idx)=>{ obj[h]=row[idx]?.trim().replace(/"/g,'')||'' })
    const name = obj['Food Name']?.trim(); if(!name) continue
    foods[name] = {
      category: obj['Category']?.trim()||'',
      state:    obj['State']?.trim()||'',
      calories: parseFloat(obj['Calories(kcal)'])||0,
      protein:  parseFloat(obj['Protein(g)'])||0,
      carbs:    parseFloat(obj['Carbs(g)'])||0,
      fat:      parseFloat(obj['Fat(g)'])||0,
      fibre:    parseFloat(obj['Fibre(g)'])||0,
      serving:  obj['Unit']?.trim()||'100g',
    }
  }
  return foods
}

export function computeTargets(weight) {
  const calories = weight*24, protein=weight*1.9, fat=weight*0.7
  const fibre=calories*14/1000, carbs=(calories-protein*4-fat*9)/4
  return {calories:r(calories),protein:r(protein),carbs:r(Math.max(carbs,0)),fat:r(fat),fibre:r(fibre)}
}

function getTierLabel(cal) {
  if(cal<1400)return'1a';if(cal<1600)return'1b';if(cal<1750)return'2a';if(cal<1900)return'2b'
  if(cal<2100)return'3a';if(cal<2200)return'3b';if(cal<2350)return'3c';return'3d'
}

function getProteinQty(tier, type) {
  if(type==='vegegg_soy')    return VEGEGG_SOY_QTY[tier]
  if(type==='vegegg_paneer') return VEGEGG_PANEER_QTY[tier]
  if(type==='vegegg_egg')    return VEGEGG_EGG_QTY
  return PROTEIN_QTY[type]?.[tier]||100
}

function getValidNonveg(foods) { return NON_VEG_POOL_ALL.filter(n=>n in foods&&foods[n].calories<=190) }

function selectFruit(target, achieved, foods) {
  const pg=target.protein-achieved.protein, cg=target.carbs-achieved.carbs
  let pref
  if(pg>5&&cg<40)       pref=['Raw Guava','Raw Orange','Raw Apple','Raw Banana']
  else if(cg>50)        pref=['Raw Banana','Raw Orange','Raw Apple','Raw Guava']
  else if(cg<20)        pref=['Raw Guava','Raw Orange','Raw Apple','Raw Banana']
  else                  pref=['Raw Orange','Raw Guava','Raw Apple','Raw Banana']
  return pref.find(f=>f in foods)||pref[0]
}

function getMealSlots(n) {
  return {
    2:[['Lunch',.5],['Dinner',.5]],
    3:[['Breakfast',.25],['Lunch',.375],['Dinner',.375]],
    4:[['Breakfast',.2],['Lunch',.3],['Snack',.2],['Dinner',.3]],
    5:[['Breakfast',.2],['Snack 1',.1],['Lunch',.3],['Snack 2',.1],['Dinner',.3]],
    6:[['Breakfast',.2],['Snack 1',.05],['Lunch',.325],['Snack 2',.05],['Dinner',.325],['Snack 3',.05]],
  }[n]||[['Breakfast',.25],['Lunch',.375],['Dinner',.375]]
}

function build7DayRotation(dk) {
  if(dk==='vegetarian') {
    const s=pick(['A','B']), o=s==='A'?'B':'A'
    return [s,o,s,o,s,o,s].map(c=>[c,'vegetarian'])
  }
  if(dk==='vegetarian_egg') return Array(7).fill(['A','vegetarian_egg'])
  if(dk==='non_vegetarian') {
    const s=pick(['A','B']), o=s==='A'?'B':'A'
    const days=[s,o,s,o,s,o].map(c=>[c,'non_vegetarian'])
    days.push(['A','vegetarian_egg']); return days
  }
}

function generateOneDayPlan(weight, state, dietKey, catKey, dalName, numMeals, foods, usedStateNonveg) {
  const target=computeTargets(weight), cal=target.calories, tier=getTierLabel(cal)
  const category=CATEGORIES[dietKey][catKey]
  const validNonveg=getValidNonveg(foods)
  let lpName=category.lunch[0]; const lpType=category.lunch[1]

  if(lpName==='NON_VEG') {
    const sNV=Object.entries(foods).filter(([n,f])=>
      f.state.toLowerCase()===state.toLowerCase()&&f.category.includes('Non-Vegetarian')&&
      f.calories<=190&&n!=='Whole Egg (Boiled)'&&(!usedStateNonveg||!usedStateNonveg.has(n))
    ).map(([n])=>n)
    let avail=validNonveg.filter(n=>n!=='Whole Egg (Boiled)'&&(!usedStateNonveg||!usedStateNonveg.has(n)))
    if(!avail.length) avail=validNonveg
    if(sNV.length&&Math.random()<0.4) { lpName=pick(sNV); if(usedStateNonveg) usedStateNonveg.add(lpName) }
    else lpName=pick(avail)
  }

  const slots=getMealSlots(numMeals)
  const hasBf=slots.some(s=>s[0]==='Breakfast')
  const snackSlots=slots.filter(s=>s[0].includes('Snack'))
  const nS=snackSlots.length

  const meals={}
  for(const [sn,pct] of slots) meals[sn]={pct,calBudget:r(cal*pct),items:[],totals:zeroMacros()}

  function addItem(sn,fn,grams) {
    if(!(fn in foods)||grams<=0) return
    const unit=foods[fn].serving.includes('ml')?'ml':'g'
    const idx=meals[sn].items.findIndex(it=>it.name===fn)
    if(idx>=0) {
      const item=meals[sn].items[idx], nq=item.qty+grams, nm=macrosPerG(foods[fn],nq), om=item.macros
      for(const k of Object.keys(om)) meals[sn].totals[k]=r(meals[sn].totals[k]-om[k]+nm[k])
      meals[sn].items[idx]={...item,qty:nq,macros:nm}
    } else {
      const m=macrosPerG(foods[fn],grams)
      meals[sn].items.push({name:fn,qty:grams,unit,macros:m})
      meals[sn].totals=addMacros(meals[sn].totals,m)
    }
  }

  function removeItem(sn,fn,grams) {
    if(!(fn in foods)||grams<=0) return
    const idx=meals[sn].items.findIndex(it=>it.name===fn); if(idx<0) return
    const item=meals[sn].items[idx], nq=Math.max(0,item.qty-grams), om=item.macros
    if(nq===0) {
      for(const k of Object.keys(om)) meals[sn].totals[k]=r(meals[sn].totals[k]-om[k])
      meals[sn].items.splice(idx,1)
    } else {
      const nm=macrosPerG(foods[fn],nq)
      for(const k of Object.keys(om)) meals[sn].totals[k]=r(meals[sn].totals[k]-om[k]+nm[k])
      meals[sn].items[idx]={...item,qty:nq,macros:nm}
    }
  }

  function getQty(sn,fn) { return meals[sn].items.filter(it=>it.name===fn).reduce((s,it)=>s+it.qty,0) }
  function getAchieved() { return Object.values(meals).reduce((a,sl)=>addMacros(a,sl.totals),zeroMacros()) }

  function fill(sn,fn,maxQty) {
    if(!(sn in meals)||!(fn in foods)) return
    const inc=25, bud=meals[sn].calBudget+MEAL_TOLERANCE, ex=getQty(sn,fn)
    const rem=bud-meals[sn].totals.calories; if(rem<=0) return
    const cpi=foods[fn].calories/100*inc; if(cpi<=0) return
    let g=Math.floor(rem/cpi)*inc; g=Math.min(g,maxQty-ex)
    if(g>=inc) addItem(sn,fn,g)
  }

  function countOut(dev) {
    return [Math.abs(dev.calories)>50,Math.abs(dev.protein)>5,Math.abs(dev.carbs)>10,Math.abs(dev.fat)>5,Math.abs(dev.fibre)>10].filter(Boolean).length
  }
  function inTol(dev) { return countOut(dev)===0 }

  // Stage 1
  if(hasBf) {
    const [bff,bft]=category.breakfast
    const bq=dietKey==='vegetarian_egg'?getProteinQty(tier,bft):(SOY_CHUNKS_QTY[tier]||getProteinQty(tier,bft))
    addItem('Breakfast',bff,bq)
  } else {
    const sq=dietKey==='vegetarian_egg'?getProteinQty(tier,'vegegg_soy'):(SOY_CHUNKS_QTY[tier]||100)
    addItem('Lunch','Cooked Soy Chunks (TVP)',sq)
  }
  if('Lunch'in meals) {
    addItem('Lunch',lpName,getProteinQty(tier,lpType))
    if(dietKey==='vegetarian_egg') addItem('Lunch',dalName,100)
  }
  if('Dinner'in meals) {
    const [dnf,dnt]=category.dinner
    addItem('Dinner',dnf,getProteinQty(tier,dnt))
    if(dietKey!=='vegetarian_egg') addItem('Dinner',dalName,100)
  }

  // Stage 2 Breakfast
  if(hasBf) {
    if(nS===0) {
      addItem('Breakfast','Whole Milk',150); fill('Breakfast','Cooked Oats',200)
      if((target.carbs-getAchieved().carbs)>20) fill('Breakfast',selectFruit(target,getAchieved(),foods),300)
    } else if(nS===1) { if(weight<70) addItem('Breakfast','Whole Milk',150); fill('Breakfast','Cooked Oats',300) }
    else if(nS===2) fill('Breakfast','Whole Milk',300)
    else { fill('Breakfast','Plain Curd (Dahi)',150); fill('Breakfast','Cooked Oats',150) }
  }

  // Stage 2 Lunch
  if('Lunch'in meals) {
    if(dietKey==='vegetarian_egg') {
      fill('Lunch','Cooked White Rice',200); fill('Lunch','Plain Curd (Dahi)',150)
      if(weight>=80&&(target.carbs-getAchieved().carbs)>10) fill('Lunch',selectFruit(target,getAchieved(),foods),150)
    } else {
      if(nS===0) {
        const cm=numMeals===3?200:150, cr=61*(cm/100)
        if(dietKey==='non_vegetarian'&&numMeals===2) {
          fill('Lunch','Whole Wheat Roti (Ready to eat)',75); fill('Lunch','Plain Curd (Dahi)',cm); fill('Lunch','Whole Milk',200)
        } else {
          meals['Lunch'].calBudget-=cr; fill('Lunch','Whole Wheat Roti (Ready to eat)',300)
          meals['Lunch'].calBudget+=cr; fill('Lunch','Plain Curd (Dahi)',cm)
        }
      } else if(nS===1) fill('Lunch','Whole Wheat Roti (Ready to eat)',300)
      else if(nS===2) {
        meals['Lunch'].calBudget-=61; fill('Lunch','Whole Wheat Roti (Ready to eat)',300)
        meals['Lunch'].calBudget+=61; fill('Lunch','Plain Curd (Dahi)',150)
      } else fill('Lunch','Whole Wheat Roti (Ready to eat)',300)
    }
  }

  // Stage 2 Dinner
  if('Dinner'in meals) {
    if(dietKey==='vegetarian_egg') {
      meals['Dinner'].calBudget-=61; fill('Dinner','Whole Wheat Roti (Ready to eat)',300)
      meals['Dinner'].calBudget+=61; fill('Dinner','Whole Milk',300)
    } else if(dietKey==='non_vegetarian'&&numMeals===3) {
      fill('Dinner','Cooked White Rice',100); fill('Dinner','Whole Milk',300)
    } else {
      const rm=numMeals===2?200:numMeals===3?225:300
      fill('Dinner','Cooked White Rice',rm)
      if(numMeals===3) fill('Dinner','Whole Milk',100)
      if(numMeals===2) { fill('Dinner','Whole Milk',200); fill('Dinner',selectFruit(target,getAchieved(),foods),350) }
    }
  }

  // Stage 2 Snacks
  snackSlots.forEach(([sn],i) => {
    if(nS===1) {
      if(dietKey==='vegetarian_egg') {
        fill(sn,selectFruit(target,getAchieved(),foods),100); fill(sn,'Cooked Oats',100); fill(sn,'Plain Curd (Dahi)',100)
        const an=getAchieved()
        if((target.protein-an.protein)>(target.carbs-an.carbs)) fill(sn,'Plain Curd (Dahi)',200)
        else fill(sn,selectFruit(target,getAchieved(),foods),200)
      } else if(dietKey==='non_vegetarian') {
        fill(sn,selectFruit(target,getAchieved(),foods),150); fill(sn,'Plain Curd (Dahi)',150); fill(sn,'Whole Milk',500)
      } else {
        fill(sn,selectFruit(target,getAchieved(),foods),300); fill(sn,'Plain Curd (Dahi)',150)
        if(weight>=70) fill(sn,'Whole Milk',300)
      }
    } else if(nS===2) {
      if(dietKey==='vegetarian_egg') {
        if(i===0) { fill(sn,selectFruit(target,getAchieved(),foods),200); fill(sn,'Plain Curd (Dahi)',150) }
        else fill(sn,'Cooked Oats',200)
      } else {
        if(i===0) fill(sn,getAchieved().carbs<target.carbs*0.3?'Plain Cooked Poha':'Cooked Oats',250)
        else fill(sn,selectFruit(target,getAchieved(),foods),400)
      }
    } else {
      if(dietKey==='vegetarian_egg') {
        if(i===0) fill(sn,selectFruit(target,getAchieved(),foods),100)
        else if(i===1) fill(sn,'Plain Curd (Dahi)',100)
        else fill(sn,'Cooked Oats',100)
      } else {
        if(i===0) fill(sn,selectFruit(target,getAchieved(),foods),300)
        else if(i===1) fill(sn,'Whole Milk',300)
        else fill(sn,'Cooked Oats',200)
      }
    }
  })

  // Stage 3
  for(let p=0;p<2;p++) {
    const ach=getAchieved(), pr=macroPctRemaining(ach,target)
    const hi=Object.entries(pr).sort((a,b)=>b[1]-a[1])[0]
    if(!hi||hi[1]<15) break
    if(hi[0]==='carbs') {
      for(const [sn,fn] of [['Dinner','Cooked White Rice'],['Lunch','Whole Wheat Roti (Ready to eat)']]) {
        if(sn in meals&&getQty(sn,fn)<300){fill(sn,fn,300);break}
      }
    } else if(hi[0]==='fat') {
      const ts=snackSlots[0]?.[0]||(hasBf?'Breakfast':'Lunch')
      if(ts in meals) fill(ts,'Whole Milk',300)
    } else {
      const ts=snackSlots[0]?.[0]||(hasBf?'Breakfast':'Lunch')
      if(ts in meals){const fr=selectFruit(target,getAchieved(),foods);if(getQty(ts,fr)<300)fill(ts,fr,300)}
    }
  }

  // Stage 4
  const ach4=getAchieved(), cr4=target.calories-ach4.calories
  if(cr4>50&&dietKey!=='non_vegetarian') {
    const sv=Object.entries(foods).filter(([n,f])=>
      f.state.toLowerCase()===state.toLowerCase()&&!f.category.includes('Non-Vegetarian')&&
      f.category.includes('Vegetarian')&&!EXCLUDED.has(n)
    ).map(([n])=>n)
    if(sv.length) {
      let bsf=null,bs=-1
      for(const sf of sv){const m=macrosPerG(foods[sf],100);if(ach4.calories+m.calories<=target.calories+50){const s=m.protein+m.fibre;if(s>bs){bs=s;bsf=sf}}}
      if(bsf){
        const sq=macrosPerG(foods[bsf],100).calories+ach4.calories<=target.calories+50?100:50
        for(const pl of ('Lunch'in meals?['Lunch','Dinner']:['Dinner'])){
          if(macrosPerG(foods[bsf],sq).calories<=meals[pl].calBudget+MEAL_TOLERANCE-meals[pl].totals.calories){addItem(pl,bsf,sq);break}
        }
      }
    }
  }

  // Stage 5
  for(let p=0;p<8;p++) {
    const ach5=getAchieved()
    const dev={}; for(const k of Object.keys(target)) dev[k]=r(ach5[k]-target[k])
    if(inTol(dev)) break
    const thr={calories:50,carbs:10,fat:5,protein:5}
    const over=Object.entries(dev).filter(([k,v])=>v>0&&k in thr&&Math.abs(v)>thr[k])
    if(!over.length) break
    const wm=over.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0][0]
    let bc=null,bcon=0
    for(const[sn,sl]of Object.entries(meals))for(const it of sl.items){
      if(!FILLER_FOODS.has(it.name)||it.qty<25) continue
      const c=it.macros[wm]||0; if(c>bcon){bcon=c;bc=[sn,it.name]}
    }
    if(!bc) break
    const co=countOut(dev); removeItem(bc[0],bc[1],25)
    const nd={}; const na=getAchieved(); for(const k of Object.keys(target)) nd[k]=r(na[k]-target[k])
    if(countOut(nd)>co){addItem(bc[0],bc[1],25);break}
  }

  const final=getAchieved()
  const deviation={}; for(const k of Object.keys(target)) deviation[k]=r(final[k]-target[k])
  const o=countOut(deviation)
  return {
    category:catKey, dietUsed:dietKey, dal:dalName, tier,
    meals:slots.map(([sn])=>({meal:sn,calorieBudget:meals[sn].calBudget,items:meals[sn].items,mealTotals:meals[sn].totals})),
    dailySummary:{target,achieved:final,deviation,quality:o===0?'PASS':o===1?'GOOD':'NEEDS IMPROVEMENT'},
  }
}

export function generate7DayPlan(weight, state, dietType, numMeals, foods) {
  let dk=dietType.toLowerCase().replace(/ /g,'_').replace(/\+/g,'_')
  if(dk.includes('non')) dk='non_vegetarian'
  else if(dk.includes('egg')) dk='vegetarian_egg'
  else dk='vegetarian'

  const rotation=build7DayRotation(dk)
  const dalOrder=shuffle(DAL_POOL)
  const usedNV=dk==='non_vegetarian'?new Set():null
  const wt=computeTargets(weight)

  const weeklyPlan=rotation.map(([ck,edk],idx)=>{
    const d=generateOneDayPlan(weight,state,edk,ck,dalOrder[idx],numMeals,foods,usedNV)
    return {...d,day:idx+1,dayLabel:`Day ${idx+1}`,...(idx===6&&dk==='non_vegetarian'?{dayNote:'Egg Day (Vegetarian+Egg menu)'}:{})}
  })

  const wa=weeklyPlan.reduce((a,d)=>addMacros(a,d.dailySummary.achieved),zeroMacros())
  const avg={},avgDev={}
  for(const k of Object.keys(wt)){avg[k]=r(wa[k]/7);avgDev[k]=r(avg[k]-wt[k])}

  return {
    inputs:{weightKg:weight,state,dietType,mealsPerDay:numMeals},
    nutritionTargets:wt, weeklyPlan,
    weeklySummary:{avgDailyAchieved:avg,avgDailyDeviation:avgDev},
  }
}
