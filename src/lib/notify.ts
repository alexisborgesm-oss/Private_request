export async function sendEmailIfConfigured(toEmail: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Civana Privates <privates@yourdomain.com>";
  if (!key) return { ok: false, skipped: true as const };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [toEmail], subject, html })
  });
  return { ok: res.ok, skipped: false as const };
}

export async function sendSmsIfConfigured(toPhone: string | null | undefined, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from || !toPhone) return { ok: false, skipped: true as const };
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const form = new URLSearchParams();
  form.set("From", from);
  form.set("To", toPhone);
  form.set("Body", body);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });
  return { ok: res.ok, skipped: false as const };
}
