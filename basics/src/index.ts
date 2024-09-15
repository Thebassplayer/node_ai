import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: "Eres un experto en viajes",
    },
    {
      role: "user",
      content:
        "cuentame sobre actividades en la naturaleza impedibles alrededor de la ciudad de granada, españa",
    },
  ],
  max_tokens: 150,
  n: 1,
});

console.log(completion.choices[0].message.content);
