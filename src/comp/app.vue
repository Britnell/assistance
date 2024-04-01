<script setup lang="ts">
import { ref, defineProps } from "vue";
import { chatCompletion } from "./hugging";
import { chatRef, configRef } from "../lib/hooks";
import Convo from "./convo.vue";
import AudioRec from "./audio.vue";

const conv = chatRef();
const config = configRef();
const ip = ref("");

const props = defineProps(["huggingfacetoken"]);

const answerPrompt = async (prompt: string) => {
  if (!prompt) return;

  conv.value = [...conv.value, { instruction: prompt, response: "" }];
  ip.value = "";
  const resp = await chatCompletion(conv.value, {
    token: props.huggingfacetoken,
    max_new_tokens: config.value.length,
  });
  if (resp.error) return console.log(resp.error);
  conv.value[conv.value.length - 1].response = resp.data;
};

const clear = () => (conv.value = []);

//
</script>

<template>
  <div class="max-w-page mx-auto">
    <header class="h-10 flex items-center">
      <h1>Chat</h1>
      <button @click="clear" class="ml-auto px-2 text-sm">fresh chat</button>
    </header>
    <main class="h-[calc(100svh-2.5rem)] pt-8 grid grid-rows-[1fr_200px]">
      <div class="overflow-y-auto px-2 flex flex-col gap-6">
        <Convo :conv="conv" />
      </div>
      <div class="flex gap-8 pt-8">
        <div class="x">
          <select v-model="config.length" class=" ">
            <option value="50">short</option>
            <option value="100">medium</option>
            <option value="250">long</option>
          </select>
          <div>
            <!-- <label for=""> play audio
              <input type="checkbox"  />
            </label> -->
          </div>
        </div>
        <div class="grow">
          <form
            @submit.prevent="() => answerPrompt(ip)"
            v-if="config.input === 'text'"
          >
            <div class="w-full flex gap-2 items-start">
              <textarea
                name="prompt"
                placeholder="Enter prompt"
                v-model="ip"
                rows="3"
                class="grow py-1 px-2 rounded border border-black border-opacity-20 focus-visible:border-opacity-80"
                autofocus
                x-keypress="shiftenter"
              ></textarea>
              <button class="bg-blue-100">Submit</button>
            </div>
          </form>
          <div v-else>
            <AudioRec
              :huggingfacetoken="huggingfacetoken"
              @prompt="answerPrompt"
            />
          </div>
        </div>
        <div class="x">
          <button
            v-if="config.input === 'text'"
            @click="() => (config.input = 'audio')"
          >
            audio
          </button>
          <button v-else @click="() => (config.input = 'text')">text</button>
        </div>
      </div>
    </main>
  </div>
</template>
