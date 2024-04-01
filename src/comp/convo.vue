<script setup lang="ts">
import { defineProps } from "vue";

const { conv } = defineProps(["conv"]);
</script>

<template>
  <div v-for="chat in conv" class="flex flex-col gap-3">
    <p class="inline-block py-1 px-3 rounded-lg bg-blue-100 self-start">
      {{ chat.instruction }}
    </p>
    <p
      v-if="chat.response"
      class="inline-block py-1 px-3 rounded-lg bg-gray-100 self-end"
      v-html="chat.response"
    ></p>
  </div>
  <p
    v-if="conv.length === 0"
    class="inline-block py-1 px-3 rounded-lg bg-gray-100 self-center opacity-60"
  >
    Empty Chat
  </p>
</template>
