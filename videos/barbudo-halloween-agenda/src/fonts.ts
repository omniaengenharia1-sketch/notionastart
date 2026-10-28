import {continueRender, delayRender, staticFile} from 'remotion';

// Big Shoulders Display: condensada, do fino (100) ao pesado (900)
export const FONT = '"BSD", "Arial Narrow", sans-serif';
// Sedgwick Ave Display: letra de pincel/grafite para nomes de artistas
export const BRUSH = '"Sedgwick", cursive';
// Unbounded: letra larga e moderna para flyers de festa
export const WIDE = '"Unbounded", sans-serif';

const handle = delayRender('Carregando fontes');
Promise.all([
  ...[100, 400, 900].map((w) =>
    new FontFace('BSD', `url(${staticFile(`fonts/bsd-${w}.woff2`)}) format('woff2')`, {weight: String(w)}).load(),
  ),
  new FontFace('Sedgwick', `url(${staticFile('fonts/sedgwick.woff2')}) format('woff2')`).load(),
  ...[400, 800].map((w) =>
    new FontFace('Unbounded', `url(${staticFile(`fonts/unbounded-${w}.woff2`)}) format('woff2')`, {weight: String(w)}).load(),
  ),
])
  .then((faces) => {
    faces.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
