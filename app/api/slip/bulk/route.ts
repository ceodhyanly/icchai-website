import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSlipPDF } from '@/lib/generateSlipPDF'
import JSZip from 'jszip'

const ADMIN_KEY = process.env.ADMIN_KEY ?? '19977991'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || body.adminKey !== ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let users
    if (body.all === true) {
      users = await prisma.user.findMany({
        where: { registrationNumber: { not: null } },
        orderBy: { id: 'asc' },
      })
    } else if (Array.isArray(body.regNumbers) && body.regNumbers.length > 0) {
      users = await prisma.user.findMany({
        where: { registrationNumber: { in: body.regNumbers } },
        orderBy: { id: 'asc' },
      })
    } else {
      return NextResponse.json({ error: 'Provide regNumbers array or all:true' }, { status: 400 })
    }

    if (users.length === 0) {
      return NextResponse.json({ error: 'No matching registrants found' }, { status: 404 })
    }

    const zip = new JSZip()
    await Promise.all(
      users.map(async (user) => {
        if (!user.registrationNumber) return
        const pdfBytes = await generateSlipPDF({
          firstName: user.firstName, lastName: user.lastName, email: user.email,
          institution: user.institution, country: user.country, role: user.role,
          attendance: user.attendance, registrationNumber: user.registrationNumber,
          createdAt: user.createdAt,
        })
        zip.file(`${user.registrationNumber}-${user.firstName}-${user.lastName}.pdf`, pdfBytes)
      })
    )

    const zipBytes = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    const filename = body.all
      ? 'ICCHAI-2026-All-Registration-Passes.zip'
      : `ICCHAI-2026-Selected-Passes-${users.length}.zip`

    return new NextResponse(zipBytes, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBytes.length.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate ZIP' }, { status: 500 })
  }
}
