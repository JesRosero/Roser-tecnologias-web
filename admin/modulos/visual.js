const id=new URLSearchParams(location.search).get('pagina')||'software';
if(['software','software-apps','software-web','software-bots','proyecto-bot-ferreteria','bots-privacidad','bots-terminos','bots-eliminacion'].includes(id))await import('./visual-software.js');
else await import('./visual-nativo.js');
