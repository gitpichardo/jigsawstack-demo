import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '30';

    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    const url = new URL(`https://api.jigsawstack.com/v1/prompt_engine?page=${page}&limit=${limit}`);

    console.log('Fetching prompts from JigsawStack API:', url.toString());
    console.log('Headers:', JSON.stringify(Object.fromEntries(headers), null, 2));

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