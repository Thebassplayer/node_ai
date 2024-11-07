import { ChromaClient, OpenAIEmbeddingFunction } from "chromadb";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Please set OPENAI_API_KEY environment variable");
}

const client = new ChromaClient({
  path: "http://localhost:8000",
});

const collectionName = "data-test5";

const embeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY,
});

async function main() {
  const collection = await client.createCollection({
    name: collectionName,
    embeddingFunction,
  });
  console.log(" - collection: ", collection);
}

async function addData() {
  const collection = await client.getCollection({
    name: collectionName,
    embeddingFunction,
  });

  const results = await collection.add({
    ids: ["id1"],
    documents: ["This is my entry"],
  });

  console.log(" - results: ", results);
}

main();
addData();
