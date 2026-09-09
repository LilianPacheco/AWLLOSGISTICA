/* CONFIGURAÇÃO ÚNICA. Após mudar dados, execute: node tools/sync-config.js
   Isso atualiza também HTML sem JS, metadados e sitemap. Não há build do site. */
const AWL_CONFIG = {
  "brand": "AWL",
  "phone": "(48) 9178-4464",
  "phoneE164": "+554891784464",
  "whatsappE164": "+5548991784464",
  "email": "awlpremoldados@gmail.com",
  "legalName": "WL LOGISTICA CARGA E DESCARGA PRE MOLDADO LTDA",
  "cnpj": "65.842.422/0001-50",
  "city": "Palhoça",
  "state": "SC",
  "area": "Grande Florianópolis e região",
  "siteUrl": "https://lilianpacheco.github.io/AWLLOSGISTICA",
  "formEndpoint": "",
  "whatsappMessage": "Olá, AWL! Gostaria de conversar sobre uma operação de carga e descarga."
};
// WhatsApp confirmado por César nesta conversa em 07/09/2026.
// {{ENDERECO_COMPLETO}}: não publicar sem decisão humana; cidade e região bastam.

(() => {
  document.body.classList.add('js');
  const c = AWL_CONFIG;
  const wa = /^\+\d{12,15}$/.test(c.whatsappE164);
  document.querySelectorAll('[data-whatsapp]').forEach(a => {
    a.href = wa ? `https://wa.me/${c.whatsappE164.replace(/\D/g,'')}?text=${encodeURIComponent(c.whatsappMessage)}` : 'contato.html#canais';
  });
  document.querySelectorAll('[data-config]').forEach(el => el.textContent = c[el.dataset.config]);
  document.querySelectorAll('[data-phone]').forEach(a => a.href = `tel:${c.phoneE164}`);
  document.querySelectorAll('[data-email]').forEach(a => a.href = `mailto:${c.email}`);
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  const closeMenu = () => { menu.setAttribute('aria-expanded','false'); nav.classList.remove('open'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
  });
  nav.addEventListener('click', e => { if(e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
  document.addEventListener('click', e => { if(!e.target.closest('.site-header')) closeMenu(); });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  if(!reduce.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(e => {
      if(e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); }
    }), {threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  }
  const heroImage = document.querySelector('.hero-image');
  let ticking=false;
  window.addEventListener('scroll', () => {
    if(!ticking && heroImage && !reduce.matches) {
      ticking=true; requestAnimationFrame(() => {
        heroImage.style.transform = `translateY(${Math.min(scrollY*.08,55)}px) scale(1.08)`; ticking=false;
      });
    }
  }, {passive:true});
  const film = document.querySelector('#operation-video');
  const filmButton = document.querySelector('[data-video-toggle]');
  if(film) {
    const setFilm = () => {
      if(reduce.matches) { film.pause(); film.removeAttribute('autoplay'); film.hidden=true; filmButton.hidden=true; }
      else { film.hidden=false; filmButton.hidden=false; film.play().catch(() => { filmButton.textContent='Reproduzir vídeo'; }); }
      if(heroImage && reduce.matches) heroImage.style.transform='none';
    };
    setFilm(); reduce.addEventListener('change',setFilm);
    filmButton.addEventListener('click', () => { if(film.paused) film.play().catch(()=>{}); else film.pause(); });
    film.addEventListener('play', () => filmButton.textContent='Pausar vídeo');
    film.addEventListener('pause', () => filmButton.textContent='Reproduzir vídeo');
  }
  document.querySelectorAll('.photo img').forEach(img => {
    if(img.complete) img.classList.add('loaded');
    else img.addEventListener('load',()=>img.classList.add('loaded'),{once:true});
  });

  const grid = document.querySelector('.gallery-grid');
  const dialog = document.querySelector('#lightbox');
  if(grid && dialog) {
    const items = [...grid.querySelectorAll('[data-category]')];
    const count = document.querySelector('#gallery-count');
    const filters = [...document.querySelectorAll('[data-filter]')];
    let visible = items, selected=0, opener;
    const media = dialog.querySelector('.lightbox-media');
    const caption = dialog.querySelector('#lightbox-caption');
    const stopVideo = () => media.querySelector('video')?.pause();
    filters.forEach(button => button.addEventListener('click',()=>{
      filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      items.forEach(item=>item.hidden=button.dataset.filter!=='todos' && !item.dataset.category.split(' ').includes(button.dataset.filter));
      visible=items.filter(item=>!item.hidden); count.textContent=`${visible.length} registros`;
    }));
    function render() {
      stopVideo(); media.replaceChildren();
      const link=visible[selected].querySelector('[data-lightbox]');
      const video=link.dataset.kind==='video';
      const el=document.createElement(video?'video':'img');
      el.src=link.href;
      if(video) { el.controls=true; el.playsInline=true; el.muted=true; el.poster='img/video-poster.jpeg'; }
      else el.alt=link.dataset.caption;
      media.append(el); caption.textContent=link.dataset.caption;
      dialog.querySelector('.lightbox-position').textContent=`${selected+1} / ${visible.length}`;
    }
    grid.addEventListener('click',e=>{
      const link=e.target.closest('[data-lightbox]'); if(!link) return;
      e.preventDefault(); opener=link; selected=visible.indexOf(link.closest('[data-category]'));
      render(); dialog.showModal(); document.body.classList.add('dialog-open');
      dialog.querySelector('[data-close]').focus();
    });
    const move = direction => { selected=(selected+direction+visible.length)%visible.length; render(); };
    dialog.querySelector('[data-prev]').addEventListener('click',()=>move(-1));
    dialog.querySelector('[data-next]').addEventListener('click',()=>move(1));
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click', e=> { if(e.target===dialog) dialog.close(); });
    dialog.addEventListener('keydown',e=>{
      if(e.target.tagName==='VIDEO') return;
      if(e.key==='ArrowRight') { e.preventDefault(); move(1); }
      if(e.key==='ArrowLeft') { e.preventDefault(); move(-1); }
    });
    dialog.addEventListener('close',()=> { stopVideo(); media.replaceChildren(); document.body.classList.remove('dialog-open'); opener?.focus(); });
  }

  const form=document.querySelector('#contact-form');
  if(form) {
    const requestedService=new URLSearchParams(location.search).get('servico');
    const serviceField=form.querySelector('#servico');
    if([...serviceField.options].some(option=>option.value===requestedService)) serviceField.value=requestedService;
    form.noValidate=true;
    const status=document.querySelector('#form-status');
    const fields=[...form.querySelectorAll('input,select,textarea')];
    function validate(field) {
      let error='';
      if(field.required && !field.value.trim()) error='Preencha este campo.';
      else if(field.name==='telefone' && !/^\+?[\d\s().-]+$/.test(field.value)) error='Use apenas números, espaços, +, parênteses ou traços.';
      else if(field.name==='telefone' && ![10,11,12,13].includes(field.value.replace(/\D/g,'').length)) error='Informe o telefone com DDD.';
      field.setAttribute('aria-invalid',String(!!error));
      document.getElementById(`${field.id}-error`).textContent=error;
      return !error;
    }
    fields.forEach(field=>field.addEventListener('input',()=>{ if(field.getAttribute('aria-invalid')==='true') validate(field); }));
    form.addEventListener('submit', async e=>{
      e.preventDefault();
      const checks=fields.map(validate);
      status.className='form-status';
      if(checks.includes(false)) { status.textContent='Confira os campos indicados para continuar.'; fields[checks.indexOf(false)].focus(); return; }
      const data=Object.fromEntries(new FormData(form));
      const body=`Nome: ${data.nome}\nEmpresa: ${data.empresa || 'Não informada'}\nTelefone: ${data.telefone}\nServiço: ${data.servico}\n\n${data.mensagem}`;
      if(!c.formEndpoint) {
        const url=`mailto:${c.email}?subject=${encodeURIComponent(`Contato AWL — ${data.servico}`)}&body=${encodeURIComponent(body)}`;
        status.replaceChildren(document.createTextNode('Mensagem preparada. Finalize o envio no seu aplicativo de e-mail. Se ele não abrir, '));
        const retry=document.createElement('a'); retry.href=url; retry.textContent='abra o e-mail por aqui'; status.append(retry);
        status.classList.add('success'); window.location.href=url; return;
      }
      const submit=form.querySelector('[type="submit"]'); submit.disabled=true; submit.textContent='Enviando…'; status.textContent='Enviando sua mensagem…';
      try {
        const response=await fetch(c.formEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
        if(!response.ok) throw new Error('send');
        status.textContent='Mensagem enviada. A AWL recebeu seu contato.'; status.classList.add('success'); form.reset();
      } catch { status.textContent='Não foi possível enviar. Seus dados foram mantidos. Tente novamente ou fale pelo WhatsApp.'; }
      finally { submit.disabled=false; submit.textContent='Preparar mensagem'; }
    });
  }
})();
