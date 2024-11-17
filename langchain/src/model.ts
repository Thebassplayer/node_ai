import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
  maxTokens: 700,
  // verbose: true,
});

async function main() {
  // const response1 = await model.invoke(
  //   "What is the capital of the United States?"
  // );

  // console.log(response1.content);

  // const response2 = await model.batch([
  //   "Hi There",
  //   "What is the capital of the United States?",
  // ]);

  // console.log(response2.map(r => r.content));

  const response3 = await model.stream(
    "How many years did the beatles play together?"
  );
  for await (const response of response3) {
    console.log(response.content);
  }
}

main();
