import OpenAI from "openai";
const openai = new OpenAI();

process.stdin.addListener("data", async function (input) {
  const userInput = input.toString().trim();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert in Spain travel",
      },
      {
        role: "user",
        content: userInput,
      },
    ],
    max_tokens: 150,
    n: 1,
  });
  console.log(response.choices[0].message.content, "\n");
});
