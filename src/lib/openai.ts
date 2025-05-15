import OpenAI from "openai";

// Only create the client on the server side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export { openai };
