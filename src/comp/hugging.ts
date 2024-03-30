const base = "https://api-inference.huggingface.co/models/";

export const chatCompletion = (inputs: string, token: string) => {
  const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";

  return fetch(base + model, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      inputs: inputs,
      options: {
        dont_load_model: false,
        use_cache: true,
        wait_for_model: false,
      },
      parameters: {
        max_new_tokens: 100,
        return_full_text: false,
        temperature: 0.5,
      },
    }),
  })
    .then((res) => (res.ok ? res.json() : res.text()))
    .then((res) =>
      typeof res === "string" ? { error: res } : { data: res[0].generated_text }
    );
};

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
