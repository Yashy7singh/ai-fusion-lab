import axios from "axios";
import { NextResponse } from "next/server";
  
export async function POST(request) {
    try {
    const {model, msg, parentModel} = await request.json();
  /* Send POST request using Axios */
  const response = await axios.post(
    "https://kravixstudio.com/api/v1/chat",
    {
      message: msg, // Messages to AI
      aiModel: model,                     // Selected AI model
      outputType: "text"                         // 'text' or 'json'
    },
    {
      headers: {
        "Content-Type": "application/json",     // Tell server we're sending JSON
        "Authorization": "Bearer " + process.env.KRAVIXSTUDIO_API_KEY  // Replace with your API key
      }
    }
  );
  
  console.log(response.data); // Log API response
  return NextResponse.json({
    ...response.data,
    model: parentModel 
  })
}
  catch (error) {
        // --- 🔴 ERROR HANDLING CATCHES THE FAILURE ---
        
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error || `External API failed with status ${statusCode}`;
        
        console.error(`Error from ${error.config.url}:`, errorMessage); // The exact error details!

        // Returns the actual error code (e.g., 401, 429) to the client
        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}