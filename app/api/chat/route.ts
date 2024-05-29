import { createOpenAI } from '@ai-sdk/openai';
import { StreamingTextResponse, streamText, StreamData } from 'ai';

export async function POST(req: Request) {
  const { messages, provider } = await req.json();

  if (provider.provider !== 'openai') {
    throw new Error('Invalid provider');
  }

  const openai = createOpenAI({
    apiKey: provider.apiKey,
  })

  const result = await streamText({
    model: openai(provider.model),
    messages,
  });

  const data = new StreamData();

  // data.append({ test: 'value' });

  const stream = result.toAIStream({
    onFinal(_) {
      data.close();
    },
  });

  return new StreamingTextResponse(stream, {}, data);
}