import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { parse } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

// Helper: draw text with wrapping
function drawText(
  page: any,
  font: any,
  text: string,
  x: number,
  y: number,
  size: number,
  maxWidth: number,
  color: rgb = rgb(0.1, 0.1, 0.1)
) {
  page.drawText(text, { x, y, size, font, color, maxWidth })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = new URL(req.url).searchParams.get('type') || 'callsheet'
  const teamId = (session.user as { teamId?: string | null }).teamId

  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helveticaMono = await pdfDoc.embedFont(StandardFonts.Courier)

  const page = pdfDoc.addPage([612, 792]) // US Letter
  const { width, height } = page.getSize()
  const margin = 40

  // Colors
  const green = rgb(0.09, 0.64, 0.09)
  const orange = rgb(0.85, 0.45, 0.08)
  const dark = rgb(0.12, 0.12, 0.12)
  const light = rgb(0.6, 0.6, 0.6)
  const white = rgb(1, 1, 1)

  // Header bar
  page.drawRectangle({ x: 0, y: height - 60, width, height: 60, color: green })
  page.drawText('GridironIQ™', {
    x: margin,
    y: height - 35,
    size: 20,
    font: helveticaBold,
    color: white,
  })

  const titles: Record<string, string> = {
    callsheet: 'Game Day Call Sheet',
    wristband: 'QB Wristband',
    practice: 'Practice Plan',
    weekly: 'Weekly Game Prep Schedule',
  }
  page.drawText(titles[type] || 'Export', {
    x: margin,
    y: height - 52,
    size: 11,
    font: helvetica,
    color: white,
  })

  // Footer
  page.drawText('Made by RJ Business Solutions & Rick Jefferson — rjbusinesssolutions.org', {
    x: margin,
    y: 20,
    size: 8,
    font: helvetica,
    color: light,
  })
  page.drawText(new Date().toLocaleDateString(), {
    x: width - margin - 60,
    y: 20,
    size: 8,
    font: helvetica,
    color: light,
  })

  let y = height - 90

  if (type === 'callsheet') {
    // Export call sheet
    const callSheets = await db.callSheet.findMany({
      where: teamId ? { teamId } : {},
      orderBy: { createdAt: 'desc' },
      take: 1,
    })

    if (callSheets.length > 0) {
      const sheet = callSheets[0]
      const sections = parse(sheet.sections) ?? []

      page.drawText(sheet.name, {
        x: margin,
        y,
        size: 14,
        font: helveticaBold,
        color: dark,
      })
      y -= 25

      for (const section of sections) {
        if (y < 80) {
          // New page
          const newPage = pdfDoc.addPage([612, 792])
          y = 752
        }
        page.drawRectangle({ x: margin, y: y - 14, width: width - 2 * margin, height: 18, color: green })
        page.drawText(section.situation, {
          x: margin + 6,
          y: y - 8,
          size: 10,
          font: helveticaBold,
          color: white,
        })
        y -= 22

        if (section.plays) {
          for (const play of section.plays) {
            if (y < 60) break
            const priorityBadge = play.priority === 1 ? 'P1' : play.priority === 2 ? 'P2' : 'P3'
            page.drawText(`${priorityBadge}`, {
              x: margin + 6,
              y,
              size: 9,
              font: helveticaMono,
              color: play.priority === 1 ? green : orange,
            })
            page.drawText(play.playId || '', {
              x: margin + 30,
              y,
              size: 9,
              font: helveticaMono,
              color: dark,
            })
            page.drawText(play.note || '', {
              x: margin + 120,
              y,
              size: 9,
              font: helvetica,
              color: dark,
            })
            y -= 16
          }
          y -= 5
        }
      }
    } else {
      page.drawText('No call sheet data available.', {
        x: margin,
        y,
        size: 12,
        font: helvetica,
        color: light,
      })
    }
  } else if (type === 'practice' || type === 'weekly') {
    // Export practice plan or weekly schedule
    page.drawText(type === 'weekly' ? 'Weekly Game-Prep Timeline' : 'Practice Script', {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
      color: dark,
    })
    y -= 25

    const installPlans = await db.installPlan.findMany({
      where: teamId ? { teamId } : {},
      orderBy: { day: 'asc' },
    })

    if (installPlans.length > 0) {
      for (const plan of installPlans) {
        if (y < 80) break
        page.drawText(`Day ${plan.day}: ${plan.title}`, {
          x: margin,
          y,
          size: 11,
          font: helveticaBold,
          color: green,
        })
        y -= 18
        if (plan.focus) {
          page.drawText(plan.focus, { x: margin + 10, y, size: 9, font: helvetica, color: light })
          y -= 15
        }
        const sections = parse(plan.sections) ?? []
        for (const section of sections) {
          if (y < 60) break
          page.drawText(`  ${section.period}:`, {
            x: margin + 10,
            y,
            size: 9,
            font: helveticaBold,
            color: dark,
          })
          y -= 14
          for (const item of section.items) {
            if (y < 50) break
            page.drawText(`    • ${item.name}`, {
              x: margin + 20,
              y,
              size: 9,
              font: helvetica,
              color: dark,
            })
            y -= 13
          }
        }
        y -= 10
      }
    } else {
      page.drawText('No practice plan data available.', {
        x: margin,
        y,
        size: 12,
        font: helvetica,
        color: light,
      })
    }
  }

  const pdfBytes = await pdfDoc.save()
  return new Response(pdfBytes, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="gridironiq-${type}-${Date.now()}.pdf"`,
    },
  })
}
