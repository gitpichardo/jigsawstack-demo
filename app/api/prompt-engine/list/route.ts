import { NextResponse } from 'next/server';

// API route for listing prompts from the JigsawStack Prompt Engine
export async function GET(request: Request) {
  try {
    // Extract pagination parameters from the request URL
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '30';

    // Set up headers for JigsawStack API request
    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    // Construct URL with pagination parameters
    const url = new URL(`https://api.jigsawstack.com/v1/prompt_engine?page=${page}&limit=${limit}`);

    console.log('Fetching prompts from JigsawStack API:', url.toString());
    console.log('Headers:', JSON.stringify(Object.fromEntries(headers), null, 2));

    // Send GET request to JigsawStack API
    const response = await fetch(url, requestOptions);

    console.log('JigsawStack API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('JigsawStack API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('JigsawStack API response:', JSON.stringify(result, null, 2));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing prompts:', error);
    return NextResponse.json({ error: 'An error occurred while listing prompts', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}