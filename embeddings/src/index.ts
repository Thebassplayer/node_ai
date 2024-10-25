import OpenAI from "openai";

const openai = new OpenAI();

async function generateEmbedding(input: string | string[]) {
  const response = await openai.embeddings.create({
    input,
    model: "text-embedding-3-small",
  });
  console.log(response.data[0]);
  return response;
}
generateEmbedding("cat");
