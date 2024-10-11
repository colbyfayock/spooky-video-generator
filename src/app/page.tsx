"use client";

import { useState } from "react";
import { CldImage } from 'next-cloudinary';
import { pollForProcessingImage } from '@cloudinary-util/util';

import Container from "@/components/Container";

import templateManifestSlideshow from '@/data/template-manifest-slideshow.json';

export default function Home() {
  const [state, setState] = useState('ready');
  const [story, setStory] = useState<Array<{ image: { public_id: string; }; content: string }>>();
  const [videoId, setVideoId] = useState<string>();

  async function handleOnClick() {
    // First load all of the images from the Cloudinary account
    try {
      setState('loading-images');

      const { images } = await fetch('/api/images').then(r => r.json());

      console.log('Account Images', images)

      // Use an LLM to generate a story
      
      setState('loading-story');

      const { story } = await fetch('/api/story', {
        method: 'POST',
        body: JSON.stringify({
          images,
          sectionCount: 5
        })
      }).then(r => r.json());

      console.log('Story', story)
      setStory(story);

      if ( !story ) {
        throw new Error('Invalid manifest.');
      };

      // Create a new Manifest that will be used for the video generation

      setState('loading-manifest');

      const manifest = { ...templateManifestSlideshow };

      manifest.tracks[0].clips = story.map(({ image }: { image: { public_id: string } }) => {
        return {
          "media": [
            image.public_id,
            "image",
            "upload"
          ],
          "type": "image",
          "transformation": "c_auto"
        }
      });
    
      manifest.tracks[1].clips = story.map(({ content }: { content: string }) => {
        return {
          type: "textArea",
          text: content
        }
      });
      
      console.log('Video Manifest', manifest);

      // Generate the video using the dynamically generated manifest

      setState('loading-video');
      
      const { results: video } = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          manifest
        })
      }).then(r => r.json());
      
      console.log('Video Results', video)

      // Delay this for ~5s as the will happen relatively quick
      // This allows for a little transition and spacing out of the
      // prefetching of the video itself
      setTimeout(() => {
        setState('loading-prefetch');
      }, 12000)

      const videoUrl = video.secure_url.replace('.clt', '.webm');

      console.log('Video URL', videoUrl);

      if ( await pollForProcessingImage({ src: videoUrl }) ) {
        console.log('Video ready', videoUrl);
        setVideoId(videoUrl)
      }

      setState('done');
    } catch(e) {
      console.log(e);
      setState('error');
    }
  }
  return (
    <Container className="relative flex flex-col justify-center items-center space-y-6 h-full py-12">

      {['ready', 'done', 'error'].includes(state) && (
        <>
          <h1 className="font-bold font-display text-6xl">
            Spooky Video Generator
          </h1>
          
          <p>
            <a href="https://github.com/colbyfayock/spooky-video-generator" className="hover:text-red-400">
              View on GitHub
            </a>
          </p>
        </>
      )}

      {state === 'error' && (
        <p className="text-center">
          Hm, something even scarier happened, we ran into an error! 😱 Please try again.
        </p>
      )}

      {['ready', 'done'].includes(state) && (
        <p className="text-center">
          <button className="bg-red-500 px-4 py-3 rounded-sm font-bold" onClick={handleOnClick}>
            Generate Story
          </button>
        </p>
      )}

      {['loading-images', 'loading-story', 'loading-manifest'].includes(state) && (
        <>
          <span className="absolute flex items-center justify-center top-0 right-0 bottom-0 left-0 z-0 m-auto opacity-5 text-[40rem]">
            👀
          </span>
          <p className="relative z-10 text-2xl text-center animate-pulse">
            Crafting an extra spOoOoky story... 👀
          </p>
        </>
      )}

      {['loading-video'].includes(state) && (
        <>
          <span className="absolute flex items-center justify-center top-0 right-0 bottom-0 left-0 z-0 m-auto opacity-5 text-[40rem]">
            💀
          </span>
          <p className="relative z-10 text-2xl text-center animate-pulse mb-6">
            The story has been told... and it&apos;s haunting! 💀
          </p>
          <p className="relative z-10 text-4xl text-center font-display">
            Wait if you dare...
          </p>
        </>
      )}

      {['loading-prefetch'].includes(state) && (
        <>
          <span className="absolute flex items-center justify-center top-0 right-0 bottom-0 left-0 z-0 m-auto opacity-5 text-[40rem]">
            💀
          </span>
          <p className="relative z-10 text-2xl text-center animate-pulse mb-6">
            It&apos;s not too late to turn back... 🫣
          </p>
        </>
      )}

      {['done'].includes(state) && (
        <div className="pt-12">
          {videoId && (
            <video
              className="mb-24 rounded overflow-hidden"
              src={videoId}
              width={640}
              height={360}
              autoPlay
              muted
              controls
              loop
            />
          )}
        
          {Array.isArray(story) && (
            <ul className="max-w-[640px] grid gap-6 mx-auto">
              {story.map(section => {
                return (
                  <li key={section.image.public_id} className="flex items-center gap-6">
                    <CldImage
                      className="rounded"
                      src={section.image.public_id}
                      width={200}
                      height={200}
                      crop={{
                        type: 'fill',
                        source: true
                      }}
                      alt=""
                      sizes="50vw"
                    />
                    <p className="text-xl">
                      { section.content }
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </Container>
  );
}
