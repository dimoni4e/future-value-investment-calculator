import { db } from '@/lib/db'
import { scenario } from '@/lib/db/schema'

async function listScenarios() {
  try {
    console.log('🔍 Querying database for scenarios...')
    const scenarios = await db.select().from(scenario).limit(10)

    console.log(`\n📊 Found ${scenarios.length} scenarios in database:`)
    scenarios.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.name}`)
      console.log(`   Slug: ${s.slug}`)
      console.log(`   Locale: ${s.locale}`)
      console.log(`   Initial: $${s.initialAmount}`)
      console.log(`   Monthly: $${s.monthlyContribution}`)
      console.log(`   Rate: ${s.annualReturn}%`)
      console.log(`   Years: ${s.timeHorizon}`)
      console.log(`   Views: ${s.viewCount}`)
      console.log(`   Created: ${s.createdAt}`)
      console.log(`   Public: ${s.isPublic}`)
    })
  } catch (error) {
    console.error('❌ Error querying database:', error)
  }
}

export default listScenarios
