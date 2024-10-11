import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const { resources } = await cloudinary.api.resources({
    type: 'upload',
    prefix: process.env.CLOUDINARY_IMAGES_DIRECTORY,
    context: true,
    max_results: 999
  });

  return Response.json({
    images: resources
  })
}