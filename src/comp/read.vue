<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { voiceRequest } from "./eleven";
import { cachedRef } from "../lib/hooks";

const props = defineProps(["apikey"]);

const input = ref("");

type Blobx = {
  text: string;
  //   blob: Blob;
  uri: string;
};
const blobs = cachedRef<Blobx[]>("eleven", []);

const submit = async () => {
  const text = input.value;
  const resp = await voiceRequest(text, props.apikey);
  if (!resp) return;
  const blob = await resp.blob();
  const uri = window.URL.createObjectURL(blob);

  blobs.value.push({
    text,
    uri,
  });
};

watchEffect(() => {});
//
</script>
<template>
  <h2>Read</h2>

  <section>
    <textarea
      rows="5"
      v-model="input"
      class="bg-black text-white w-full max-w-[600px]"
    ></textarea>
    <form @submit.prevent="submit">
      <button>Submit</button>
    </form>
  </section>

  <section class="flex flex-col-reverse">
    <div v-for="blob in blobs">
      <p>{{ blob.text }}</p>
      <audio :src="blob.uri" controls></audio>
    </div>
  </section>
</template>

<style>
body,
textarea {
  background: black;
  color: white;
}
</style>
