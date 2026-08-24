/**
 * Prepara public/trilha.wav a partir de uma faixa qualquer.
 *
 * Recebe qualquer arquivo de audio ou video, decodifica com o ffmpeg que ja
 * vem no Remotion, corta na duracao exata da composicao e aplica fade de
 * entrada e de saida. Trocar a musica do Reels e rodar isto de novo.
 *
 *   node scripts/preparar-trilha.mjs caminho/da/faixa.mp3 [inicioEmSegundos]
 */
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  COMPOSICAO,
  DURACAO_TOTAL_EM_FRAMES,
  TRILHA,
} from '../src/beats.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

const origem = process.argv[2];
const inicioEmSegundos = Number(process.argv[3] ?? 0);

if (!origem) {
  console.error('uso: node scripts/preparar-trilha.mjs <faixa> [inicioEmSegundos]');
  process.exit(1);
}

const DURACAO = DURACAO_TOTAL_EM_FRAMES / COMPOSICAO.fps;
const FADE_DE_ENTRADA = 0.04;
const FADE_DE_SAIDA = 0.55;

const temporario = mkdtempSync(join(tmpdir(), 'trilha-'));
const decodificado = join(temporario, 'faixa.wav');

try {
  execFileSync(
    'npx',
    ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', origem, '-vn', decodificado],
    {cwd: RAIZ, stdio: ['ignore', 'ignore', 'inherit']},
  );

  const bruto = readFileSync(decodificado);

  // Percorre os chunks do RIFF ate achar o formato e os dados.
  let cursor = 12;
  let formato = null;
  let dados = null;

  while (cursor < bruto.length - 8) {
    const id = bruto.toString('ascii', cursor, cursor + 4);
    const tamanho = bruto.readUInt32LE(cursor + 4);

    if (id === 'fmt ') {
      formato = {
        canais: bruto.readUInt16LE(cursor + 10),
        taxa: bruto.readUInt32LE(cursor + 12),
        bits: bruto.readUInt16LE(cursor + 22),
      };
    }

    if (id === 'data') {
      dados = {inicio: cursor + 8, tamanho};
      break;
    }

    cursor += 8 + tamanho + (tamanho % 2);
  }

  if (!formato || !dados || formato.bits !== 16) {
    throw new Error('esperava um WAV PCM de 16 bits na saida do ffmpeg');
  }

  const bytesPorQuadro = formato.canais * 2;
  const quadrosDisponiveis = Math.floor(dados.tamanho / bytesPorQuadro);
  const primeiroQuadro = Math.round(inicioEmSegundos * formato.taxa);
  const quadrosPedidos = Math.round(DURACAO * formato.taxa);
  const quadros = Math.min(quadrosPedidos, quadrosDisponiveis - primeiroQuadro);

  if (quadros <= 0) {
    throw new Error('o inicio pedido passa do fim da faixa');
  }

  if (quadros < quadrosPedidos) {
    console.warn(
      `aviso: a faixa acaba antes do video, faltam ${((quadrosPedidos - quadros) / formato.taxa).toFixed(2)}s`,
    );
  }

  const saida = Buffer.alloc(44 + quadros * bytesPorQuadro);

  saida.write('RIFF', 0);
  saida.writeUInt32LE(36 + quadros * bytesPorQuadro, 4);
  saida.write('WAVE', 8);
  saida.write('fmt ', 12);
  saida.writeUInt32LE(16, 16);
  saida.writeUInt16LE(1, 20);
  saida.writeUInt16LE(formato.canais, 22);
  saida.writeUInt32LE(formato.taxa, 24);
  saida.writeUInt32LE(formato.taxa * bytesPorQuadro, 28);
  saida.writeUInt16LE(bytesPorQuadro, 32);
  saida.writeUInt16LE(16, 34);
  saida.write('data', 36);
  saida.writeUInt32LE(quadros * bytesPorQuadro, 40);

  const ganhoDoFade = (quadro) => {
    const segundo = quadro / formato.taxa;
    const restante = quadros / formato.taxa - segundo;
    const entrada = Math.min(segundo / FADE_DE_ENTRADA, 1);
    const saidaSuave = Math.min(restante / FADE_DE_SAIDA, 1);

    return Math.min(entrada, saidaSuave);
  };

  for (let quadro = 0; quadro < quadros; quadro++) {
    const ganho = ganhoDoFade(quadro);

    for (let canal = 0; canal < formato.canais; canal++) {
      const posicao =
        dados.inicio + (primeiroQuadro + quadro) * bytesPorQuadro + canal * 2;
      const amostra = Math.round(bruto.readInt16LE(posicao) * ganho);
      saida.writeInt16LE(
        Math.max(-32768, Math.min(32767, amostra)),
        44 + quadro * bytesPorQuadro + canal * 2,
      );
    }
  }

  const destino = join(RAIZ, 'public', TRILHA.arquivo);
  writeFileSync(destino, saida);

  console.log(
    `trilha preparada: ${destino} (${(saida.length / 1024).toFixed(0)} kB, ${(quadros / formato.taxa).toFixed(2)}s, ${formato.canais} canais a ${formato.taxa} Hz)`,
  );
} finally {
  rmSync(temporario, {recursive: true, force: true});
}
