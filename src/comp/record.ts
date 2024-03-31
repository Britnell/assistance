import { onMounted, ref, watchEffect, type Ref, watch } from "vue";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export type RecordState = "idle" | "start" | "stop" | "finish";

export const useRecorder = (rec: Ref<RecordState>) => {
  const data = ref<File | null>(null);

  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let state = "";

  const createRecorder = async () => {
    const stream = await navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: false,
      })
      .catch((err) => console.log(err));
    if (!stream) return;

    recorder = new MediaRecorder(stream, {});

    recorder.ondataavailable = ({ data }) => {
      chunks.push(data);
    };

    recorder.onstop = () => {
      //   const blob = new Blob(chunks, { type: "audio/webm" });

      const file = new File(chunks, "rec", { type: chunks[0].type });
      console.log(file.type);
      data.value = file;
      chunks = [];
    };
  };

  onMounted(() => createRecorder());

  watch(rec, (val, prev) => {
    console.log({ val });

    if (prev !== "stop") {
      if (val === "start") recorder?.start();
      return;
    }

    if (val === "start") recorder?.resume();
    if (val === "stop") recorder?.pause();
    if (val === "finish") recorder?.stop();
  });

  return { data };
};

export const getRecorder = (): Promise<MediaRecorder> =>
  new Promise((res, rej) => {});

// export const startRecorder = async () => {
//   console.log(recorder);
// };
