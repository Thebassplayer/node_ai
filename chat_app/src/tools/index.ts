import OpenAI from "openai";

const openai = new OpenAI();

function getTime() {
  return new Date().toLocaleTimeString();
}

function getOrderStatus(orderId: string) {
  console.log(`The order ${orderId} is still being processed`);

  const orderAsNumber = +orderId;

  if (orderAsNumber % 2 === 0) {
    return "IN_PROGRESS";
  }
  return "COMPLETED";
}

const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpfull assistant that gives me information about the time of the day and order status",
  },
  {
    role: "user",
    content: "What is the status of order 1234?",
  },
];

async function callOpenAiWithTools() {
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
      {
        type: "function",
        function: {
          name: "getOrderStatus",
          description: "Return the status of an order",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "The id of the order to get the status of",
              },
            },
            required: ["orderId"],
          },
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

    if (toolName === "getOrderStatus") {
      const rawArgument = toolCall.function.arguments;
      const parsedArguments = JSON.parse(rawArgument);
      const currentTime = getOrderStatus(parsedArguments.orderId);
      context.push(response.choices[0].message);
      context.push({
        role: "tool",
        content: currentTime,
        tool_call_id: toolCall.id,
      });
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

  await callOpenAiWithTools();
});
