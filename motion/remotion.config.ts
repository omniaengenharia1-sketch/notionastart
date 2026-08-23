import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setOverwriteOutput(true);

// Em ambientes que ja tem um Chrome/Chromium instalado (CI, container), aponte
// REMOTION_BROWSER para o binario e o Remotion nao baixa outro.
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
