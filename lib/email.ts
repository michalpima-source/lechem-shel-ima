import { Resend } from 'resend'
import type { CartItem } from './types'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

interface OrderConfirmationParams {
  to: string
  customerName: string
  orderNumber: number
  pickupDate: string
  items: CartItem[]
  totalAmount: number
  notes?: string
}

export async function sendOrderConfirmation(params: OrderConfirmationParams) {
  const { to, customerName, orderNumber, pickupDate, items, totalAmount, notes } = params

  const pickupFormatted = new Date(pickupDate).toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const itemRows = items.map(({ product, quantity }) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3ede8;">${product.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3ede8;text-align:center;">${quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f3ede8;text-align:left;">₪${(product.price * quantity).toFixed(0)}</td>
    </tr>
  `).join('')

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fdf6f0;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(180,80,40,0.08);max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#7c2d12;padding:32px 40px;text-align:center;">
            <div style="font-size:32px;margin-bottom:8px;">🍞</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:bold;">לחם של אמא</h1>
            <p style="margin:8px 0 0;color:#fca5a5;font-size:14px;">מאפיית בוטיק ביתית</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">

            <h2 style="color:#7c2d12;margin:0 0 8px;font-size:22px;">ההזמנה שלך התקבלה! 🎉</h2>
            <p style="color:#6b4c3b;margin:0 0 24px;font-size:15px;">שלום ${customerName}, תודה שבחרת בלחם של אמא.</p>

            <div style="background:#fff8f5;border:1px solid #f3ede8;border-radius:8px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;color:#7c2d12;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">פרטי הזמנה</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#6b4c3b;font-size:14px;padding:4px 0;">מספר הזמנה:</td>
                  <td style="color:#1c0a00;font-weight:bold;font-size:14px;padding:4px 0;text-align:left;">#${orderNumber}</td>
                </tr>
                <tr>
                  <td style="color:#6b4c3b;font-size:14px;padding:4px 0;">תאריך איסוף:</td>
                  <td style="color:#1c0a00;font-weight:bold;font-size:14px;padding:4px 0;text-align:left;">${pickupFormatted}</td>
                </tr>
              </table>
            </div>

            <h3 style="color:#7c2d12;margin:0 0 12px;font-size:15px;">פריטים שהוזמנו</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f3ede8;border-radius:8px;overflow:hidden;margin-bottom:20px;">
              <thead>
                <tr style="background:#fff8f5;">
                  <th style="padding:10px 12px;text-align:right;color:#7c2d12;font-size:13px;font-weight:600;">מוצר</th>
                  <th style="padding:10px 12px;text-align:center;color:#7c2d12;font-size:13px;font-weight:600;">כמות</th>
                  <th style="padding:10px 12px;text-align:left;color:#7c2d12;font-size:13px;font-weight:600;">מחיר</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
              <tfoot>
                <tr style="background:#fff8f5;">
                  <td colspan="2" style="padding:12px;font-weight:bold;color:#7c2d12;">סה״כ לתשלום</td>
                  <td style="padding:12px;font-weight:bold;color:#7c2d12;text-align:left;">₪${totalAmount.toFixed(0)}</td>
                </tr>
              </tfoot>
            </table>

            ${notes ? `<div style="background:#fff8f5;border-radius:8px;padding:16px;margin-bottom:20px;"><p style="margin:0 0 4px;color:#7c2d12;font-size:13px;font-weight:600;">הערות:</p><p style="margin:0;color:#6b4c3b;font-size:14px;">${notes}</p></div>` : ''}

            <div style="border-top:2px solid #f3ede8;padding-top:20px;margin-top:8px;">
              <p style="color:#6b4c3b;font-size:14px;line-height:1.6;margin:0;">
                ברגע שההזמנה תהיה מוכנה לאיסוף, נשלח לך עדכון.<br>
                לכל שאלה אפשר לפנות אלינו ישירות.
              </p>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fff8f5;padding:20px 40px;text-align:center;border-top:1px solid #f3ede8;">
            <p style="margin:0;color:#a87060;font-size:12px;">לחם של אמא — מאפיית בוטיק ביתית 🍞</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `הזמנה #${orderNumber} התקבלה — לחם של אמא 🍞`,
    html,
  })
}
