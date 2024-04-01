import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

class PipelineFactory {
  static task = null;
  static model = null;
  static quantized = null;
  static instance = null;

  constructor(tokenizer, model, quantized) {
    this.tokenizer = tokenizer;
    this.model = model;
    this.quantized = quantized;
  }

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, {
        quantized: this.quantized,
        progress_callback,
        revision: this.model.includes("/whisper-medium")
          ? "no_attentions"
          : "main",
      });
    }

    return this.instance;
  }
}

class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
  static task = "automatic-speech-recognition";
  static model = null;
  static quantized = null;
}

export const transcribe = async (audio, config) => {
  const { model, multilingual, quantized, subtask, language } = config;
  const isDistilWhisper = model.startsWith("distil-whisper/");

  let modelName = model;
  if (!isDistilWhisper && !multilingual) {
    modelName += ".en";
  }

  const p = AutomaticSpeechRecognitionPipelineFactory;
  if (p.model !== modelName || p.quantized !== quantized) {
    // Invalidate model if different
    p.model = modelName;
    p.quantized = quantized;

    if (p.instance !== null) {
      (await p.getInstance()).dispose();
      p.instance = null;
    }
  }

  // Load transcriber model
  let transcriber = await p.getInstance((data) => {
    // self.postMessage(data);
    console.log(" % ", data);
  });

  const time_precision =
    transcriber.processor.feature_extractor.config.chunk_length /
    transcriber.model.config.max_source_positions;

  // Storage for chunks to be processed. Initialise with an empty chunk.
  let chunks_to_process = [
    {
      tokens: [],
      finalised: false,
    },
  ];

  const chunk_callback = (chunk) => {
    let last = chunks_to_process[chunks_to_process.length - 1];

    // chunk // console.log(chunk);
    // Overwrite last chunk with new info
    Object.assign(last, chunk);
    last.finalised = true;

    // Create an empty chunk after, if it not the last chunk
    if (!chunk.is_last) {
      chunks_to_process.push({
        tokens: [],
        finalised: false,
      });
    }
  };

  // Inject custom callback function to handle merging of chunks
  const callback_function = (item) => {
    let last = chunks_to_process[chunks_to_process.length - 1];

    // Update tokens of last chunk
    last.tokens = [...item[0].output_token_ids];

    // Merge text chunks
    // TODO optimise so we don't have to decode all chunks every time
    let data = transcriber.tokenizer._decode_asr(chunks_to_process, {
      time_precision: time_precision,
      return_timestamps: true,
      force_full_sequences: false,
    });

    // partials -
    // console.log("UPDATE", data);
  };

  // Actually run transcription
  let output = await transcriber(audio, {
    // Greedy
    top_k: 0,
    do_sample: false,

    // Sliding window

    chunk_length_s: isDistilWhisper ? 20 : 30,
    stride_length_s: isDistilWhisper ? 3 : 5,

    // Language and task
    language: language,
    task: subtask,

    // Return timestamps
    return_timestamps: true,
    force_full_sequences: false,

    // Callback functions
    callback_function: callback_function, // after each generation step
    chunk_callback: chunk_callback, // after each chunk is processed
  }).catch((error) => {
    // self.postMessage({
    //   status: "error",
    //   task: "automatic-speech-recognition",
    //   data: error,
    // });
    console.log(error);
    return error.message;
  });

  return output;
};

// self.addEventListener("message", async (event) => {
//     const message = event.data;
//     // Do some work...
//     // TODO use message data
//     let transcript = await transcribe(
//         message.audio,
//         message.model,
//         message.multilingual,
//         message.quantized,
//         message.subtask,
//         message.language,
//     );
//     if (transcript === null) return;
//     // Send the result back to the main thread
//     self.postMessage({
//         status: "complete",
//         task: "automatic-speech-recognition",
//         data: transcript,
//     });
// });
