<script setup lang="ts">
import { ref, defineProps, watchEffect } from "vue";
import { useRecorder, type RecordState } from "./record";
import { loadArrayBuffer, playBlob } from "../lib/audio";
// import { loadArrayBuffer } from "../lib/audio";

const rec = ref<RecordState>("idle");

const { data } = useRecorder(rec);

watchEffect(async () => {
  const file = data.value;
  if (!file) return;

  // playBlob(file)
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await loadArrayBuffer(arrayBuffer);
  let audioData;

  if (!audioBuffer) return;
  audioData = audioBuffer.getChannelData(0);

  fetch("/api/whisper", {
    method: "POST",
    body: audioData,
  });
});

const setRec = (v: RecordState) => (rec.value = v);

const label: { [i: string]: string } = {
  idle: "ready",
  start: "recording",
  stop: "paused",
  finish: "decoding",
};
</script>

<template>
  <div class="max-w-[600px] mx-auto">
    <h1>whisper</h1>
    <main class="space-y-8 mt-8">
      <p>talk</p>
      <p>{{ label[rec] ?? rec }}</p>
      <div class="flex gap-2">
        <button
          class="bg-gray-100 px-2 py-1"
          @mousedown="setRec('start')"
          @mouseup="setRec('stop')"
        >
          start
        </button>
        <button class="bg-gray-100 px-2 py-1" @click="setRec('finish')">
          finish
        </button>
      </div>
    </main>
  </div>
</template>
