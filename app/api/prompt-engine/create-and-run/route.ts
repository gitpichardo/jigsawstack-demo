import { NextResponse } from 'next/server';

// API route for creating and running AI prompts
export async function POST(request: Request) {
  try {
    const { query, inputs } = await request.json();

    // Validate input
    if (!query) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Set up headers for JigsawStack API request
    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    // Create prompt
    const createResponse = await fetch("https://api.jigsawstack.com/v1/prompt_engine", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ prompt: query }), // Note: 'query' is sent as 'prompt'
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(JSON.stringify(errorData));
    }

    const createResult = await createResponse.json();
    const promptId = createResult.prompt_engine_id;

    // Run prompt
    const runResponse = await fetch(`https://api.jigsawstack.com/v1/prompt_engine/${promptId}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ input_values: inputs }),
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      throw new Error(JSON.stringify(errorData));
    }

    const runResult = await runResponse.json();
    return NextResponse.json(runResult);
  } catch (error) {
    console.error('Error creating and running prompt:', error);
    return NextResponse.json({ 
      error: 'An error occurred while creating and running the prompt',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}