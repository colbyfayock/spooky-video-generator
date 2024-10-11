import { v2 as cloudinary } from 'cloudinary';
import JSZip from 'jszip';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { manifest } = await request.json();

  try {
    const zip = new JSZip();
  
    zip.file('CltManifest.json', Buffer.from(JSON.stringify(manifest)));
  
    const blob = await zip.generateAsync({ type: "blob" });
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    const results = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'auto'
      }, (error: unknown, result: unknown) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }).end(buffer);
    });

    return Response.json({
      results
    });
  } catch(e) {
    console.log(e);
    return new Response(JSON.stringify({
      error: 'Could not generate video.'
    }), {
      status: 400
    })
  }
}