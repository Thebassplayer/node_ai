import { pipeline } from "@xenova/transformers";

async function embedder() {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  const result = await embedder("My Embeddings", {
    pooling: "mean",
    normalize: true,
  });

  console.log(result);
}

async function generateText() {
  const generator = await pipeline(
    "text2text-generation",
    "Xenova/LaMini-Flan-T5-783M"
  );

  const result = await generator("Give me a list of good productivity books ", {
    max_new_tokens: 200,
    temperature: 0.7,
    repetition_penalty: 2.0,
  });

  console.log(result);
}

generateText();
