import OpenAI from "openai";

const openai = new OpenAI();

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

  const secondResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: context,
  });

  console.log(secondResponse.choices[0].message.content);
}

process.stdin.addListener("data", async function (input) {
  const userInput = input.toString().trim();

  context.push({
    role: "user",
    content: userInput,
  });

  await createChatCompletion();
});
