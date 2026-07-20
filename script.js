const header=document.querySelector('.site-header');
const menuBtn=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>30),{passive:true});
menuBtn?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');}));

document.getElementById('year').textContent=new Date().getFullYear();

const arrival=document.getElementById('arrival');
const departure=document.getElementById('departure');
const priceTotal=document.getElementById('price-total');
const daysLabel=document.getElementById('days-label');
const priceDetail=document.getElementById('price-detail');
const today=new Date();
const iso=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};
arrival.min=iso(today);departure.min=iso(today);
function calc(){
  const a=arrival.value&&new Date(arrival.value+'T12:00:00');
  const d=departure.value&&new Date(departure.value+'T12:00:00');
  if(arrival.value) departure.min=arrival.value;
  if(!a||!d||d<a){daysLabel.textContent='Velg datoer';priceDetail.textContent='Pris vises automatisk';priceTotal.textContent='0 kr';return;}
  const calendarDays=Math.round((d-a)/86400000)+1;
  const dogs=Number(document.querySelector('input[name="dogs"]:checked').value);
  const daily=dogs===2?500:300;
  const total=calendarDays*daily;
  daysLabel.textContent=`${calendarDays} kalender${calendarDays===1?'dag':'dager'}`;
  priceDetail.textContent=`${daily.toLocaleString('nb-NO')} kr per kalenderdag`;
  priceTotal.textContent=`${total.toLocaleString('nb-NO')} kr`;
}
[arrival,departure,...document.querySelectorAll('input[name="dogs"]')].forEach(el=>el.addEventListener('change',calc));

const galleryToggle=document.querySelector('.gallery-toggle');
const galleryMore=document.getElementById('gallery-more');
galleryToggle?.addEventListener('click',()=>{const opening=galleryMore.hidden;galleryMore.hidden=!opening;galleryToggle.textContent=opening?'Vis færre bilder':'Se flere bilder';galleryToggle.setAttribute('aria-expanded',String(opening));});

const lightbox=document.querySelector('.lightbox');
const lightboxImg=lightbox?.querySelector('img');
document.querySelectorAll('.gallery-item').forEach(btn=>btn.addEventListener('click',()=>{lightboxImg.src=btn.dataset.full;lightboxImg.alt=btn.querySelector('img')?.alt||'';lightbox.showModal();}));
lightbox?.querySelector('.lightbox-close').addEventListener('click',()=>lightbox.close());
lightbox?.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});
