import type { Chat } from "../lib/hooks";

const base = "https://api-inference.huggingface.co/models/";

const renderChat = (conv: Chat[]) => {
  return (
    "<s>" +
    conv
      .map(
        (chat) =>
          `[INST] ${chat.instruction} [/INST]${
            chat.response ? ` ${chat.response}</s>` : ""
          }`
      )
      .join("")
  );
};

export const chatCompletion = (
  conv: Chat[],
  config: {
    token: string;
    max_new_tokens?: string;
  }
) => {
  const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
  const { token, max_new_tokens } = config;
  const inputs = renderChat(conv);

  console.log({ max_new_tokens });

  return fetch(base + model, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      inputs: inputs,
      parameters: {
        return_full_text: false,
        temperature: 0.8,
        max_new_tokens: max_new_tokens ? parseInt(max_new_tokens) : 250,
        early_stopping: true,
      },
      options: {
        use_cache: true,
        wait_for_model: false,
        dont_load_model: false,
      },
    }),
  })
    .then((res) => (res.ok ? res.json() : res.text()))
    .then((res) =>
      typeof res === "string" ? { error: res } : { data: res[0].generated_text }
    );
};

export const instructRequest = (inputs: string, token: string) => {};

export const whisperReq = async (file: File, token: string) => {
  const model = "openai/whisper-large-v3";
  const buffer = await file.arrayBuffer();

  return fetch(base + model, {
    headers: {
      Authorization: `Bearer ${token}`,
      // "Content-Type": "application/json",
    },
    method: "POST",
    body: buffer,
  });
};
