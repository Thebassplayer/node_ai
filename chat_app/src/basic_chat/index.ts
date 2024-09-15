import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";

const openai = new OpenAI();
const encoder = encoding_for_model("gpt-4o-mini");

const MAX_TOKENS = 16000;

function getTime() {
  return new Date().toLocaleTimeString();
}

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: "You are an expert in Spain travel",
  },
];

async function createChatCompletion() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: context,
    tools: [
      {
        type: "function",
        function: {
          name: "getTime",
          description: "Get the current time",
        },
      },
    ],
    tool_choice: "auto",
  });

  const willInvokeFunction = response.choices[0].finish_reason == "tool_calls";
  const toolCall = response.choices[0].message.tool_calls![0];

  if (willInvokeFunction) {
    const toolName = toolCall.function.name;

    if (toolName === "getTime") {
      const currentTime = getTime();
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: currentTime,
        tool_call_id: toolCall.id,
      });
      console.log(`assistant: The current time is ${currentTime}`);
      return;
    }
  }

  const responseRole = response.choices[0].message.role;
  const responseMessage = response.choices[0].message.content;

  context.push({
    role: "assistant",
    content: responseMessage,
  });

  if (
    response.usage?.total_tokens &&
    response.usage?.total_tokens < MAX_TOKENS
  ) {
    deleteOlderMessages();
  }

  console.log(`${responseRole}: ${responseMessage}`);
}

process.stdin.addListener("data", async function (input) {
  const userInput = input.toString().trim();

  context.push({
    role: "user",
    content: userInput,
  });

  await createChatCompletion();
});

function deleteOlderMessages() {
  let contestLength = getContextLength();
  while (contestLength > MAX_TOKENS) {
    for (let i = 0; i < context.length; i++) {
      const message = context[i];
      if (message.role !== "system") {
        context.splice(i, 1);
        contestLength = getContextLength();
        console.log("New context length: " + contestLength);
        break;
      }
    }
  }
}

function getContextLength() {
  let length = 0;

  context.forEach(message => {
    if (typeof message.content === "string") {
      length += encoder.encode(message.content).length;
    } else if (Array.isArray(message.content)) {
      message.content.forEach(content => {
        if (content.type === "text") {
          length += encoder.encode(content.text).length;
        }
      });
    }
  });
  return length;
}
