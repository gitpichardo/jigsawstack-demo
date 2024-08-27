import { NextResponse } from 'next/server';

// API route for creating a new prompt in the JigsawStack Prompt Engine
export async function POST(request: Request) {
  try {
    // Extract query, inputs, and return_prompt from the request body
    const { query, inputs, return_prompt } = await request.json();

    // Set up headers for JigsawStack API request
    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    // Prepare request options
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ 
        prompt: query, // Note: 'query' is sent as 'prompt' to match JigsawStack API expectations
        inputs,
        return_prompt
      }),
    };

    const url = new URL("https://api.jigsawstack.com/v1/prompt_engine");

    // Send request to JigsawStack API
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ 
      error: 'An error occurred while creating the prompt',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}