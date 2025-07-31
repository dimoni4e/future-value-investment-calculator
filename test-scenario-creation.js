const { createScenario } = require('./lib/db/queries.js')

async function testScenarioCreation() {
  try {
    console.log('Testing scenario creation...')

    const testData = {
      slug: 'test-debug-scenario-1000-monthly-200-5percent-10years-emergency',
      locale: 'en',
      name: 'Test Debug Scenario',
      description: 'Testing scenario creation directly',
      initialAmount: 1000,
      monthlyContribution: 200,
      annualReturn: 5,
      timeHorizon: 10,
      tags: ['emergency', 'test'],
      isPredefined: false,
      isPublic: true,
      createdBy: 'test-system',
    }

    console.log('Creating scenario with data:', testData)
    const result = await createScenario(testData)
    console.log('✅ Scenario created successfully:', result)
  } catch (error) {
    console.error('❌ Error creating scenario:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
  }
}

testScenarioCreation()
