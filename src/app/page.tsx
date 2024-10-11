"use client";

import { useState } from "react";
import { CldImage, CldVideoPlayer } from 'next-cloudinary';
import { pollForProcessingImage } from '@cloudinary-util/util';
import 'next-cloudinary/dist/cld-video-player.css';

import templateManifestSlideshow from '@/data/template-manifest-slideshow.json';

export default function Home() {

  const [images, setImages] = useState<Array<any>>();
  const [story, setStory] = useState<Array<any>>();
  const [manifest, setManifest] = useState<any>();
  const [video, setVideo] = useState<any>();
  const [videoId, setVideoId] = useState<string>();


  async function handleOnClick() {
    // get all assets

    const { images } = await fetch('/api/images').then(r => r.json());

    console.log('images', images)
    setImages(images);
    
    const { story } = await fetch('/api/story', {
      method: 'POST',
      body: JSON.stringify({
        images
      })
    }).then(r => r.json());

    setStory(story);
    console.log('story', story)

    if ( !story ) {
      console.log('Invalid manifest.');
      return;
    };

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
    
    console.log('manifest', manifest);
    setManifest(manifest);
    
    const { results: video } = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        manifest
      })
    }).then(r => r.json());
    
    console.log('video', video)
    setVideo(video);

    const videoUrl = video.secure_url.replace('.clt', '.webm');

    if ( await pollForProcessingImage({ src: videoUrl }) ) {
      setVideoId(videoUrl)
    }

  }
  return (
    <div>
      <button onClick={handleOnClick}>Generate</button>

      {videoId && (
        <video
          src={videoId}
          width={640}
          height={480}
          autoPlay
          muted
        />
      )}

      <h2>Images</h2>

      {Array.isArray(images) && (
        <ul className="grid grid-cols-10">
          { images.map(image => {
            return (
              <li key={image.public_id}>
                <CldImage
                  src={image.public_id}
                  width={200}
                  height={200}
                  crop={{
                    type: 'fill',
                    source: true
                  }}
                  alt=""
                  sizes="10vw"
                />
              </li>
            )
          })}
        </ul>
      )}
      <h2>Stories</h2>
      {Array.isArray(story) && (
        <ul>
          {story.map(section => {
            return (
              <li key={section.image.public_id} className="grid grid-cols-2 gap-6">
                <CldImage
                  src={section.image.public_id}
                  width={400}
                  height={400}
                  crop={{
                    type: 'fill',
                    source: true
                  }}
                  alt=""
                  sizes="50vw"
                />
                <p>{ section.content }</p>
              </li>
            )
          })}
        </ul>
      )}
      {manifest && (
        <code><pre>{ JSON.stringify(manifest, null, 2) }</pre></code>
      )}
      {video && (
        <code><pre>{ JSON.stringify(video, null, 2) }</pre></code>
      )}
    </div>
  );
}
