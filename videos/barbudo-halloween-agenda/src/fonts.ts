import {continueRender, delayRender, staticFile} from 'remotion';

export const HORROR = 'Creepster, cursive';
export const DISPLAY = '"Bebas Neue", Impact, sans-serif';

const handle = delayRender('Carregando fontes');
Promise.all([
  new FontFace('Creepster', `url(${staticFile('fonts/creepster.woff2')}) format('woff2')`).load(),
  new FontFace('Bebas Neue', `url(${staticFile('fonts/bebas-neue.woff2')}) format('woff2')`).load(),
])
  .then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
