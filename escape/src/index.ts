import { HfInference } from "@huggingface/inference";
import { writeFile, existsSync } from "fs";

const inference = new HfInference(process.env.HF_API_KEY);

async function embed() {
  const output = await inference.featureExtraction({
    inputs: "My Embeddings",
    model: "BAAI/bge-large-en-v1.5",
  });

  console.log(output);
}

async function translate() {
  const result = await inference.translation({
    inputs: "My name is John",
    model: "facebook/nllb-200-distilled-600M",
    //@ts-ignore
    parameters: {
      src_lang: "eng_Latn",
      tgt_lang: "spa_Latn",
    },
  });

  console.log(result);
}

async function answerQuestion() {
  const result = await inference.questionAnswering({
    inputs: {
      question: "Is cheese in France good?",
      context: "The capital of France is Paris.",
    },
  });

  console.log(result);
}

async function textToImage(prompt: string) {
  const result = await inference.textToImage({
    inputs: prompt,
    model: "stabilityai/stable-diffusion-2",
    parameters: {
      negative_prompt: "blury",
    },
  });

  const buffer = Buffer.from(await result.arrayBuffer());
  createFile(buffer, "images");
}

async function createFile(buffer: Buffer, folder: string) {
  let counter = 1;
  let fileName;
  do {
    fileName = `./${folder}/image_${counter}.png`;
    counter++;
  } while (existsSync(fileName)); // Check if the file already exists

  // Save the image file
  writeFile(fileName, buffer, () => console.log(`Image saved as ${fileName}`));
}

const prompt = "A beautiful sunset over the city";

textToImage(prompt).catch(console.error);
