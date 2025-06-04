import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const futureValue = searchParams.get('futureValue');
    const timePeriod = searchParams.get('timePeriod');
    const interestRate = searchParams.get('interestRate');

    if (!futureValue || !timePeriod || !interestRate) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const ogImageUrl = `https://example.com/og-image?fv=${futureValue}&tp=${timePeriod}&ir=${interestRate}`;
    const ogTitle = `Future Value: ${futureValue}`;
    const ogDescription = `Calculate your future value over ${timePeriod} years at an interest rate of ${interestRate}%`;

    return NextResponse.json({
        title: ogTitle,
        description: ogDescription,
        image: ogImageUrl,
    });
}