import fs from 'fs'
import path from 'path'
import {
  englishTemplates,
  spanishTemplates,
  polishTemplates,
} from '../lib/contentTemplates'

const locales = [
  { code: 'en', templates: englishTemplates },
  { code: 'es', templates: spanishTemplates },
  { code: 'pl', templates: polishTemplates },
]

async function updateTemplates() {
  for (const { code, templates } of locales) {
    const filePath = path.join(
      process.cwd(),
      'i18n',
      'messages',
      `${code}.json`
    )

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`Warning: File not found for locale ${code}: ${filePath}`)
        continue
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const json = JSON.parse(content)

      if (!json.content) {
        json.content = {}
      }

      // Update templates
      // We need to ensure we don't overwrite other content properties if they exist
      // But we want to replace the templates object entirely with our new structure
      json.content.templates = templates

      fs.writeFileSync(filePath, JSON.stringify(json, null, 2))
      console.log(`Updated templates for locale: ${code}`)
    } catch (error) {
      console.error(`Error updating locale ${code}:`, error)
    }
  }
}

updateTemplates()
