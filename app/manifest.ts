import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'invoiceme - Professional Invoice Manager',
    short_name: 'invoiceme',
    description: 'Professional invoice generator for Nigerian freelancers and businesses',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['finance', 'business', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Create Invoice',
        url: '/create',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      },
      {
        name: 'View Invoices',
        url: '/invoices',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }]
      }
    ]
  }
}

