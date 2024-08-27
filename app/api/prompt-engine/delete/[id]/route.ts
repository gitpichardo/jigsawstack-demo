import { NextResponse } from 'next/server';

// API route for deleting a specific prompt from the JigsawStack Prompt Engine
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Set up headers for JigsawStack API request
    const headers = new Headers();
    headers.append("content-type", "application/json");
    headers.append("x-api-key", process.env.JIGSAWSTACK_API_KEY || '');

    const requestOptions = {
      method: "DELETE",
      headers: headers,
    };

    // Construct URL with the prompt ID
    const url = new URL(`https://api.jigsawstack.com/v1/prompt_engine/${params.id}`);

    // Send delete request to JigsawStack API
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    return new NextResponse(result, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the prompt' }, { status: 500 });
  }
}