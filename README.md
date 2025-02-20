# Image to PDF Converter

A modern web application that converts images to PDF files with customizable options. Built with Next.js and deployed on Netlify.

## Features

- Convert multiple images to PDF
- Customize page size (A4, A3, Letter)
- Choose orientation (Portrait/Landscape)
- Maintain aspect ratio
- Dark/Light theme support
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- pdf-lib
- next-themes
- Netlify Edge Functions

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment on Netlify

1. Push your code to a GitHub repository

2. Connect to Netlify:
   - Log in to Netlify
   - Click "New site from Git"
   - Choose your repository
   - Select the main/master branch

3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18.x

4. Environment Variables:
   - NEXT_USE_NETLIFY_EDGE: true
   - NODE_VERSION: 18.17.0
   - NPM_VERSION: 9.6.7

5. Deploy!

The site will be automatically deployed and you'll get a Netlify URL.

## License

MIT
