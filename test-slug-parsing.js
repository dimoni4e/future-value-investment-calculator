// Test the parseSlugToScenario function directly
const { parseSlugToScenario } = require('./lib/scenarioUtils')

const testSlugs = [
  'invest-1000-monthly-200-5percent-10years-emergency',
  'test-debug-1000-monthly-200-5percent-10years-emergency',
  'invest-2000-monthly-300-6percent-15years-retirement',
  'test-direct-insert-1751981933809',
]

console.log('Testing parseSlugToScenario function...\n')

testSlugs.forEach((slug) => {
  console.log(`Testing slug: ${slug}`)
  const result = parseSlugToScenario(slug)
  console.log('Result:', result)
  console.log('---')
})
