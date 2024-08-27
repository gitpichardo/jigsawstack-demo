import { NextResponse } from 'next/server';

// API route for AI-powered web scraping
export async function POST(request: Request) {
  try {
    const { url, element_prompts } = await request.json();

     // Validate input
    if (!url) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    if (!element_prompts || !Array.isArray(element_prompts) || element_prompts.length === 0) {
      return NextResponse.json({ error: 'At least one element prompt is required.' }, { status: 400 });
    }

    // Set up headers for JigsawStack API request
    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    // Make request to JigsawStack API
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ url, element_prompts }),
    };
    
    const apiUrl = new URL("https://api.jigsawstack.com/v1/ai/scrape");
    
    const response = await fetch(apiUrl, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in AI scrape:', error);
    return NextResponse.json({ 
      error: 'An error occurred while scraping',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}