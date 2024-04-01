import { onMounted, ref, watchEffect, type Ref, watch } from "vue";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export type RecordState = "idle" | "start" | "stop" | "finish" | "cancel";

const getMimeType = () => {
  const types = [
    "audio/webm",
    "audio/mp4",
    "audio/ogg",
    "audio/wav",
    "audio/aac",
  ];
  for (let i = 0; i < types.length; i++) {
    if (MediaRecorder.isTypeSupported(types[i])) {
      return types[i];
    }
  }
  return undefined;
};

export const useRecorder = (rec: Ref<RecordState>) => {
  const data = ref<Blob | null>(null);

  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  let mimeType = getMimeType();

  const createRecorder = async () => {
    const stream = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .catch((err) => console.log(err));
    if (!stream) return;

    mimeType = getMimeType();

    recorder = new MediaRecorder(stream, {
      mimeType,
    });

    recorder.ondataavailable = ({ data }) => {
      chunks.push(data);
    };

    recorder.onstop = () => {
      //   const blob = new Blob(chunks, { type: "audio/webm" });
      data.value = new Blob(chunks, { type: mimeType });
      chunks = [];
    };
  };

  onMounted(() => createRecorder());

  watch(rec, (val, prev) => {
    if (val === "start") recorder?.start();
    // if (prev !== "stop") {
    //   return;
    // }

    // if (val === "start") recorder?.resume();
    if (val === "stop") recorder?.pause();
    if (val === "finish") recorder?.stop();
    if (val === "cancel") recorder?.stop();
  });

  return { data };
};

export const getRecorder = (): Promise<MediaRecorder> =>
  new Promise((res, rej) => {});

// export const startRecorder = async () => {
//   console.log(recorder);
// };
