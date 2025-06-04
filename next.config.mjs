import { defineConfig } from 'next';

export default defineConfig({
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  env: {
    // Define your environment variables here
    API_URL: process.env.API_URL,
  },
  experimental: {
    appDir: true,
  },
});