import { db } from './lib/db/index'
import { getHomeContent, getScenarioBySlug } from './lib/db/queries'

async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing database connection...')

    // Test home content query
    const homeContent = await getHomeContent('en')
    console.log('✅ Database connection successful!')
    console.log(
      `📊 Found ${homeContent.length} home content records for English`
    )

    // Show sample content
    const sample = homeContent.slice(0, 3)
    console.log('\n📝 Sample home content:')
    sample.forEach((item) => {
      console.log(
        `   ${item.section}.${item.key}: ${item.value.substring(0, 50)}...`
      )
    })

    // Test scenario query
    console.log('\n🎯 Testing scenario query...')
    const scenario = await getScenarioBySlug('starter-10k-500-7-10', 'en')
    if (scenario) {
      console.log(`✅ Found scenario: ${scenario.name}`)
      console.log(`   Description: ${scenario.description}`)
      console.log(
        `   Initial: $${scenario.initialAmount}, Monthly: $${scenario.monthlyContribution}`
      )
      console.log(
        `   Return: ${scenario.annualReturn}%, Time: ${scenario.timeHorizon} years`
      )
    }

    console.log('\n🎉 All database tests passed!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testDatabaseConnection()
