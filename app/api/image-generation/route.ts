import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// API route for AI image generation
export async function POST(request: NextRequest) {
  try {
    const { prompt, model, size } = await request.json();
    
    // Set up headers for JigsawStack API request
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.JIGSAWSTACK_API_KEY || ''
    };

    // Prepare request body
    const requestBody = {
      prompt,
      model: model || 'sdxl',
      size: size || 'medium'
    };

    const url = "https://api.jigsawstack.com/v1/ai/image_generation";
    
    console.log('Sending request to JigsawStack API:', url);
    console.log('Request body:', JSON.stringify(requestBody));

     // Make request to JigsawStack API
    const response = await axios.post(url, requestBody, { headers, responseType: 'arraybuffer' });
    
    console.log('Response status:', response.status);

    // Return the image data
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error in image generation:', error);
    // Handle and return errors
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ 
        error: 'Error calling JigsawStack API',
        message: error.response?.data ? error.response.data.toString() : error.message,
        status: error.response?.status || 500
      }, { status: error.response?.status || 500 });
    } else {
      return NextResponse.json({ 
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500
      }, { status: 500 });
    }
  }
}
