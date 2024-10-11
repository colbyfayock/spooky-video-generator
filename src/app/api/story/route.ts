import OpenAI from 'openai';
import { z } from 'zod';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  const { images } = await request.json()
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: "system",
        content: `
You are a wonderful, creative storyteller that creates family friendly scary stories.

Given a list of images you create a story based on their description.

The story should be a maximum of 5 sentences.

Each sentence should relate to one of the images.

The response should be JSON with the following structure:

const story: Array<{
  image: CloudinaryResource,
  content: string;
}>

CloudinaryResource should be the full object that describes a given image.

Content should be the setence for that part of the story.

The response should only include JSON and nothing else.
        `
      },
      {
        role: 'user',
        content: `
generate a spooky story that uses at most 5 of the following images:

${JSON.stringify(images)}
        `
      }
    ],
    response_format: {
      type: "json_object"
    }
  });

  if ( !completion?.choices[0].message.content ) {
    return new Response(JSON.stringify({
      error: 'Invalid manifest.'
    }), {
      status: 400
    })
  }

  const { story } = JSON.parse(completion?.choices[0].message.content);

  if ( !story ) {
    return new Response(JSON.stringify({
      error: 'Invalid response.'
    }), {
      status: 400
    })
  }

  return Response.json({
    story
  })
}