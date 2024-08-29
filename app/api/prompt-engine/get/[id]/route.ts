import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    const requestOptions = {
      method: "GET",
      headers: headers,
    };

    const url = new URL(`https://api.jigsawstack.com/v1/prompt_engine/${id}`);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    return new NextResponse(result, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error getting prompt:', error);
    return NextResponse.json({ error: 'An error occurred while getting the prompt' }, { status: 500 });
  }
}