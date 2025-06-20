import fs from 'fs'
import path from 'path'

const generateSitemap = async () => {
  const pagesDir = path.join(__dirname, '../app')
  const pages = fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts'))

  const sitemapEntries = pages.map((page) => {
    const route =
      page === 'page.tsx'
        ? '/'
        : `/${page.replace('.tsx', '').replace('.ts', '')}`
    return `<url><loc>${`https://yourdomain.com${route}`}</loc></url>`
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
        ${sitemapEntries.join('\n')}
    </urlset>`

  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap)
}

generateSitemap().catch(console.error)
