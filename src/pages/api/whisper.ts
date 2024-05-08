import type { APIRoute } from "astro";
import { transcribe } from "../../lib/whisper";

const sampleRate = 16000;

export const POST: APIRoute = async ({ request }) => {
  const arrayBuffer = await request.arrayBuffer();
  const audioBuffer = new Float32Array(arrayBuffer);

  const x = await transcribe(audioBuffer, {
    model: "Xenova/whisper-tiny",
    // model: "Xenova/whisper-base",
    multilingual: false,
    quantized: false,
    subtask: null, // 'transcribe'
    language: null, // 'english'
  });
  console.log(x);

  //   const audioBuffer = await loadArrayBuffer(buffer);
  //   console.log(AudioBuffer.numberOfChannels);
  //   const buffer = loadFileBuffer(file)

  //   transcribe();

  return new Response("ok : " + JSON.stringify(x), {
    status: 200,
  });
};

// https://github.com/xenova/transformers.js/blob/main/examples/next-server/src/app/classify/route.js

// https://github.com/xenova/whisper-web/blob/main/src/worker.js
//     let transcript = await transcribe(
//         message.audio,
//         message.model,
//         message.multilingual,
//         message.quantized,
//         message.subtask,
//         message.language,
//     );
