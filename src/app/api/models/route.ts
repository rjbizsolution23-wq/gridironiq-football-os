import { NextResponse } from 'next/server'
import { getActiveFreeModels } from '@/lib/ai-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const models = await getActiveFreeModels()
    return NextResponse.json({
      success: true,
      count: models.length,
      models,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
