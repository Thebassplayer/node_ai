import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
  maxTokens: 700,
});

const data = [
  "my name is Raul",
  "I am a little dog",
  "my favourite food is pizza",
  "my favourite food is meat",
];

const question = "What are my favourite foods?";

async function main() {
  // store the data
  const vectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
  await vectorStore.addDocuments(
    data.map(content => new Document({ pageContent: content }))
  );

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
