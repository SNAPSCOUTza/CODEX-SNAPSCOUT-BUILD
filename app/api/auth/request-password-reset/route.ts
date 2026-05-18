import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const senderEmail = process.env.SENDER_EMAIL || "noreply@updates.snapscout.co.za"

    console.log("[Password Reset] API Key exists:", !!apiKey)
    console.log("[Password Reset] Sender Email:", senderEmail)

    if (!apiKey) {
      console.error("[Password Reset] RESEND_API_KEY is not set")
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    // Create Supabase admin client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("[Password Reset] Error listing users:", userError)
      return NextResponse.json({ success: true })
    }

    const userExists = users.users.some((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!userExists) {
      console.log("[Password Reset] User not found, returning success anyway")
      return NextResponse.json({ success: true })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za"

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${siteUrl}/auth/reset-password`,
      },
    })

    if (linkError) {
      console.error("[Password Reset] Error generating link:", linkError)
      return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 })
    }

    const resetUrl = linkData.properties?.action_link || ""
    console.log("[Password Reset] Reset URL generated:", !!resetUrl)

    const fromField = senderEmail.includes("<") ? senderEmail : `SnapScout <${senderEmail}>`

    console.log("[Password Reset] Using from field:", fromField)

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromField,
      to: email,
      subject: "Reset Your SnapScout Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SnapScout</h1>
                      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">South Africa's Film Industry Network</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                      <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 8px 0 32px;">
                            <a href="${resetUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0 0 16px; color: #71717a; font-size: 14px; line-height: 1.6;">
                        This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.
                      </p>
                      <p style="margin: 0; color: #a1a1aa; font-size: 12px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link:<br>
                        <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px; background-color: #fafafa; border-radius: 0 0 12px 12px; border-top: 1px solid #e4e4e7;">
                      <p style="margin: 0; color: #71717a; font-size: 12px; text-align: center;">
                        &copy; ${new Date().getFullYear()} SnapScout. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error("[Password Reset] Email error:", emailError)
      return NextResponse.json({ error: `Failed to send reset email: ${emailError.message}` }, { status: 500 })
    }

    console.log("[Password Reset] Email sent successfully:", emailData?.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Password Reset] Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
