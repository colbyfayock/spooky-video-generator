# Spooky Video Generator

## Getting Started

1. Install the project dependencies:

```shell
npm install
```

1. Configure your environment variables:

```shell
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="<Cloudinary Cloud Name>"
NEXT_PUBLIC_CLOUDINARY_API_KEY="<Cloudinary API Key>"
CLOUDINARY_API_SECRET="<Cloudinary API Secret>"

CLOUDINARY_IMAGES_DIRECTORY="spooky-images" # Customize where images are uploaded and pulled from your account

OPENAI_API_KEY="<OpenAI API Key>"
```

> Note: You'll need a Cloudinary account and OpenAI account in order to run the project.

1. Upload stock images to your Cloudinary account which will be used for the generator:

```shell
npm run upload
```

> Tip: You can customize the images inside of the /images directory. This runs the script inside of /scripts/upload.ts

1. Start your local development server by running:

```shell
npm run dev
```

And your project should now be available at http://localhost:3000!