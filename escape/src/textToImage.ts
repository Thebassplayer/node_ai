import { HfInference } from "@huggingface/inference";
import { existsSync, mkdirSync, writeFile } from "fs";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

const inference = new HfInference(process.env.HF_API_KEY);

let counter = 0; // Initialize a counter variable

// Emulate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function textToImage(prompt: string) {
  const imagesDir = path.resolve(__dirname, "images"); // Get the absolute path for the folder

  // Ensure the 'images' folder exists
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir); // Create the directory if it doesn't exist
  }

  const result = await inference.textToImage({
    inputs: prompt,
    model: "stabilityai/stable-diffusion-2",
    parameters: {
      negative_prompt: "blurry",
    },
  });

  const buffer = Buffer.from(await result.arrayBuffer());

  // Generate a unique file name
  let fileName;
  do {
    fileName = path.join(imagesDir, `image_${counter}.png`); // Use the absolute path
    counter++;
  } while (existsSync(fileName)); // Check if the file already exists

  // Save the image file
  writeFile(fileName, buffer, err => {
    if (err) {
      console.error("Failed to save the image:", err);
    } else {
      console.log(`Image saved as ${fileName}`);
    }
  });
}

(function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the text to convert to an image: ", async text => {
    await textToImage(text);
    rl.close();
  });
})();
