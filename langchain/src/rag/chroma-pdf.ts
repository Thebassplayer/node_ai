import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
  maxTokens: 700,
});

const question = "Explain me a good breathing technique for weaking up early";

async function main() {
  const embeddings = new OpenAIEmbeddings();

  const collectionName = "breatheology_spanish";
  const url = "http://localhost:8000";

  // Initialize Chroma with the collection name and URL
  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName,
    url,
  });

  // Check if the collection already exists
  const collectionExists = await vectorStore.collectionExists();

  if (collectionExists) {
    console.log("Data already exists in the database. Using existing data.");
    // Retrieve existing documents from the database
    const existingDocs = await vectorStore.getDocuments();
    console.log(existingDocs);
  } else {
    console.log(
      "Data does not exist in the database. Loading, splitting, and storing data."
    );

    // Load the PDF
    const loader = new PDFLoader("breatheology_spanish.pdf", {
      parsedItemSeparator: "\n",
    });
    const docs = await loader.load();

    // Split the docs
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 20,
    });
    const splitedDocs = await splitter.splitDocuments(docs);

    // Store the data
    await vectorStore.addDocuments(splitedDocs);
    console.log("Data stored successfully.");
  }

  // Data retriever
  // Your data retrieval logic here
}

main().catch(console.error);
