import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import JSZip from 'jszip';


cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const tmpPath = process.env.TMP_PATH ? path.join(process.cwd(), process.env.TMP_PATH) : '/tmp';

export async function POST(request: Request) {
  const { manifest } = await request.json();

  // if (!existsSync(tmpPath)) {
  //   await fs.mkdir(tmpPath, { recursive: true });
  // }

  // const manifestPath = path.join(tmpPath, 'manifest.json');
  // await fs.writeFile(manifestPath, JSON.stringify(manifest));


  const zip = new JSZip();
  
  zip.file('CltManifest.json', Buffer.from(JSON.stringify(manifest)));

  const blob = await zip.generateAsync({ type: "blob" });
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const results = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      resource_type: 'auto'
    }, (error: any, result: any) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    }).end(buffer);
  });

  // const timestamp = Math.round((new Date).getTime()/1000);

  // const formData = new FormData();

  // const parameters: { [key: string]: string | Blob } = {
  //   resource_type: 'video',
  // };

  // if ( typeof process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER === 'string' ) {
  //   parameters.folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER;
  // }

  // Object.keys(parameters).sort().forEach(key => {
  //   if ( typeof parameters[key] === 'undefined' ) return;
  //   formData.append(key, String(parameters[key]));
  // });

  // const signature = cloudinary.utils.api_sign_request({
  //   ...parameters,
  //   timestamp
  // }, String(process.env.CLOUDINARY_API_SECRET));

  // formData.append('manifest_json', JSON.stringify(manifest));
  // formData.append('api_key', String(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY));
  // // formData.append('upload_preset', 'spooky-video-generator-unsigned');
  // formData.append('timestamp', String(timestamp));
  // formData.append('signature', signature);

  try {
    // const data = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/create_video`, {
    //   method: 'POST',
    //   body: formData
    // }).then(r => r.json())

    return Response.json({
      results
    })
  } catch(e) {
    console.log('e', e);
    return new Response(JSON.stringify({
      error: 'Could not generate video.'
    }), {
      status: 400
    })
  }
}