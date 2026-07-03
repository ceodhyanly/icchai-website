import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateSlipPDF } from '@/lib/generateSlipPDF'

const ADMIN_KEY = process.env.ADMIN_KEY ?? '19977991'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ regNumber: string }> }
) {
  try {
    const { regNumber } = await params
    const adminKey = req.nextUrl.searchParams.get('adminKey')

    let authorized = false
    if (adminKey === ADMIN_KEY) {
      authorized = true
    } else {
      const session = await getSession()
      if (session?.userId) {
        const sessionUser = await prisma.user.findUnique({
          where: { id: Number(session.userId) },
          select: { registrationNumber: true },
        })
        if (sessionUser?.registrationNumber === regNumber) authorized = true
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { registrationNumber: regNumber } })
    if (!user?.registrationNumber) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const pdfBytes = await generateSlipPDF({
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      institution: user.institution, country: user.country, role: user.role,
      attendance: user.attendance, registrationNumber: user.registrationNumber,
      createdAt: user.createdAt,
    })

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ICCHAI-2026-Pass-${regNumber}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
