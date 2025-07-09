import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST() {
  try {
    // Revalidate the homepage for all locales
    await revalidatePath('/[locale]', 'page')
    await revalidatePath('/en', 'page')
    await revalidatePath('/', 'page')

    return NextResponse.json({
      success: true,
      message: 'Homepage cache revalidated successfully',
    })
  } catch (error) {
    console.error('Cache revalidation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
