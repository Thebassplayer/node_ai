import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
  maxTokens: 700,
});

const question = "Where Roy Lopez is living right now?";

async function main() {
  const loader = new CheerioWebBaseLoader("https://www.persistdev.blog/about");
  const docs = await loader.load();

  // split the docs
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 20,
  });

  const splitedDocs = await splitter.splitDocuments(docs);

  // store the data
  const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  await vectorStore.addDocuments(splitedDocs);

  // data retriever
  const retriever = vectorStore.asRetriever({
    k: 2,
  });

  // get relevant documents
  const relevantDocuments = await retriever.invoke(question);
  const resultDocs = relevantDocuments.map(doc => doc.pageContent);

  // buils template
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Answer the user question based on the following context: {context}",
    ],
    ["user", "{input}"],
  ]);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    input: question,
    context: resultDocs,
  });

  console.log(response.content);
}

main();
