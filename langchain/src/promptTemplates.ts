import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  StringOutputParser,
  CommaSeparatedListOutputParser,
} from "@langchain/core/output_parsers";
import { StructuredOutputParser } from "langchain/output_parsers";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.8,
  maxTokens: 700,
});

async function stringParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Write a short description for the following product: {product_name}"
  );

  const parser = new StringOutputParser();
  // Connecting a Chain
  const chain = prompt.pipe(model).pipe(parser);

  const response = await chain.invoke({
    product_name: "bicicle",
  });

  console.log(response);
}
async function commaSeparatedParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Provide the ingredients , separated by commas, for: {meal}"
  );

  const parser = new CommaSeparatedListOutputParser();
  // Connecting a Chain
  const chain = prompt.pipe(model).pipe(parser);

  const response = await chain.invoke({
    meal: "ramen",
  });

  console.log(response);
}

async function fromMessage() {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Write a short description of the product provided by the user"],
    ["human", "{product_name}"],
  ]);

  const chain = prompt.pipe(model);

  const response = await chain.invoke({
    product_name: "bicicle",
  });

  console.log(response.content);
}

async function structuredParser() {
  const templatePrompt = ChatPromptTemplate.fromTemplate(`
   Extract information from the following frase.
   Formatting instructions: {formatting_instructions}
   Phrase: {phrase}`);

  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    name: "the name of the person",
    likes: "the things the person likes",
  });

  const chain = templatePrompt.pipe(model).pipe(outputParser);

  const result = await chain.invoke({
    formatting_instructions: outputParser.getFormatInstructions(),
    phrase: "John likes pineapple pizza",
  });

  console.log(result);
}

structuredParser();
