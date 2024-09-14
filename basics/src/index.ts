import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: "which is the height of mont everest?",
    },
  ],
});

console.log(completion.choices[0].message);
