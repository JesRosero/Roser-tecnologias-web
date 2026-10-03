export const RUTAS_APLICACIONES = {
 '3dcost': '/paginas/aplicaciones/3dcost/index.html',
 'construcost': '/paginas/aplicaciones/construcost/index.html'
};
export const ENLACES_LEGALES_APLICACIONES = Object.fromEntries(Object.keys(RUTAS_APLICACIONES).map(id => [id, {
 privacidad: `/paginas/aplicaciones/${id}/privacidad/index.html`,
 terminos: `/paginas/aplicaciones/${id}/terminos/index.html`
}]));
