const {
  generatePersonalizedContent,
} = require('./dist/lib/contentGenerator.js')

const mockInputs = {
  initialAmount: 10000,
  monthlyContribution: 500,
  timeHorizon: 20,
  annualReturn: 8,
  inflationRate: 3,
  goal: 'retirement',
}

try {
  const content = generatePersonalizedContent(mockInputs, 'en')
  console.log('Generated successfully')
  console.log('Content length:', content.comparative_scenarios.length)
  console.log(
    'Sample content:',
    content.comparative_scenarios.substring(0, 1000)
  )
  console.log(
    'Contains lowerContribution placeholder:',
    content.comparative_scenarios.includes('{lowerContribution}')
  )
} catch (error) {
  console.log('Error:', error.message)
}
