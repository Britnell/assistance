<script setup lang="ts">
import { ref, defineProps } from "vue";
import { hfreq } from "./hugging";

type Chat = {
  instruction: string;
  response: string;
};
const conv = ref<Chat[]>([]);
const ip = ref("");

const props = defineProps(["huggingfacetoken"]);

const renderChat = () => {
  return (
    "<s>" +
    conv.value
      .map((chat) => `[INST] ${chat.instruction} [/INST] ${chat.response}</s>`)
      .join("")
  );
};

const renderInstruct = (prompt: string) => `[INST] ${prompt} [/INST]`;

const submit = async () => {
  const prompt = ip.value;
  if (!prompt) return;
  ip.value = "";
  const inst = renderChat() + renderInstruct(prompt);
  const resp = await hfreq(inst, props.huggingfacetoken);
  if (resp.error) {
    console.log(resp.error);
    return;
  }
  conv.value = [...conv.value, { instruction: prompt, response: resp.data }];
  //   console.log({ prompt, inst }, resp.data);
};
</script>

<template>
  <div class="max-w-[600px] mx-auto">
    <h1>Chat</h1>
    <main class="space-y-8 mt-8">
      <div v-for="chat in conv" class="flex flex-col gap-3">
        <p class="inline-block py-1 px-3 rounded-lg bg-blue-100 self-start">
          {{ chat.instruction }}
        </p>
        <p
          class="inline-block py-1 px-3 rounded-lg bg-gray-100 self-end"
          v-html="chat.response"
        ></p>
      </div>
      <form @submit.prevent="submit">
        <div class="mt-6 flex gap-2">
          <input
            name="prompt"
            placeholder="Enter prompt"
            v-model="ip"
            class="grow py-1 px-2 rounded"
            autofocus
          />
          <button class=" ">Submit</button>
        </div>
      </form>
    </main>
  </div>
</template>
