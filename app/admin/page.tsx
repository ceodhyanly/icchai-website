import { prisma } from '@/lib/db'
import type { User } from '@prisma/client'

const ADMIN_KEY = process.env.ADMIN_KEY ?? '19977991'

function AccessDenied() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', flexDirection: 'column', gap: 16, padding: 24 }}>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)', letterSpacing: '-0.02em' }}>ICCHAI Admin</div>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Access this page at <code style={{ background: 'var(--surface-3)', padding: '2px 8px', borderRadius: 3, fontFamily: 'monospace' }}>/admin?key=YOUR_ADMIN_KEY</code></p>
    </div>
  )
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams

  if (key !== ADMIN_KEY) return <AccessDenied />

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  const total = users.length
  const byAttendance: Record<string, number> = {}
  const byRole: Record<string, number> = {}
  const byCountry: Record<string, number> = {}

  for (const u of users) {
    byAttendance[u.attendance] = (byAttendance[u.attendance] ?? 0) + 1
    const role = u.role ?? 'Not specified'
    byRole[role] = (byRole[role] ?? 0) + 1
    const country = u.country ?? 'Not specified'
    byCountry[country] = (byCountry[country] ?? 0) + 1
  }

  const attendanceLabel: Record<string, string> = { both: 'Both Days', day1: 'Day 1 Only', day2: 'Day 2 Only' }

  const statCards = [
    { label: 'Total Registrants', value: total, accent: 'var(--teal)' },
    { label: 'Both Days', value: byAttendance['both'] ?? 0, accent: '#C69232' },
    { label: 'Day 1 Only', value: byAttendance['day1'] ?? 0, accent: 'var(--muted)' },
    { label: 'Day 2 Only', value: byAttendance['day2'] ?? 0, accent: 'var(--muted)' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingTop: 80, paddingBottom: 80 }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
          <p className="label" style={{ marginBottom: 12 }}>ICCHAI 2026</p>
          <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--foreground)', marginBottom: 8 }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Registration data · Live from Neon database</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '28px 24px', borderTop: `3px solid ${s.accent}` }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: s.accent, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 8 }}>{s.value}</div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          {/* By Role */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '28px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>By Role</p>
            {Object.entries(byRole).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
              <div key={role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{role}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', minWidth: 32, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
            {Object.keys(byRole).length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>No registrations yet</p>}
          </div>

          {/* By Country */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '28px 28px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 20 }}>By Country</p>
            {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
              <div key={country} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--foreground)' }}>{country}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', minWidth: 32, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
            {Object.keys(byCountry).length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>No registrations yet</p>}
          </div>
        </div>

        {/* Registrant table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              All Registrants — {total} total
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['#', 'Name', 'Email', 'Institution', 'Country', 'Role', 'Attendance', 'Registered'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: User, i: number) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{u.firstName} {u.lastName}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted-light)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted-light)' }}>{u.institution ?? '—'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted-light)', whiteSpace: 'nowrap' }}>{u.country ?? '—'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted-light)' }}>{u.role ?? '—'}</td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: 'var(--teal-dim)', border: '1px solid var(--teal-border)', borderRadius: 3, fontSize: 11, fontWeight: 600, color: 'var(--teal)' }}>
                        {attendanceLabel[u.attendance] ?? u.attendance}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--muted)' }}>No registrations yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
