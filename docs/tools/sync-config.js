/* Ferramenta opcional de manutenção, executada com Node. O site já é HTML estático. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const js = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const c = JSON.parse(js.match(/const AWL_CONFIG = (\{[\s\S]*?\});/)[1]);
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const getAttr = (tag,key) => tag.match(new RegExp('\\b'+key+'="([^"]*)"'))?.[1];
const setAttr = (tag,key,value) => tag.replace(new RegExp('\\b'+key+'="[^"]*"'),`${key}="${escape(value)}"`);
const hasDomain = /^https:\/\/[^/]+/.test(c.siteUrl) && !c.siteUrl.includes('{{');
const base = c.siteUrl.replace(/\/$/,'');
const wa = /^\+\d{12,15}$/.test(c.whatsappE164) ? 'https://wa.me/' + c.whatsappE164.replace(/\D/g,'') + '?text=' + encodeURIComponent(c.whatsappMessage) : 'contato.html#canais';
const pages = ['index.html','projetos.html','galeria.html','contato.html'];
const schema = {'@context':'https://schema.org','@type':'LocalBusiness',name:c.brand,legalName:c.legalName,taxID:c.cnpj,telephone:c.phoneE164,email:c.email,address:{'@type':'PostalAddress',addressLocality:c.city,addressRegion:c.state,addressCountry:'BR'},areaServed:c.area};
if(hasDomain) { schema.url=base+'/'; schema.image=base+'/img/patio.jpeg'; }
for(const file of pages) {
  let html = fs.readFileSync(path.join(root,file),'utf8');
  html = html.replace(/(<[^>]+data-config="([^"]+)"[^>]*>)[^<]*(<\/[^>]+>)/g,(_,a,key,b)=>a+escape(c[key])+b);
  html = html.replace(/<a\b[^>]*>/g,tag=>{
    if(tag.includes('data-whatsapp')) return setAttr(tag,'href',wa);
    if(tag.includes('data-phone')) return setAttr(tag,'href','tel:'+c.phoneE164);
    if(tag.includes('data-email')) return setAttr(tag,'href','mailto:'+c.email);
    return tag;
  }).replace(/<form\b[^>]*>/g,tag=>getAttr(tag,'id')==='contact-form'?setAttr(tag,'action','mailto:'+c.email):tag)
    .replace(/(<script\b[^>]*id="business-schema"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(schema).replaceAll('<','\\u003c')+b)
    .replace(/<link\b[^>]*>/g,tag=>getAttr(tag,'rel')==='canonical'?setAttr(tag,'href',base+'/'+file):tag)
    .replace(/<meta\b[^>]*>/g,tag=>{
      const name=getAttr(tag,'property')||getAttr(tag,'name');
      if(name==='og:url') return setAttr(tag,'content',base+'/'+file);
      if(['og:image','twitter:image'].includes(name)) return setAttr(tag,'content',base+'/img/patio.jpeg');
      if(name==='robots') return setAttr(tag,'content',hasDomain?'index, follow':'noindex, nofollow');
      return tag;
    });
  fs.writeFileSync(path.join(root,file),html);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>`  <url><loc>${escape(base+'/'+p)}</loc></url>`).join('\n')+'\n</urlset>\n');
fs.writeFileSync(path.join(root,'robots.txt'),hasDomain ? `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n` : '# Prévia local. Defina siteUrl em js/main.js e execute tools/sync-config.js antes de publicar.\nUser-agent: *\nDisallow: /\n');
console.log(hasDomain ? 'Dados, metadados e sitemap sincronizados para '+base : 'Dados sincronizados. Domínio pendente; indexação desativada na prévia.');
