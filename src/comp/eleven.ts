/*
    https://elevenlabs.io/docs/api-reference/getting-started

*/

const voiceid = "VuJ05kimyrfnJmOxLh2k";

export const voiceRequest = (text: string, apikey: string) =>
  fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceid}` +
      "?optimize_streaming_latency=3" +
      "&output_format=mp3_22050_32",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "xi-api-key": apikey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  )
    // .then((res) => res.text())
    // .then((res) => (res.ok ? res.json() : res.text()))
    .catch(console.log);
