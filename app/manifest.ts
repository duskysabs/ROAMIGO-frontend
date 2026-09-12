// Boilerplate code for the manifest.ts file in a Next.js project using TypeScript for PWA (Progressive Web App) support. This file defines the web app manifest, which provides metadata about the application, such as its name, icons, and theme colors. The manifest is used by browsers to enhance the user experience when the app is installed on a device.
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My App',
    short_name: 'App',
    description: 'Built with Next.js App Router',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
