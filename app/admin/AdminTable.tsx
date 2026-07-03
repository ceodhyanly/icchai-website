'use client'

import { useState } from 'react'

type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  institution: string | null
  country: string | null
  role: string | null
  attendance: string
  registrationNumber: string | null
  createdAt: Date
}

const ADMIN_KEY = '19977991'

const attLabel: Record<string, string> = {
  both: 'Both Days',
  day1: 'Day 1 Only',
  day2: 'Day 2 Only',
}

async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

async function downloadBulk(regNumbers: string[] | 'all', label: string) {
  const body = regNumbers === 'all'
    ? { adminKey: ADMIN_KEY, all: true }
    : { adminKey: ADMIN_KEY, regNumbers }

  const res = await fetch('/api/slip/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Bulk download failed')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = label
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function AdminTable({ users }: { users: User[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkError, setBulkError] = useState('')

  const allChecked = users.length > 0 && selected.size === users.length
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(users.map(u => u.id)))
  const toggle = (id: number) => setSelected(s => {
    const next = new Set(s)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const selectedUsers = users.filter(u => selected.has(u.id))
  const selectedRegNumbers = selectedUsers
    .map(u => u.registrationNumber)
    .filter((r): r is string => r !== null)

  const handleBulkDownload = async (mode: 'selected' | 'all') => {
    setBulkLoading(true); setBulkError('')
    try {
      if (mode === 'all') {
        await downloadBulk('all', 'ICCHAI-2026-All-Registration-Passes.zip')
      } else {
        if (selectedRegNumbers.length === 0) { setBulkError('No registrants selected'); setBulkLoading(false); return }
        await downloadBulk(selectedRegNumbers, `ICCHAI-2026-Selected-${selectedRegNumbers.length}-Passes.zip`)
      }
    } catch {
      setBulkError('Download failed. Please try again.')
    }
    setBulkLoading(false)
  }

  return (
    <div>
      {/* Bulk action bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
          {selected.size > 0 ? `${selected.size} selected` : 'Select registrants to download passes'}
        </span>
        <button
          onClick={() => handleBulkDownload('selected')}
          disabled={bulkLoading || selected.size === 0}
          style={{ padding: '8px 18px', background: selected.size > 0 ? 'var(--teal)' : 'var(--surface-3)', color: selected.size > 0 ? '#fff' : 'var(--muted)', border: '1px solid var(--teal-border)', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: selected.size > 0 ? 'pointer' : 'not-allowed', opacity: bulkLoading ? 0.6 : 1 }}
        >
          Download Selected ({selected.size})
        </button>
        <button
          onClick={() => handleBulkDownload('all')}
          disabled={bulkLoading || users.length === 0}
          style={{ padding: '8px 18px', background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: bulkLoading ? 0.6 : 1 }}
        >
          {bulkLoading ? 'Preparing ZIP...' : `Download All (${users.length})`}
        </button>
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} style={{ padding: '8px 14px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
            Clear
          </button>
        )}
        {bulkError && <span style={{ fontSize: 12, color: '#FCA5A5' }}>{bulkError}</span>}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            All Registrants — {users.length} total
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', width: 40 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: 'var(--teal)' }} />
                </th>
                {['#', 'Name', 'Email', 'Institution', 'Country', 'Role', 'Attendance', 'Reg No.', 'Registered', 'Pass'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: selected.has(u.id) ? 'rgba(164,28,48,0.03)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} style={{ cursor: 'pointer', accentColor: 'var(--teal)' }} />
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap' }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted-light)' }}>{u.email}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted-light)' }}>{u.institution ?? '—'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted-light)', whiteSpace: 'nowrap' }}>{u.country ?? '—'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted-light)' }}>{u.role ?? '—'}</td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', background: 'var(--teal-dim)', border: '1px solid var(--teal-border)', borderRadius: 3, fontSize: 11, fontWeight: 600, color: 'var(--teal)' }}>
                      {attLabel[u.attendance] ?? u.attendance}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--teal)', whiteSpace: 'nowrap' }}>
                    {u.registrationNumber ?? '—'}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {u.registrationNumber ? (
                      <button
                        onClick={() => downloadBlob(
                          `/api/slip/${u.registrationNumber}?adminKey=${ADMIN_KEY}`,
                          `ICCHAI-2026-Pass-${u.registrationNumber}.pdf`
                        )}
                        style={{ padding: '5px 12px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, fontWeight: 600, color: 'var(--teal)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        PDF
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--muted)' }}>No registrations yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
