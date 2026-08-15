import { NextResponse } from 'next/server'
import {
  getAllPlays,
  getFormations,
  getPlayFamilies,
  getTeam,
  getOpponents,
  getGames,
  getSnapResults,
  getCallSheets,
  getInstallPlans,
  getConceptPerformance,
  getGameSummary,
} from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [
    plays,
    formations,
    families,
    team,
    opponents,
    games,
    snapResults,
    callSheets,
    installPlans,
    conceptPerformance,
    gameSummary,
  ] = await Promise.all([
    getAllPlays(),
    getFormations(),
    getPlayFamilies(),
    getTeam(),
    getOpponents(),
    getGames(),
    getSnapResults(),
    getCallSheets(),
    getInstallPlans(),
    getConceptPerformance(),
    getGameSummary(),
  ])

  return NextResponse.json({
    plays,
    formations,
    families,
    team,
    opponents,
    games,
    snapResults,
    callSheets,
    installPlans,
    conceptPerformance,
    gameSummary,
    generatedAt: new Date().toISOString(),
  })
}
