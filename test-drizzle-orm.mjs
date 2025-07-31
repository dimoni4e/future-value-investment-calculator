import { db } from './lib/db/index.js'
import { scenario } from './lib/db/schema.js'

async function testDrizzleInsert() {
  try {
    console.log('Testing Drizzle ORM insert...')

    const testData = {
      slug: 'test-drizzle-orm-1000-monthly-200-5percent-10years-emergency',
      locale: 'en',
      name: 'Test Drizzle ORM Scenario',
      description: 'Testing Drizzle ORM insert directly',
      initialAmount: '1000.00',
      monthlyContribution: '200.00',
      annualReturn: '5.00',
      timeHorizon: 10,
      tags: ['emergency', 'test'],
      isPredefined: false,
      isPublic: true,
      createdBy: 'test-drizzle',
    }

    console.log('Inserting with Drizzle ORM...')
    const [result] = await db.insert(scenario).values(testData).returning()
    console.log('✅ Drizzle ORM insert successful:', result)

    // Verify it was saved
    console.log('Verifying the insert...')
    const allScenarios = await db.select().from(scenario).limit(5)
    console.log('Recent scenarios:', allScenarios.slice(0, 2))
  } catch (error) {
    console.error('❌ Drizzle ORM insert failed:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      constraint: error.constraint,
    })
  }
}

testDrizzleInsert()
