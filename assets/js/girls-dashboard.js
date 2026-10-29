
let saved=0, toastTimer;
window.sdFitUserId=null;
window.sdFitSavedOutfits=new Set();
function notify(message){const t=document.getElementById('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
function toggleSave(button){const id=button.dataset.outfit;if(window.sdFitSavedOutfits.has(id)){window.sdFitSavedOutfits.delete(id)}else{window.sdFitSavedOutfits.add(id)}button.classList.toggle('saved',window.sdFitSavedOutfits.has(id));button.textContent=window.sdFitSavedOutfits.has(id)?'♥':'♡';saved=window.sdFitSavedOutfits.size;document.getElementById('savedCount').textContent=String(saved);if(window.sdFitUserId){localStorage.setItem('smartFdFitSavedOutfitsV1_'+window.sdFitUserId,JSON.stringify([...window.sdFitSavedOutfits]));window.dispatchEvent(new CustomEvent('sd-fit:favorites-changed',{detail:[...window.sdFitSavedOutfits]}))}notify(window.sdFitSavedOutfits.has(id)?'Outfit added to your saved collection.':'Outfit removed from your saved collection.')}
function selectCategory(button,name){document.querySelectorAll('.category').forEach(el=>el.classList.remove('selected'));button.classList.add('selected');notify(name+' style selected.')}
function pickDay(button){document.querySelectorAll('.day').forEach(el=>el.classList.remove('active'));button.classList.add('active');notify('Planner day selected: '+button.querySelector('span').textContent+' '+button.querySelector('strong').textContent+'.')}
function updateWeekCalendar(){const today=new Date(),mondayOffset=(today.getDay()+6)%7,start=new Date(today);start.setDate(today.getDate()-mondayOffset);document.querySelectorAll('#weekDays .day').forEach((button,index)=>{const date=new Date(start);date.setDate(start.getDate()+index);button.querySelector('span').textContent=date.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase();button.querySelector('strong').textContent=String(date.getDate());button.classList.toggle('active',index===mondayOffset)})}
updateWeekCalendar();

function generateStylistLook(){
 const occasion=document.getElementById('stylistOccasion').value;
 const vibe=document.getElementById('stylistVibe').value;
 const formula=document.getElementById('stylistFormula').value;
 const catalog=window.SDFitCatalog;
 if(!catalog){notify('The clothing catalog is still loading. Try again in a moment.');return;}
 const look=catalog.buildLook({occasion,vibe,formula});
 if(!look.items.length){notify('No catalog pieces were available for this look.');return;}
 const result=document.getElementById('stylistResult');
 result.replaceChildren();
 const icon=document.createElement('div');icon.className='stylist-result-icon';icon.textContent='✦';
 const content=document.createElement('div');content.className='catalog-look-content';
 const title=document.createElement('strong');title.textContent=look.title;
 const description=document.createElement('p');description.textContent='Selected from '+catalog.items.length+' illustrative catalog pieces. Use the previews to compare the items in this look.';
 const pieces=document.createElement('div');pieces.className='catalog-look';
 look.items.forEach(item=>{const card=document.createElement('article');card.className='catalog-look-item';const image=document.createElement('img');image.src=item.imageUrl;image.alt=item.display_name+' catalog preview';const label=document.createElement('span');label.textContent=item.display_name+' · '+item.category;card.append(image,label);pieces.appendChild(card);});
 const actions=document.createElement('div');actions.className='catalog-look-actions';
 const save=document.createElement('button');save.type='button';save.className='catalog-look-save';save.dataset.action='toggle-save';save.dataset.outfit=look.id;save.setAttribute('aria-label','Save this catalog look');save.textContent=window.sdFitSavedOutfits.has(look.id)?'♥ Saved look':'♡ Save this look';
 const count=document.createElement('span');count.className='catalog-count';count.textContent=look.items.length+' catalog pieces';actions.append(save,count);
 const shapeAdvice=window.sdFitShapeAdvice;
 if(shapeAdvice){const fitTip=document.createElement('p');fitTip.textContent='Fit idea for '+shapeAdvice.label+': '+shapeAdvice.ideas[0];const fitCheck=document.createElement('p');fitCheck.textContent='Fit check: '+shapeAdvice.fit[0]+'.';content.append(fitTip,fitCheck);}
 content.append(title,description,pieces,actions);
 result.append(icon,content);
 notify('Your '+occasion.toLowerCase()+' outfit idea is ready.');
}

function toggleMenu(){document.getElementById('sidebar').classList.toggle('open')}
function navigateToTarget(targetSelector){
 const target=document.querySelector(targetSelector);
 if(!target)return;
 const destinationPages=[
  [['#outfits'],'outfits'],
  [['#body','#bodyShapeAnalysis'],'body'],
  [['#aiStylist'],'stylist'],
  [['#digitalWardrobe'],'wardrobe'],
  [['#virtual-try-on'],'tryon'],
  [['#weekly-outfit-planner','#planner'],'planner'],
  [['#personal-colour-stylist'],'color'],
  [['#smart-shopping-assistant'],'shopping'],
  [['#style-inspiration'],'inspiration'],
  [['#categories','.content-grid .categories'],'collections'],
  [['#settings'],'settings'],
  [['#helpSupport'],'help']
 ];
 const match=destinationPages.find(([selectors])=>selectors.some(selector=>target.matches(selector)||target.closest(selector)));
 if(match&&document.body.dataset.page!==match[1]){location.href=`${location.pathname}?page=${match[1]}`;return}
 if(target.getClientRects().length)target.scrollIntoView({behavior:'smooth'});
}
document.addEventListener('click',event=>{const control=event.target.closest('[data-action]');if(!control)return;const action=control.dataset.action;if(action==='notify')notify(control.dataset.message||'Done.');else if(action==='scroll')navigateToTarget(control.dataset.target);else if(action==='toggle-menu')toggleMenu();else if(action==='generate-stylist')generateStylistLook();else if(action==='toggle-save')toggleSave(control);else if(action==='pick-day')pickDay(control);else if(action==='select-style')selectCategory(control,control.dataset.name)});
document.querySelectorAll('[data-nav]').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('[data-nav]').forEach(a=>a.classList.remove('active'));link.classList.add('active');if(window.innerWidth<=760)document.getElementById('sidebar').classList.remove('open')}));
document.getElementById('searchInput').addEventListener('input',function(){const catalogSearch=document.getElementById('catalogSearch');catalogSearch.value=this.value;catalogSearch.dispatchEvent(new Event('input'));document.getElementById('clothingCatalog').scrollIntoView({behavior:'smooth'});});
// Optional demo personalization: add ?name=YourName to the URL.
const params=new URLSearchParams(location.search);const name=params.get('name');if(name){const clean=name.trim().slice(0,35);document.getElementById('greetingName').textContent=clean.split(' ')[0];document.getElementById('sideName').textContent=clean;document.getElementById('avatarInitial').textContent=clean.charAt(0).toUpperCase()}

function analyseBodyShape(){
 const shoulder=Number(document.getElementById('shapeShoulder').value);
 const bust=Number(document.getElementById('shapeChest').value);
 const waist=Number(document.getElementById('shapeWaist').value);
 const hips=Number(document.getElementById('shapeHips').value);
 if([shoulder,bust,waist,hips].some(v=>!Number.isFinite(v)||v<=0)){return;}
 const top=Math.max(shoulder,bust);
 let shape='Rectangle / balanced',tip='Try defined waistlines, layering and different silhouettes to explore the looks you enjoy.';
 if(hips>top*1.05){shape='Pear-led proportions';tip='Try balanced upper-body details, cropped or structured layers and bottoms that fit comfortably at the hips.';}
 else if(top>hips*1.08 && top>waist*1.12){shape='Inverted-triangle-led proportions';tip='Try softer shoulder details, V-necks or flowing lower-body silhouettes if you want a more balanced visual line.';}
 else if(Math.abs(top-hips)/Math.max(top,hips)<0.08 && waist<top*0.78){shape='Hourglass-like proportions';tip='Try wrap shapes, gentle waist definition and well-fitted separates if that matches your personal style.';}
 else if(Math.abs(top-hips)/Math.max(top,hips)<0.08){shape='Rectangle / balanced';tip='Try layering, belts or varied proportions to experiment with silhouette; none is required.';}
 document.getElementById('shapeResult').innerHTML='<div class="shape-result-mark">⌁</div><div><strong>Estimated shape: '+shape+'</strong><p>'+tip+'<br><br><b>Fit reminder:</b> This is a rough clothing-fit guide, not a definitive classification. Bodies vary, and you can wear any style you like.</p></div>';
 if(typeof notify==='function') notify('Your approximate fit profile is ready.');
}
const WARDROBE_STORAGE_KEY='smartFdFitWardrobeV1';
function readWardrobe(){
 try{return JSON.parse(localStorage.getItem(WARDROBE_STORAGE_KEY)||'[]');}
 catch(e){return [];}
}
function saveWardrobe(items){
 try{localStorage.setItem(WARDROBE_STORAGE_KEY,JSON.stringify(items));return true;}
 catch(e){alert('Storage is full. Try adding a smaller photo or remove a few items.');return false;}
}
function wardrobeIcon(category){
 return ({'Tops':'👕','Bottoms':'👖','Outerwear':'🧥','Shoes':'👟','Accessories':'👜','Traditional / occasion wear':'✨'})[category]||'👚';
}
function renderWardrobe(){
 const items=readWardrobe(), filter=document.getElementById('wardrobeFilter').value;
 document.getElementById('wardrobeCount').textContent=items.length+' ITEM'+(items.length===1?'':'S');
 const shown=items.filter(x=>filter==='All'||x.category===filter);
 const grid=document.getElementById('wardrobeGrid');
 if(!shown.length){grid.innerHTML='<div class="wardrobe-empty">'+(items.length?'No items in this category yet.':'Your wardrobe is empty. Add your first item above.')+'</div>';return;}
 grid.innerHTML=shown.map(item=>'<article class="wardrobe-card"><div class="wardrobe-photo">'+(item.photo?'<img src="'+item.photo+'" alt="">':wardrobeIcon(item.category))+'</div><div class="wardrobe-card-info"><strong>'+escapeWardrobeText(item.name)+'</strong><small>'+escapeWardrobeText(item.category)+' · '+escapeWardrobeText(item.colour)+'</small><button type="button" onclick="deleteWardrobeItem(\''+item.id+'\')">Remove</button></div></article>').join('');
}
function escapeWardrobeText(value){
 return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function deleteWardrobeItem(id){
 const items=readWardrobe().filter(x=>x.id!==id);
 if(saveWardrobe(items)){renderWardrobe();document.getElementById('wardrobeSuggestion').textContent='Item removed.';}
}
function resizeWardrobePhoto(file){
 return new Promise((resolve,reject)=>{
  if(!file){resolve('');return;}
  if(!file.type.startsWith('image/')){reject(new Error('Please choose an image file.'));return;}
  const reader=new FileReader();
  reader.onload=()=>{
   const img=new Image();
   img.onload=()=>{
    const canvas=document.createElement('canvas'), max=480, scale=Math.min(1,max/Math.max(img.width,img.height));
    canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    resolve(canvas.toDataURL('image/jpeg',0.68));
   };
   img.onerror=()=>reject(new Error('Could not read that image.'));
   img.src=reader.result;
  };
  reader.onerror=()=>reject(new Error('Could not read that image.'));
  reader.readAsDataURL(file);
 });
}
document.addEventListener('DOMContentLoaded',()=>{
 const form=document.getElementById('wardrobeForm');
 if(!form)return;
 renderWardrobe();
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  try{
   const photo=await resizeWardrobePhoto(document.getElementById('wardrobePhoto').files[0]);
   const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:document.getElementById('wardrobeName').value.trim(),category:document.getElementById('wardrobeCategory').value,colour:document.getElementById('wardrobeColour').value,photo};
   const items=readWardrobe();items.unshift(item);
   if(saveWardrobe(items)){form.reset();renderWardrobe();document.getElementById('wardrobeSuggestion').textContent='Added '+item.name+' to your wardrobe.';}
  }catch(err){alert(err.message||'Could not add that item.');}
  finally{button.disabled=false;}
 });
 document.getElementById('wardrobeFilter').addEventListener('change',renderWardrobe);
 document.getElementById('makeOutfitBtn').addEventListener('click',()=>{
  const items=readWardrobe();
  const tops=items.filter(x=>x.category==='Tops'), bottoms=items.filter(x=>x.category==='Bottoms'), shoes=items.filter(x=>x.category==='Shoes'), outer=items.filter(x=>x.category==='Outerwear');
  if(!tops.length||!bottoms.length){
   document.getElementById('wardrobeSuggestion').textContent='Add at least one item in Tops and one in Bottoms to build a more complete outfit idea.';
   return;
  }
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const combo=[pick(tops),pick(bottoms)];
  if(shoes.length)combo.push(pick(shoes));
  if(outer.length)combo.push(pick(outer));
  document.getElementById('wardrobeSuggestion').innerHTML='<strong>✦ Outfit idea for you</strong><br>'+combo.map(x=>escapeWardrobeText(x.name)+' ('+escapeWardrobeText(x.colour)+')').join(' + ')+'<br><small>Try these pieces together and adjust for weather, occasion and comfort.</small>';
 });
});





// SD Fit Step 4 — Virtual Try-On (local image overlay demo)
(function(){
  const byId = id => document.getElementById(id);
  const personInput=byId('vto-person-file'), garmentInput=byId('vto-garment-file');
  const personImg=byId('vto-person-img'), garmentImg=byId('vto-garment-img');
  const placeholder=byId('vto-placeholder'), preview=byId('vto-preview'), status=byId('vto-status');
  const size=byId('vto-size'), opacity=byId('vto-opacity'), xpos=byId('vto-x'), ypos=byId('vto-y');
  if(!personInput || !garmentInput || !preview || preview.dataset.vtoReady) return;
  preview.dataset.vtoReady='1';
  let personUrl=null, garmentUrl=null, dragging=false, dragStart=null;
  function say(msg){ status.textContent=msg; }
  function sync(){
    const w=Number(size.value), x=Number(xpos.value), y=Number(ypos.value), o=Number(opacity.value)/100;
    garmentImg.style.width=w+'%'; garmentImg.style.left=x+'%'; garmentImg.style.top=y+'%'; garmentImg.style.opacity=String(o);
    byId('vto-size-value').textContent=w+'%'; byId('vto-opacity-value').textContent=Math.round(o*100)+'%';
    byId('vto-x-value').textContent=x+'%'; byId('vto-y-value').textContent=y+'%';
  }
  function loadImage(input, img, which){
    const file=input.files && input.files[0]; if(!file) return;
    if(!file.type.startsWith('image/')) { say('Please choose a valid image file.'); input.value=''; return; }
    if(file.size>12*1024*1024){say('Please use an image smaller than 12 MB.');input.value='';return;}
    const url=URL.createObjectURL(file);
    if(which==='person' && personUrl) URL.revokeObjectURL(personUrl);
    if(which==='garment' && garmentUrl) URL.revokeObjectURL(garmentUrl);
    if(which==='person') personUrl=url; else garmentUrl=url;
    img.onload=()=>{img.hidden=false; placeholder.hidden=!(personImg.hidden && garmentImg.hidden); sync(); say(personImg.hidden||garmentImg.hidden?'Upload both images to begin the preview.':'Images ready — drag the clothing overlay or adjust the controls.');};
    img.onerror=()=>say('Could not open that image. Try another file.');
    img.src=url;
  }
  personInput.addEventListener('change',()=>loadImage(personInput,personImg,'person'));
  garmentInput.addEventListener('change',()=>loadImage(garmentInput,garmentImg,'garment'));
  [size,opacity,xpos,ypos].forEach(el=>el.addEventListener('input',sync));
  garmentImg.addEventListener('pointerdown',e=>{
    if(garmentImg.hidden)return; dragging=true; garmentImg.setPointerCapture(e.pointerId);
    dragStart={x:e.clientX,y:e.clientY,left:Number(xpos.value),top:Number(ypos.value)};
    e.preventDefault();
  });
  garmentImg.addEventListener('pointermove',e=>{
    if(!dragging||!dragStart)return;
    const r=preview.getBoundingClientRect();
    xpos.value=Math.max(5,Math.min(95,dragStart.left+(e.clientX-dragStart.x)/r.width*100));
    ypos.value=Math.max(5,Math.min(95,dragStart.top+(e.clientY-dragStart.y)/r.height*100));sync();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>garmentImg.addEventListener(ev,()=>{dragging=false;dragStart=null;}));
  byId('vto-reset').addEventListener('click',()=>{size.value=42;opacity.value=90;xpos.value=50;ypos.value=40;sync();say('Overlay position reset.');});
  byId('vto-clear').addEventListener('click',()=>{
    personInput.value='';garmentInput.value='';
    personImg.hidden=true;garmentImg.hidden=true;personImg.removeAttribute('src');garmentImg.removeAttribute('src');
    if(personUrl)URL.revokeObjectURL(personUrl);if(garmentUrl)URL.revokeObjectURL(garmentUrl);
    personUrl=null;garmentUrl=null;placeholder.hidden=false;say('Images cleared from the preview.');
  });
  byId('vto-download').addEventListener('click',()=>{
    if(personImg.hidden||garmentImg.hidden){say('Upload both images before saving the preview.');return;}
    const rect=preview.getBoundingClientRect(), canvas=document.createElement('canvas');
    const scale=2;canvas.width=Math.round(rect.width*scale);canvas.height=Math.round(rect.height*scale);
    const ctx=canvas.getContext('2d');ctx.fillStyle=getComputedStyle(preview).backgroundColor||'#f3f3f3';ctx.fillRect(0,0,canvas.width,canvas.height);
    function drawContain(img,x,y,w,h){
      const ratio=Math.min(w/img.naturalWidth,h/img.naturalHeight),dw=img.naturalWidth*ratio,dh=img.naturalHeight*ratio;
      ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
    }
    drawContain(personImg,0,0,canvas.width,canvas.height);
    const w=Number(size.value)/100*canvas.width, x=Number(xpos.value)/100*canvas.width, y=Number(ypos.value)/100*canvas.height;
    const ratio=Math.min(w/garmentImg.naturalWidth,(canvas.height*.65)/garmentImg.naturalHeight);
    const gw=garmentImg.naturalWidth*ratio,gh=garmentImg.naturalHeight*ratio;
    ctx.globalAlpha=Number(opacity.value)/100;ctx.drawImage(garmentImg,x-gw/2,y-gh/2,gw,gh);ctx.globalAlpha=1;
    const a=document.createElement('a');a.download='sd-fit-virtual-try-on.png';a.href=canvas.toDataURL('image/png');a.click();say('Preview saved as PNG.');
  });
  sync();
})();





// SD Fit Step 5 — Weekly Outfit Planner
(function(){
  const $=id=>document.getElementById(id);
  const root=$('weekly-outfit-planner'); if(!root||root.dataset.ready)return; root.dataset.ready='1';
  const gender=(document.body.innerText.toLowerCase().includes('girls dashboard')||document.body.innerText.toLowerCase().includes('women dashboard'))?'girls':'boys';
  const key='smartFdFitWeeklyPlanV1_'+gender;
  const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const looks={
    boys:{
      college:[
        ['Clean casual','Solid tee','Straight-fit jeans','Clean sneakers'],
        ['Smart casual','Polo shirt','Chinos','Low-top sneakers'],
        ['Relaxed street','Oversized tee','Cargo pants','Sneakers'],
        ['Minimal layers','Plain shirt','Dark jeans','Watch + sneakers'],
        ['Sporty comfort','Athletic tee','Joggers','Running shoes'],
        ['Weekend easy','Printed tee','Relaxed denim','Sneakers'],
        ['Neat classic','Casual button-down','Chinos','Clean shoes']
      ],
      work:[
        ['Professional','Oxford shirt','Tailored trousers','Formal shoes'],
        ['Smart business','Polo or knit top','Chinos','Loafers'],
        ['Interview ready','Solid formal shirt','Dark trousers','Polished shoes'],
        ['Business casual','Fine-knit top','Straight trousers','Minimal shoes'],
        ['Office relaxed','Plain shirt','Chinos','Clean loafers'],
        ['Smart weekend','Polo shirt','Dark denim','Clean sneakers'],
        ['Prepared & neat','Button-down shirt','Tailored trousers','Formal shoes']
      ],
      social:[
        ['Dinner fit','Textured shirt','Dark jeans','Clean boots'],
        ['Casual meetup','Premium tee','Straight denim','Sneakers'],
        ['Night out','Black tee','Dark cargos','Statement sneakers'],
        ['Minimal evening','Monochrome shirt','Slim-straight trousers','Watch'],
        ['Event ready','Structured overshirt','Dark pants','Clean shoes'],
        ['Party look','Statement shirt','Black jeans','Boots'],
        ['Relaxed hangout','Polo shirt','Chinos','Sneakers']
      ]
    },
    girls:{
      college:[
        ['Easy everyday','Fitted tee or kurti','Straight jeans','Sneakers / flats'],
        ['Soft casual','Pastel top','Wide-leg trousers','Flats'],
        ['Street casual','Oversized tee','Cargo pants','Sneakers'],
        ['Clean minimal','Solid shirt','Straight-fit jeans','Minimal sneakers'],
        ['Comfy day','Cotton kurti','Leggings or trousers','Comfortable flats'],
        ['Weekend casual','Graphic tee','Relaxed denim','Sneakers'],
        ['Neat classic','Blouse or short kurti','Tailored trousers','Flats']
      ],
      work:[
        ['Professional','Structured shirt','Tailored trousers','Loafers / flats'],
        ['Smart elegant','Solid kurti','Straight trousers','Simple flats'],
        ['Interview ready','Neutral blouse','Formal trousers','Closed-toe shoes'],
        ['Business casual','Fine-knit top','Midi skirt or trousers','Loafers'],
        ['Office relaxed','Longline shirt','Straight pants','Minimal flats'],
        ['Smart weekend','Polo top','Dark denim','Clean sneakers'],
        ['Prepared & neat','Classic kurti or blouse','Tailored pants','Simple accessories']
      ],
      social:[
        ['Dinner look','Satin-look blouse','Dark jeans or trousers','Heeled flats'],
        ['Casual meetup','Statement top','Straight denim','Sneakers'],
        ['Night out','Monochrome top','Wide-leg trousers','Statement accessories'],
        ['Minimal evening','Elegant blouse','Midi skirt or trousers','Simple jewellery'],
        ['Event ready','Structured top','Tailored pants','Dressy flats'],
        ['Party look','Dressy top','Dark skirt or trousers','Comfortable party shoes'],
        ['Relaxed hangout','Polo or soft top','Chinos or denim','Flats / sneakers']
      ]
    }
  };
  const extra={
    minimal:['Keep to 2–3 neutral colours','Choose clean lines and simple accessories'],
    streetwear:['Add a relaxed layer or one statement piece','Keep the silhouette balanced'],
    elegant:['Use a polished layer and understated accessories','Choose neat fits and coordinated colours'],
    sporty:['Prioritise movement-friendly pieces','Use breathable fabrics and comfortable shoes'],
    balanced:['Repeat one colour across the outfit','Prioritise comfort and weather suitability']
  };
  function chooseRoutine(routine,style,weather){
    const group=routine==='work'?'work':routine==='social'?'social':'college';
    const arr=looks[gender][group];
    return arr.map((x,i)=>{
      let items=x.slice(1);
      if(style==='minimal') items[0]=gender==='girls'?'Neutral '+items[0].toLowerCase(): 'Plain '+items[0].toLowerCase();
      if(style==='streetwear' && i%2===0) items[1]=gender==='girls'?'Cargo pants':'Cargo pants';
      if(style==='sporty' && i%2===1) items[0]=gender==='girls'?'Athletic top':'Athletic tee';
      if(weather==='hot') items.push('Lightweight breathable fabric');
      if(weather==='cold') items.push('Add a warm jacket / layer');
      if(weather==='rainy') items.push('Water-resistant outer layer + grippy shoes');
      return {day:days[i],title:x[0],items,tip:extra[style][i%extra[style].length],worn:false};
    });
  }
  function render(plan){
    const host=$('wp-days');host.innerHTML='';
    if(!plan||!plan.length){host.innerHTML='<div class="wp-empty">No plan yet. Generate your week to get started.</div>';return;}
    plan.forEach((o,i)=>{
      const card=document.createElement('article');card.className='wp-day';
      const top=document.createElement('div');top.className='wp-day-top';
      const name=document.createElement('div');name.className='wp-day-name';name.textContent=o.day;
      const tag=document.createElement('span');tag.className='wp-tag';tag.textContent=o.worn?'✓ Worn':'Planned';
      top.append(name,tag);
      const content=document.createElement('div');content.className='wp-outfit';
      const title=document.createElement('strong');title.textContent=o.title;content.appendChild(title);
      const ul=document.createElement('ul');(o.items||[]).forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.appendChild(li);});content.appendChild(ul);
      const tip=document.createElement('div');tip.style.color='var(--muted)';tip.style.fontSize='.85rem';tip.textContent='Tip: '+o.tip;content.appendChild(tip);
      const check=document.createElement('label');check.style.display='inline-flex';check.style.alignItems='center';check.style.gap='7px';check.style.marginTop='12px';check.style.fontSize='.88rem';
      const box=document.createElement('input');box.type='checkbox';box.checked=!!o.worn;box.addEventListener('change',()=>{o.worn=box.checked;tag.textContent=o.worn?'✓ Worn':'Planned';});
      check.append(box,document.createTextNode('Mark as worn'));card.append(top,content,check);host.appendChild(card);
    });
  }
  function status(t){$('wp-status').textContent=t;}
  $('wp-generate').addEventListener('click',()=>{
    const routine=$('wp-routine').value,style=$('wp-style').value,weather=$('wp-weather').value;
    const plan=chooseRoutine(routine,style,weather);
    plan.forEach((o,i)=>{if(routine==='mixed'&&i%2===1){const alt=chooseRoutine(i%4===1?'work':'social',style,weather);plan[i]=alt[i];plan[i].day=days[i];}});
    window.sdFitWeeklyPlan=plan;render(plan);window.dispatchEvent(new CustomEvent('sd-fit:weekly-plan-changed',{detail:plan}));status('Your 7-day outfit plan is ready. Mark outfits as worn, then save the plan.');
  });
  $('wp-save').addEventListener('click',()=>{
    if(!window.sdFitWeeklyPlan){status('Generate a weekly plan first.');return;}
    try{localStorage.setItem(key,JSON.stringify({routine:$('wp-routine').value,style:$('wp-style').value,weather:$('wp-weather').value,plan:window.sdFitWeeklyPlan}));status('Weekly plan saved in this browser.');}
    catch(e){status('Could not save the plan in browser storage. Try opening this file in a normal browser tab.');}
  });
  $('wp-load').addEventListener('click',()=>{
    try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(!saved||!saved.plan){status('No saved plan found in this browser yet.');return;}
      $('wp-routine').value=saved.routine||'college';$('wp-style').value=saved.style||'balanced';$('wp-weather').value=saved.weather||'mild';
      window.sdFitWeeklyPlan=saved.plan;render(saved.plan);window.dispatchEvent(new CustomEvent('sd-fit:weekly-plan-changed',{detail:saved.plan}));status('Saved weekly plan loaded.');
    }catch(e){status('Could not load the saved plan.');}
  });
  $('wp-clear').addEventListener('click',()=>{window.sdFitWeeklyPlan=null;render(null);window.dispatchEvent(new CustomEvent('sd-fit:weekly-plan-changed',{detail:null}));status('Current plan cleared. Saved plan remains until you remove browser storage.');});
})();





// SD Fit Step 6 — Personal Colour Stylist
(function(){
  const $=id=>document.getElementById(id);
  const root=$('personal-colour-stylist');if(!root||root.dataset.ready)return;root.dataset.ready='1';
  const palettes={
    warm:[
      {name:'Warm everyday',desc:'Easy-to-mix colours for daily outfits.',colors:[['Cream','#FFF1D6'],['Olive','#708238'],['Camel','#C19A6B'],['Terracotta','#C65D3B'],['Chocolate','#5A3825']]},
      {name:'Warm statement',desc:'Richer accents for standout looks.',colors:[['Mustard','#D4A017'],['Rust','#B64A2B'],['Forest','#245B45'],['Teal','#167D83'],['Warm navy','#263B5A']]}
    ],
    cool:[
      {name:'Cool everyday',desc:'Crisp colours that work well together.',colors:[['White','#F8F8F8'],['Slate','#708090'],['Denim blue','#3D5A80'],['Berry','#8E3B63'],['Charcoal','#33363F']]},
      {name:'Cool statement',desc:'Deeper accents for a sharper palette.',colors:[['Cobalt','#2457C5'],['Emerald','#087F5B'],['Plum','#673A70'],['Icy blue','#B9DDF2'],['Black','#171717']]}
    ],
    neutral:[
      {name:'Neutral everyday',desc:'Versatile shades to start with.',colors:[['Stone','#B7AA98'],['Taupe','#8C7B6A'],['Sage','#A3B18A'],['Dusty blue','#7D9AAA'],['Navy','#263B5A']]},
      {name:'Neutral statement',desc:'Balanced colour accents with depth.',colors:[['Teal','#287C78'],['Rosewood','#9B5C63'],['Moss','#66734E'],['Burgundy','#722F37'],['Soft white','#F6F0E7']]}
    ]
  };
  const moods={
    balanced:{title:'Easy outfit formula',text:'Use one neutral base, one supporting colour, and one accent. Keep shoes close to a colour already in the outfit.'},
    minimal:{title:'Minimal formula',text:'Build around two neutrals and one muted accent. Repeating the same colour in shoes or a bag creates a clean look.'},
    streetwear:{title:'Streetwear formula',text:'Use a neutral base with one bold accent. Try colour-blocking in your top, outerwear, or sneakers.'},
    elegant:{title:'Elegant formula',text:'Choose tonal shades or a deep colour with a soft neutral. Keep accessories coordinated rather than competing.'},
    festive:{title:'Statement formula',text:'Pair one rich colour with a warm or cool neutral, then add metallic or textured accessories if you like.'}
  };
  function contrastAdjust(palette,contrast){
    if(contrast==='low')return palette.map((p,i)=>({...p,name:p.name+' · soft edit',colors:p.colors.map((c,j)=>j===3?[c[0]+' (muted)',i===0?'#BFA7A0':'#9BB5C4']:c)}));
    if(contrast==='high')return palette.map((p,i)=>({...p,name:p.name+' · bold edit',colors:p.colors.map((c,j)=>j===0?[c[0]+' (bright base)',i===0?'#FFFFFF':'#171717']:c)}));
    return palette;
  }
  function render(){
    const undertone=$('cs-undertone').value,contrast=$('cs-contrast').value,mood=$('cs-mood').value;
    const result=$('cs-results');result.innerHTML='';
    const selected=contrastAdjust(palettes[undertone],contrast);
    selected.forEach(p=>{
      const card=document.createElement('article');card.className='cs-card';
      const h=document.createElement('h3');h.textContent=p.name;card.appendChild(h);
      const d=document.createElement('div');d.className='cs-muted';d.textContent=p.desc;card.appendChild(d);
      const swatches=document.createElement('div');swatches.className='cs-palette';
      p.colors.forEach(([name,hex])=>{
        const b=document.createElement('button');b.type='button';b.className='cs-swatch';b.style.background=hex;b.title=name+' '+hex;b.setAttribute('aria-label','Copy '+name+' '+hex);
        const label=document.createElement('span');label.textContent=name;b.appendChild(label);
        b.addEventListener('click',async()=>{
          const value=name+' '+hex;
          try{await navigator.clipboard.writeText(value);$('cs-status').textContent='Copied '+value;}
          catch(e){$('cs-status').textContent=value+' — copy this text manually.';}
        });
        swatches.appendChild(b);
      });
      card.appendChild(swatches);
      const chips=document.createElement('div');chips.className='cs-colour-list';
      p.colors.forEach(([name])=>{const c=document.createElement('span');c.className='cs-chip';c.textContent=name;chips.appendChild(c);});
      card.appendChild(chips);result.appendChild(card);
    });
    const formula=document.createElement('article');formula.className='cs-card';
    const title=document.createElement('h3');title.textContent=moods[mood].title;formula.appendChild(title);
    const text=document.createElement('p');text.className='cs-muted';text.textContent=moods[mood].text;formula.appendChild(text);
    const combo=document.createElement('div');combo.className='cs-colour-list';
    const examples=undertone==='warm'?['Cream + olive','Camel + white','Rust + denim']:undertone==='cool'?['White + slate','Navy + berry','Cobalt + charcoal']:['Stone + navy','Sage + cream','Teal + taupe'];
    examples.forEach(t=>{const c=document.createElement('span');c.className='cs-chip';c.textContent=t;combo.appendChild(c);});
    formula.appendChild(combo);result.appendChild(formula);
    $('cs-status').textContent='Palette updated for '+undertone+' undertones, '+contrast+' contrast, and '+mood+' style.';
  }
  $('cs-generate').addEventListener('click',render);render();
})();





// SD Fit Step 7 — Smart Shopping Assistant
(function(){
  const $=id=>document.getElementById(id);
  const root=$('smart-shopping-assistant');if(!root||root.dataset.ready)return;root.dataset.ready='1';
  const isGirls=location.pathname.toLowerCase().includes('girls') || document.body.innerText.toLowerCase().includes('girls dashboard');
  const key='smartFdFitShoppingListV1_'+(isGirls?'girls':'boys');
  const catalog={
    boys:[
      {name:'Everyday T-shirts',cat:'Tops',price:499,goals:['college','everyday'],priority:['basics','balanced','comfort'],desc:'Versatile solid tees for easy daily combinations.'},
      {name:'Casual shirt',cat:'Tops',price:899,goals:['college','work','everyday'],priority:['balanced','basics'],desc:'A clean shirt for college, casual plans, or smart-casual looks.'},
      {name:'Straight-fit jeans',cat:'Bottoms',price:1199,goals:['college','everyday'],priority:['basics','balanced'],desc:'A dependable base for tees, polos, and shirts.'},
      {name:'Chinos / formal trousers',cat:'Bottoms',price:1299,goals:['work','college'],priority:['basics','balanced'],desc:'Useful for interviews, presentations, and polished outfits.'},
      {name:'Comfort sneakers',cat:'Footwear',price:1499,goals:['college','everyday','party'],priority:['comfort','balanced'],desc:'A comfortable pair for repeated everyday wear.'},
      {name:'Statement overshirt',cat:'Layer',price:1199,goals:['party','everyday'],priority:['statement','balanced'],desc:'Adds texture and a stronger style element.'},
      {name:'Athletic tee',cat:'Activewear',price:599,goals:['season','everyday'],priority:['comfort','basics'],desc:'Lightweight option for activity and warm days.'},
      {name:'Lightweight jacket',cat:'Layer',price:1799,goals:['season','party'],priority:['statement','balanced'],desc:'An extra layer for cooler weather and evening plans.'},
      {name:'Belt + socks set',cat:'Accessories',price:399,goals:['work','college','everyday'],priority:['basics','balanced'],desc:'Small essentials that complete everyday outfits.'},
      {name:'Minimal watch',cat:'Accessories',price:999,goals:['work','party'],priority:['statement','balanced'],desc:'A simple accessory for a more finished look.'}
    ],
    girls:[
      {name:'Everyday tops',cat:'Tops',price:599,goals:['college','everyday'],priority:['basics','balanced','comfort'],desc:'Easy-to-style tops for repeated everyday outfits.'},
      {name:'Casual kurti',cat:'Ethnic wear',price:799,goals:['college','everyday','season'],priority:['basics','balanced','comfort'],desc:'A versatile kurti for college and casual plans.'},
      {name:'Straight-fit jeans',cat:'Bottoms',price:1199,goals:['college','everyday'],priority:['basics','balanced'],desc:'A flexible base for tees, shirts, and kurtis.'},
      {name:'Tailored trousers',cat:'Bottoms',price:1299,goals:['work','college'],priority:['basics','balanced'],desc:'Useful for presentations, interviews, and smart-casual looks.'},
      {name:'Comfortable flats',cat:'Footwear',price:899,goals:['college','everyday','work'],priority:['comfort','basics','balanced'],desc:'A practical option for long days and everyday wear.'},
      {name:'Everyday sneakers',cat:'Footwear',price:1499,goals:['college','everyday'],priority:['comfort','balanced'],desc:'A versatile choice for casual outfits.'},
      {name:'Statement top',cat:'Tops',price:999,goals:['party'],priority:['statement','balanced'],desc:'A special top that can refresh existing bottoms.'},
      {name:'Midi dress / event outfit',cat:'Occasion wear',price:1799,goals:['party'],priority:['statement','balanced'],desc:'An event-ready piece for parties and celebrations.'},
      {name:'Light cardigan',cat:'Layer',price:1199,goals:['season','work','everyday'],priority:['comfort','balanced'],desc:'An easy layer for changing temperatures.'},
      {name:'Simple jewellery set',cat:'Accessories',price:499,goals:['party','college','everyday'],priority:['statement','balanced'],desc:'A small accessory update for multiple looks.'}
    ]
  };
  let checklist=[];
  function money(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
  function status(t){$('sa-status').textContent=t;}
  function updateSummary(){
    const total=checklist.filter(x=>x.checked).reduce((s,x)=>s+x.price,0);
    const budget=Math.max(0,Number($('sa-budget').value)||0);
    $('sa-total').textContent='Selected total: '+money(total);
    $('sa-left').textContent=(total>budget?'Over budget: ':'Budget left: ')+money(Math.abs(budget-total));
    $('sa-left').style.color=total>budget?'#d94841':'';
  }
  function renderList(){
    const host=$('sa-list-items');host.innerHTML='';
    if(!checklist.length){host.textContent='No items added yet. Add suggestions above to build your checklist.';host.className='sa-muted';updateSummary();return;}
    host.className='';
    checklist.forEach((item,i)=>{
      const row=document.createElement('div');row.className='sa-list-row';
      const check=document.createElement('input');check.type='checkbox';check.checked=!!item.checked;check.setAttribute('aria-label','Mark '+item.name+' as selected');
      check.addEventListener('change',()=>{item.checked=check.checked;updateSummary();});
      const label=document.createElement('label');label.textContent=item.name;
      const small=document.createElement('small');small.textContent=item.cat+' · '+money(item.price);label.appendChild(small);
      const remove=document.createElement('button');remove.type='button';remove.className='sa-add';remove.textContent='Remove';remove.addEventListener('click',()=>{checklist.splice(i,1);renderList();});
      row.append(check,label,remove);host.appendChild(row);
    });updateSummary();
  }
  function renderCatalog(items){
    const host=$('sa-results');host.innerHTML='';
    items.forEach(item=>{
      const card=document.createElement('article');card.className='sa-item';
      const top=document.createElement('div');top.className='sa-item-top';
      const title=document.createElement('h3');title.textContent=item.name;
      const price=document.createElement('span');price.className='sa-price';price.textContent=money(item.price);
      top.append(title,price);
      const meta=document.createElement('div');meta.className='sa-muted';meta.textContent=item.cat;
      const desc=document.createElement('p');desc.style.marginTop='7px';desc.textContent=item.desc;
      const btn=document.createElement('button');btn.type='button';btn.className='sa-add';btn.textContent=checklist.some(x=>x.name===item.name)?'Added ✓':'Add to checklist';
      btn.disabled=checklist.some(x=>x.name===item.name);
      btn.addEventListener('click',()=>{checklist.push({...item,checked:true});renderList();renderCatalog(items);status(item.name+' added to checklist.');});
      card.append(top,meta,desc,btn);host.appendChild(card);
    });
  }
  function build(){
    const budget=Math.max(100,Number($('sa-budget').value)||3000),goal=$('sa-goal').value,priority=$('sa-priority').value;
    const items=catalog[isGirls?'girls':'boys'].filter(x=>(x.goals.includes(goal)||goal==='everyday')&&(x.priority.includes(priority)||priority==='balanced'));
    const filtered=items.length?items:catalog[isGirls?'girls':'boys'].filter(x=>x.goals.includes(goal));
    renderCatalog(filtered);
    status('Showing '+filtered.length+' suggestions. Add items to your checklist and check the total against '+money(budget)+'.');
    updateSummary();
  }
  $('sa-recommend').addEventListener('click',build);
  $('sa-budget').addEventListener('input',updateSummary);
  $('sa-clear').addEventListener('click',()=>{checklist=[];renderList();status('Checklist cleared.');});
  $('sa-save').addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify(checklist));status('Checklist saved in this browser.');}catch(e){status('Could not save checklist in browser storage.');}});
  $('sa-load').addEventListener('click',()=>{try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(data)){status('No saved checklist found.');return;}checklist=data;renderList();status(data.length?'Saved checklist loaded.':'No saved checklist found yet.');}catch(e){status('Could not load saved checklist.');}});
  $('sa-export').addEventListener('click',async()=>{
    if(!checklist.length){status('Add items before exporting the list.');return;}
    const text=checklist.map(x=>(x.checked?'[x] ':'[ ] ')+x.name+' — '+money(x.price)).join('\n')+'\nSelected total: '+money(checklist.filter(x=>x.checked).reduce((s,x)=>s+x.price,0));
    try{await navigator.clipboard.writeText(text);status('Shopping list copied to clipboard.');}
    catch(e){const blob=new Blob([text],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='sd-fit-shopping-checklist.txt';a.click();URL.revokeObjectURL(url);status('Shopping list exported as a text file.');}
  });
  build();renderList();
})();





// SD Fit Step 8 — Style Inspiration Feed
(function(){
  const $=id=>document.getElementById(id);
  const root=$('style-inspiration');if(!root||root.dataset.ready)return;root.dataset.ready='1';
  const isGirls=location.pathname.toLowerCase().includes('girls')||document.body.innerText.toLowerCase().includes('girls dashboard');
  const key='smartFdFitSavedLooksV1_'+(isGirls?'girls':'boys');
  const boysLooks=[
    {id:'b1',name:'Campus Clean',cat:'college',emoji:'👕',desc:'Solid tee, straight-fit denim, clean sneakers.',tags:['Easy','Everyday'],tip:'Repeat one colour in your shoes or accessories.'},
    {id:'b2',name:'Relaxed Streetwear',cat:'casual',emoji:'🧢',desc:'Oversized tee, cargo trousers, statement sneakers.',tags:['Streetwear','Comfort'],tip:'Balance an oversized top with a clean bottom silhouette.'},
    {id:'b3',name:'Minimal Monochrome',cat:'minimal',emoji:'⚫',desc:'Black or white base with one tonal layer.',tags:['Minimal','Versatile'],tip:'Mix textures so a single-colour outfit still has depth.'},
    {id:'b4',name:'Smart Interview',cat:'work',emoji:'👔',desc:'Solid shirt, tailored trousers, neat formal shoes.',tags:['Polished','Classic'],tip:'Make sure the shoulders and trouser length fit comfortably.'},
    {id:'b5',name:'Dinner Ready',cat:'party',emoji:'🌙',desc:'Textured shirt, dark jeans, clean boots or sneakers.',tags:['Evening','Smart casual'],tip:'Keep accessories simple and let one item stand out.'},
    {id:'b6',name:'Weekend Sporty',cat:'casual',emoji:'🏃',desc:'Breathable tee, joggers, comfortable trainers.',tags:['Sporty','Comfort'],tip:'Choose breathable fabric and shoes suited to your activity.'}
  ];
  const girlsLooks=[
    {id:'g1',name:'Campus Soft Casual',cat:'college',emoji:'🌸',desc:'Simple top or kurti, straight denim, comfortable flats.',tags:['Everyday','Easy'],tip:'Choose a base colour and repeat it in a small accessory.'},
    {id:'g2',name:'Relaxed Street Style',cat:'casual',emoji:'🧢',desc:'Oversized tee, cargo trousers, sneakers.',tags:['Streetwear','Comfort'],tip:'A compact bag and one accent colour keep the look cohesive.'},
    {id:'g3',name:'Soft Minimal',cat:'minimal',emoji:'🤍',desc:'Cream, taupe, or sage pieces with clean silhouettes.',tags:['Minimal','Soft'],tip:'Mix fabric textures and keep the palette to two or three colours.'},
    {id:'g4',name:'Presentation Ready',cat:'work',emoji:'📎',desc:'Structured shirt or kurti, tailored trousers, simple flats.',tags:['Polished','Classic'],tip:'Prioritise comfortable fit and understated accessories.'},
    {id:'g5',name:'Evening Statement',cat:'party',emoji:'✨',desc:'Statement top or dress, coordinated accessories, event-ready shoes.',tags:['Evening','Dressy'],tip:'Choose shoes you can comfortably stand and walk in.'},
    {id:'g6',name:'Weekend Comfort',cat:'casual',emoji:'☀️',desc:'Cotton top, relaxed denim, sneakers or flats.',tags:['Relaxed','Comfort'],tip:'Light layers make the outfit more adaptable.'}
  ];
  const looks=isGirls?girlsLooks:boysLooks;let filter='all';let saved=[];
  try{const parsed=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(parsed))saved=parsed;}catch(e){}
  function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch(e){}}
  function renderSaved(){
    const host=$('si-saved-list');host.innerHTML='';
    if(!saved.length){host.textContent='Save a look to see it here.';return;}
    saved.forEach(id=>{
      const look=looks.find(x=>x.id===id);if(!look)return;
      const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)';
      const label=document.createElement('span');label.textContent=look.emoji+' '+look.name;
      const remove=document.createElement('button');remove.type='button';remove.className='si-save';remove.textContent='Remove';remove.style.marginTop='0';remove.addEventListener('click',()=>{saved=saved.filter(x=>x!==id);persist();render();renderSaved();});
      row.append(label,remove);host.appendChild(row);
    });
  }
  function render(){
    const host=$('si-grid');host.innerHTML='';
    looks.filter(x=>filter==='all'||x.cat===filter).forEach(look=>{
      const card=document.createElement('article');card.className='si-card';
      const visual=document.createElement('div');visual.className='si-visual';visual.textContent=look.emoji;
      const body=document.createElement('div');body.className='si-card-body';
      const title=document.createElement('h3');title.textContent=look.name;
      const desc=document.createElement('p');desc.textContent=look.desc;
      const tip=document.createElement('p');tip.textContent='Style tip: '+look.tip;
      const tags=document.createElement('div');tags.className='si-tags';look.tags.forEach(t=>{const tag=document.createElement('span');tag.className='si-tag';tag.textContent=t;tags.appendChild(tag);});
      const button=document.createElement('button');button.type='button';button.className='si-save'+(saved.includes(look.id)?' saved':'');button.textContent=saved.includes(look.id)?'♥ Saved':'♡ Save this look';
      button.addEventListener('click',()=>{if(saved.includes(look.id)){saved=saved.filter(x=>x!==look.id);}else{saved.push(look.id);}persist();render();renderSaved();$('si-status').textContent=saved.includes(look.id)?'Look saved to your favourites.':'Look removed from favourites.';});
      body.append(title,desc,tip,tags,button);card.append(visual,body);host.appendChild(card);
    });
  }
  $('si-filters').querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    filter=btn.dataset.filter;$('si-filters').querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===btn));render();
  }));
  render();renderSaved();
})();
