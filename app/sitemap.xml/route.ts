import { NextResponse } from 'next/server';

export async function GET() {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
        <url>
            <loc>${process.env.NEXT_PUBLIC_BASE_URL}/</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
        </url>
        <url>
            <loc>${process.env.NEXT_PUBLIC_BASE_URL}/about</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
        </url>
        <url>
            <loc>${process.env.NEXT_PUBLIC_BASE_URL}/legal</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
        </url>
        <!-- Add more URLs as needed -->
    </urlset>`;

    return NextResponse.text(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}