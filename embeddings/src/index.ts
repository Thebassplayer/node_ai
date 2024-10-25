import { readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export type DataWithEmbedding = {
  data: string;
  embedding: number[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI();

export async function generateEmbeddings(input: string | string[]) {
  const response = await openai.embeddings.create({
    input,
    model: "text-embedding-3-small",
  });
  return response;
}

export function loadJSONdata<T>(fileName: string): T {
  const path = join(__dirname, fileName);
  const rawData = readFileSync(path);
  return JSON.parse(rawData.toString());
}

function saveDataToJsonFile(data: unknown, fileName: string) {
  const dataString = JSON.stringify(data);
  const dataBuffer = Buffer.from(dataString);
  const path = join(__dirname, fileName);
  writeFileSync(path, dataBuffer);
  console.log(`Data saved to ${fileName}`);
}

async function main() {
  const data = loadJSONdata<string[]>("data.json");
  const embeddings = await generateEmbeddings(data);
  let dataWithEmbeddings: DataWithEmbedding[] | [];
  if (embeddings.data) {
    dataWithEmbeddings = data.map((d, i) => ({
      data: d,
      embedding: embeddings.data[i].embedding,
    }));
  } else {
    dataWithEmbeddings = [];
  }
  saveDataToJsonFile(dataWithEmbeddings, "dataWithEmbeddings.json");
}

// main();

function dotProduct(v1: number[], v2: number[]): number {
  return v1.reduce((acc, val, i) => acc + val * v2[i], 0);
}

function cosineSimilarity(v1: number[], v2: number[]): number {
  const product = dotProduct(v1, v2);
  const mag1 = Math.sqrt(dotProduct(v1, v1));
  const mag2 = Math.sqrt(dotProduct(v2, v2));
  return product / (mag1 * mag2);
}

export async function getSimilarity() {
  const dataWithEmbeddings = loadJSONdata<DataWithEmbedding[]>(
    "dataWithEmbeddings.json"
  );
  const input = "animal";

  const inputEmbedding = await generateEmbeddings(input);

  const similarities: {
    input: string;
    similarity: number;
  }[] = [];

  for (const entry of dataWithEmbeddings) {
    const similarity = dotProduct(
      entry.embedding,
      inputEmbedding.data[0].embedding
    );
    similarities.push({ input: entry.data, similarity });
  }

  console.log(`Similarity of ${input} with:`);
  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );
  sortedSimilarities.forEach(entry => {
    console.log(`${entry.input}: ${entry.similarity}`);
  });
}

getSimilarity();
