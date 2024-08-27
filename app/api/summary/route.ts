import { NextResponse } from 'next/server';

// API route for text summarization
export async function POST(request: Request) {
  try {
    const { text, type = 'text' } = await request.json();

    // Validate input
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Set up headers for JigsawStack API request
    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    // Make request to JigsawStack API
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ text, type }),
    };

    const url = new URL("https://api.jigsawstack.com/v1/ai/summary");

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in summary:', error);
    return NextResponse.json({ 
      error: 'An error occurred while summarizing',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}