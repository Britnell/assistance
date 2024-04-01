<script setup lang="ts">
import { ref, defineProps } from "vue";
import { chatCompletion } from "./hugging";
import { chatRef } from "../lib/hooks";
import Convo from "./convo.vue";

const conv = chatRef();
const ip = ref("");

const props = defineProps(["huggingfacetoken"]);

const submit = async () => {
  const prompt = ip.value;
  if (!prompt) return;
  conv.value = [...conv.value, { instruction: prompt, response: "" }];
  ip.value = "";
  const resp = await chatCompletion(conv.value, props.huggingfacetoken);
  if (resp.error) return console.log(resp.error);
  conv.value[conv.value.length - 1].response = resp.data;
};
</script>

<template>
  <div class="max-w-[600px] mx-auto">
    <h1>Chat</h1>
    <main class="space-y-8 mt-8">
      <Convo :conv="conv" />
      <form @submit.prevent="submit">
        <div class="mt-6 flex gap-2">
          <input
            name="prompt"
            placeholder="Enter prompt"
            v-model="ip"
            class="grow py-1 px-2 rounded border border-black border-opacity-20 focus-visible:border-opacity-80"
            autofocus
          />
          <button class="bg-blue-100 rounded-lg py-1 px-3">Submit</button>
        </div>
      </form>
    </main>
  </div>
</template>
