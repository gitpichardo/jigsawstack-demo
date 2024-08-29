import { NextResponse } from 'next/server';

interface Input {
  key: string;
  value?: string;
}

interface RequestBody {
  query: string;
  inputs: Input[];
  return_prompt: { result: string };
}

export async function POST(request: Request) {
  try {
    const { query, inputs, return_prompt }: RequestBody = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log('Received request:', { query, inputs, return_prompt });

    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    const createRequestBody = {
      prompt: query,
      inputs: inputs.map((input: Input) => ({ 
        key: input.key, 
        optional: false,
        value: input.value
      })),
      return_prompt
    };

    console.log('Sending create request to JigsawStack:', createRequestBody);

    // Step 1: Create the prompt engine
    const createResponse = await fetch("https://api.jigsawstack.com/v1/prompt_engine", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(createRequestBody),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Error from JigsawStack API:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const createResult = await createResponse.json();
    console.log('JigsawStack API create response:', createResult);

    if (createResult.success && createResult.prompt_engine_id) {
      // Step 2: Run the prompt
      const runRequestBody = {
        input_values: inputs.reduce((acc: Record<string, string>, input: Input) => {
          if (input.value !== undefined) {
            acc[input.key] = input.value;
          }
          return acc;
        }, {})
      };

      console.log('Sending run request to JigsawStack:', runRequestBody);

      const runResponse = await fetch(`https://api.jigsawstack.com/v1/prompt_engine/${createResult.prompt_engine_id}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(runRequestBody),
      });

      console.log('Run response status:', runResponse.status);

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        console.error('Error running prompt:', runResponse.status, errorText);
        throw new Error(`Failed to run prompt: ${runResponse.status} ${errorText}`);
      }

      const runResult = await runResponse.json();
      console.log('Run result:', runResult);

      return NextResponse.json({ result: runResult.result });
    } else {
      throw new Error('Failed to create prompt engine');
    }
  } catch (error) {
    console.error('Error in create-and-run:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing the prompt',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}