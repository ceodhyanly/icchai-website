export async function sendConfirmationEmail(user: {
  firstName: string
  email: string
  registrationNumber: string
  attendance: string
}, pdfBytes: Uint8Array): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return // Email is optional — add RESEND_API_KEY to enable

  const attLabel =
    user.attendance === 'both' ? 'Both Days (October 22 & 23, 2026)' :
    user.attendance === 'day1' ? 'Day 1 Only (October 22, 2026)' :
    'Day 2 Only (October 23, 2026)'

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#F5F1EE;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e2df;">

  <div style="background:#16040A;padding:32px 40px 28px;">
    <div style="font-size:30px;font-weight:900;color:#fff;letter-spacing:-0.02em;">
      ICCHAI <span style="color:#A41C30;">2026</span>
    </div>
    <div style="font-size:10px;color:rgba(228,220,212,0.50);margin-top:5px;letter-spacing:0.06em;text-transform:uppercase;">
      International Conference on Contemplative HealthTech and AI
    </div>
  </div>

  <div style="padding:40px 40px 32px;border-bottom:1px solid #ede8e5;">
    <p style="font-size:21px;font-weight:800;color:#1a0a0a;margin:0 0 10px;">
      Congratulations, ${user.firstName}!
    </p>
    <p style="font-size:14px;color:#6b5f5a;line-height:1.75;margin:0 0 28px;">
      Your registration for ICCHAI 2026 is confirmed. We are delighted to welcome you to the first international gathering at the intersection of contemplative science, AI, and digital health.
    </p>

    <div style="background:#F7F4F2;border:1px solid #e8e2df;border-top:3px solid #A41C30;border-radius:6px;padding:24px 28px;margin-bottom:28px;">
      <div style="font-size:9px;font-weight:700;letter-spacing:0.12em;color:#9a8a84;text-transform:uppercase;margin-bottom:8px;">Registration Number</div>
      <div style="font-size:28px;font-weight:900;color:#A41C30;letter-spacing:0.02em;">${user.registrationNumber}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:28px;">
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #ede8e5;color:#9a8a84;width:38%;">Attendance</td>
        <td style="padding:11px 0;border-bottom:1px solid #ede8e5;font-weight:600;color:#1a0a0a;">${attLabel}</td>
      </tr>
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #ede8e5;color:#9a8a84;">Dates</td>
        <td style="padding:11px 0;border-bottom:1px solid #ede8e5;font-weight:600;color:#1a0a0a;">October 22–23, 2026</td>
      </tr>
      <tr>
        <td style="padding:11px 0;border-bottom:1px solid #ede8e5;color:#9a8a84;">Venue</td>
        <td style="padding:11px 0;border-bottom:1px solid #ede8e5;font-weight:600;color:#1a0a0a;">IIT Delhi, New Delhi & Online Worldwide</td>
      </tr>
      <tr>
        <td style="padding:11px 0;color:#9a8a84;">Time</td>
        <td style="padding:11px 0;font-weight:600;color:#1a0a0a;">18:30–22:30 IST / 9:00 am–1:00 pm EST</td>
      </tr>
    </table>

    <p style="font-size:13px;color:#6b5f5a;line-height:1.75;margin:0 0 10px;">
      Your registration pass (PDF) is attached to this email. Please keep it for your records and bring it to the venue if attending in person.
    </p>
    <p style="font-size:13px;color:#6b5f5a;line-height:1.75;margin:0;">
      You are now subscribed to ICCHAI 2026 updates. We will send the online session link before the event.
    </p>
  </div>

  <div style="padding:24px 40px;background:#F7F4F2;">
    <p style="font-size:11px;color:#9a8a84;margin:0;line-height:1.8;">
      Organised by YogaXBiofeedback Pvt Ltd (Dhyanly) &amp; The India Center, UCF<br>
      Questions: <a href="mailto:ceodhyanly@gmail.com" style="color:#A41C30;">ceodhyanly@gmail.com</a> &nbsp;·&nbsp;
      <a href="https://icchai.com" style="color:#A41C30;">icchai.com</a>
    </p>
  </div>

</div>
</body>
</html>`

  const b64 = Buffer.from(pdfBytes).toString('base64')

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'ICCHAI 2026 <onboarding@resend.dev>',
      to: user.email,
      subject: `Registration Confirmed — ICCHAI 2026 (${user.registrationNumber})`,
      html,
      attachments: [{
        filename: `ICCHAI-2026-Pass-${user.registrationNumber}.pdf`,
        content: b64,
      }],
    }),
  })
}
