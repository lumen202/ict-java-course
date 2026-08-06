import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for links in Supabase emails (invites, password recovery).
//
// Two link shapes reach here, depending on the email template:
//   • ?token_hash=…&type=invite  — what a template using {{ .TokenHash }} sends.
//     This is the one to prefer; see docs/agent/codebase-map/enrolment.md.
//   • ?code=…                    — the PKCE flow's authorization code.
//
// Supabase's *default* invite template sends neither: {{ .ConfirmationURL }}
// routes through Supabase's own /auth/v1/verify, which returns the session in
// the URL fragment (#access_token=…). A fragment never reaches the server, so
// that link lands here empty and the person sees "that link wasn't valid".
// Fixing it means editing the email template, not this file.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/welcome";
  const safeNext = next.startsWith("/") ? next : "/welcome";

  const supabase = await createClient();

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (error) redirect("/login?error=expired-link");
    redirect(safeNext);
  }

  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect("/login?error=expired-link");
    redirect(safeNext);
  }

  redirect("/login?error=invalid-link");
}
