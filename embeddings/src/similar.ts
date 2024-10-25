import { DataWithEmbedding, generateEmbeddings, loadJSONdata } from ".";

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
    const similarity = cosineSimilarity(
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
