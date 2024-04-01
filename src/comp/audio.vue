<script setup lang="ts">
import { ref, watchEffect, defineProps, defineEmits } from "vue";
import { useRecorder, type RecordState } from "./record";
import { playBlob } from "../lib/audio";
import { whisperReq } from "./hugging";

const props = defineProps(["huggingfacetoken"]);
const emit = defineEmits(["prompt"]);

const rec = ref<RecordState>("idle");
const { data } = useRecorder(rec);
const transcribing = ref(false);

watchEffect(async () => {
  const file = data.value;
  if (!file) return;
  data.value = null;
  if (rec.value === "cancel") return;

  // playBlob(file);
  transcribing.value = true;
  const resp = await whisperReq(file, props.huggingfacetoken).then((res) =>
    res.ok ? res.json() : res.text()
  );
  transcribing.value = false;

  if (resp?.text) {
    emit("prompt", resp?.text);
  }
  //
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
  <div class="x">
    <div class="flex gap-2">
      <p class="w-[80px]">
        {{ label[rec] ?? rec }} , {{ transcribing ? "transcribing" : " " }}
      </p>
      <button class="bg-gray-100 px-2 py-1" @click="setRec('start')">
        start
      </button>
      <button class="bg-gray-100 px-2 py-1" @click="setRec('finish')">
        finish
      </button>
      <button class="ml-6" @click="setRec('cancel')">cancel</button>
    </div>
  </div>
</template>
