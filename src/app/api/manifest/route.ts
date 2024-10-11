import OpenAI from 'openai';

import manifestSchema from '@/data/video-generation-schema.json';
import manifestExample1 from '@/data/manifest-example-1.json';
import manifestExample2 from '@/data/manifest-example-2.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  const { story } = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: "system",
        content: `
You are a helpful video generation assistant.

Given a story described as an array of objects with a part of a story and an image to represent
that part of the story, return a JSON object that represents a new video given the user's instructions.

Each part of the story should include an image in the background with text overlaid on top
showing the section of the story.

This is the schema:

${JSON.stringify(manifestSchema)}

The returned JSON object should be validated againsted the given JSON schema.

The response should only include JSON and nothing else.
        `
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "generate a video with an animated image and sidebar that fades in text and a button"
          }
        ]
      },
      {
        role: "assistant",
        content: [
          {
            type: "text",
            text: JSON.stringify(manifestExample1)
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "generate a video slideshow with images fading and moving into the screen with text for each slide"
          }
        ]
      },
      {
        role: "assistant",
        content: [
          {
            type: "text",
            text: JSON.stringify(manifestExample2)
          }
        ]
      },
      {
        role: 'user',
        content: `
Generate a scary video based on the following story.

${JSON.stringify(story)}

The returned JSON object should be validated againsted the following JSON schema:

${JSON.stringify(manifestSchema)}
        `
      }
    ]
  });

  const message = completion?.choices[0].message.content?.replace('```json', '').replace('```', '');

  if ( !message ) {
    return new Response(JSON.stringify({
      error: 'Invalid response.'
    }), {
      status: 400
    })
  }

  console.log('message', message)

  
  try {
    const manifest = JSON.parse(message);
    return Response.json({
      manifest
    })
  } catch(e) {
    
    return new Response(JSON.stringify({
      error: 'Could not parse manifest.'
    }), {
      status: 400
    })
  }


}