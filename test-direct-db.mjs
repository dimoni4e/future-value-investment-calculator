// Simple test to verify if database is accessible and scenario can be created
import { db } from './lib/db/index.js'
import { scenario } from './lib/db/schema.js'

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...')

    // Test connection
    const result = await db.select().from(scenario).limit(1)
    console.log('✅ Database connection successful')
    console.log('Sample scenario count:', result.length)

    // Test insert
    const testScenario = {
      slug: 'test-direct-insert-' + Date.now(),
      locale: 'en',
      name: 'Direct Test Insert',
      description: 'Testing direct database insert',
      initialAmount: '1000.00',
      monthlyContribution: '200.00',
      annualReturn: '5.00',
      timeHorizon: 10,
      tags: ['test'],
      isPredefined: false,
      isPublic: true,
      createdBy: 'test-system',
    }

    console.log('Inserting test scenario...')
    const [inserted] = await db
      .insert(scenario)
      .values(testScenario)
      .returning()
    console.log('✅ Insert successful:', inserted.slug)

    // Test select
    const found = await db
      .select()
      .from(scenario)
      .where(scenario.slug === inserted.slug)
    console.log('✅ Select successful:', found.length > 0)
  } catch (error) {
    console.error('❌ Database test failed:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    })
  }
}

testDatabaseConnection()
