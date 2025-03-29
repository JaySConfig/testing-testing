// app/api/generate-post/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';


// Helper functions - defined at the file scope
function getUserVoiceLabel(userVoice) {
    const voiceMap = {
      'professional': 'Professional & Insightful',
      'casual': 'Casual & Conversational',
      'authoritative': 'Authoritative & Bold',
      'storytelling': 'Storytelling & Relatable'
    };
    return voiceMap[userVoice] || userVoice;
  }
  
  function getPerspectiveLabel(uniquePerspective) {
    const perspectiveMap = {
      'analytical': 'Analytical (Breaks down complex ideas with logic & data)',
      'inspiring': 'Inspiring (Motivates with personal stories & big-picture thinking)',
      'challenging': 'Challenging (Questions norms & disrupts industry beliefs)',
      'informative': 'Informative (Provides structured knowledge through education & tutorials)'
    };
    return perspectiveMap[uniquePerspective] || uniquePerspective;
  }

export async function POST(request) {
  try {
    const { pillar, topic, approach, contentType, userVoice, uniquePerspective } = await request.json();
    
    console.log("Generating post for:", { pillar, topic, approach, contentType, userVoice, uniquePerspective });
    
    // Get API key
    const apiKey = process.env.GOOGLE_API;
    if (!apiKey) {
      console.error("API key is undefined or empty");
      return Response.json(
        { error: "API key configuration error" },
        { status: 500 }
      );
    }
    
    // Initialize the API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // get label texts for better context
    const voiceLabel = getUserVoiceLabel(userVoice);
    const perspectiveLabel = getPerspectiveLabel(uniquePerspective);
    
    // Format the prompt for post generation
    const prompt = `
You are a LinkedIn content creation expert. Create a ready-to-post LinkedIn post based on the following details:
PILLAR: ${pillar}
TOPIC: ${topic}
APPROACH: ${approach}
CONTENT TYPE: ${contentType}

USER'S COMMUNICATION STYLE: ${perspectiveLabel}
USER'S DESIRED TONE: ${voiceLabel}

Your task is to create a complete, ready-to-post LinkedIn post in the specified format.
The post should:
1. Be engaging and professional
2. Follow the specified approach exactly
3. Match the content type format
4. Include appropriate hashtags (3-5)
5. Have a clear call-to-action
6. CRITICALLY IMPORTANT: Match the user's communication style and tone specified above


IMPORTANT: Do NOT include any introductory text like "Okay, here's a LinkedIn post draft..." or any instructions. Start directly with the LinkedIn post content.

Format the response as a complete LinkedIn post, ready to copy and paste.
`;
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const post = response.text();
    
    console.log("Successfully generated post");
    
    return Response.json({ post });
    
  } catch (error) {
    console.error("Detailed error:", error);
    return Response.json(
      {
        error: "Failed to generate LinkedIn post",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}