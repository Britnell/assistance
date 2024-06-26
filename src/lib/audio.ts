// import type { BufferState, SampleT, SamplesT } from "./hooks";
// import { readFile } from "./lib";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export const audioContext = new (window.AudioContext ||
  window.webkitAudioContext)();

export let passFilter: BiquadFilterNode;

export const clearPassFilter = () => setPassFilter("highpass", 0);

export const setPassFilter = (type: "highpass" | "lowpass", f: number) => {
  passFilter = audioContext.createBiquadFilter();
  passFilter.type = type;
  passFilter.frequency.value = f;
};

//  DELAY

let delayNode = audioContext.createDelay();
delayNode.delayTime.value = 0.5;
let feedbackGain = audioContext.createGain();
feedbackGain.gain.value = 0.5;
let dryGain = audioContext.createGain();
dryGain.gain.value = 0.5;
let wetGain = audioContext.createGain();
wetGain.gain.value = 0.5;

let delayEnable = false;

export const setDelay = ({
  time,
  feedback,
  dry,
  wet,
}: {
  time: number;
  feedback: number;
  dry: number;
  wet: number;
}) => {
  delayNode.delayTime.value = time;
  feedbackGain.gain.value = feedback;
  dryGain.gain.value = dry;
  wetGain.gain.value = wet;

  //
};

export const enableDelay = (st: boolean) => (delayEnable = st);

const connectDelay = (source: AudioNode) => {
  source.connect(delayNode);
  delayNode.connect(wetGain);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  source.connect(dryGain);
  dryGain.connect(audioContext.destination);
  wetGain.connect(audioContext.destination);
};

const outputFilteredSource = (source: AudioBufferSourceNode) => {
  source.connect(passFilter);
  if (!delayEnable) passFilter.connect(audioContext.destination);
  else connectDelay(source);
};

export const loadAudioSource = (buffer: AudioBuffer | void, speed: number) => {
  if (!buffer) return null;
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = speed;
  outputFilteredSource(source);
  return source;
};

export const loadUriBuffer = async (uri: string) => {
  const blob = await fetch(uri)
    .then((res) => res.blob())
    .catch((_) => null);
  if (!blob) return {};
  const audioBuffer = await loadBlobBuffer(blob);
  return { blob, audioBuffer };
};

export const loadFileBuffer = async (file: File) => {
  const arrayBuffer = await readFile(file);
  if (!arrayBuffer) return;
  const buffer = await loadArrayBuffer(arrayBuffer);
  return buffer;
};

export const loadBlobBuffer = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = await loadArrayBuffer(arrayBuffer);
  return buffer;
};

export const loadArrayBuffer = async (arrayBuffer: ArrayBuffer) => {
  const buffer = await audioContext
    .decodeAudioData(arrayBuffer)
    .catch((_) => null);
  return buffer;
};

export const beep = (dur: number, f?: number) => {
  const beeper = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  beeper.type = "square";
  beeper.frequency.value = f ?? 440;
  gainNode.gain.value = 0.1;
  beeper.connect(gainNode);
  gainNode.connect(audioContext.destination);
  //
  beeper.start();
  setTimeout(() => beeper.stop(), dur);
};

type Source = { [id: string]: AudioBufferSourceNode | null };

const sources: Source = {};

export const readFile = async (file: File): Promise<ArrayBuffer | null> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const arrayBuffer = ev.target?.result as ArrayBuffer;
      res(arrayBuffer);
    };
    reader.onerror = () => {
      rej();
    };
    reader.readAsArrayBuffer(file);
  });
};

export const playBlob = (blob: Blob) => {
  // const blob = new Blob([file], { type: "audio/webm" });
  const uri = window.URL.createObjectURL(blob);
  const audio = new Audio(uri);
  audio.play();
};
