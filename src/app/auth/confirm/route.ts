import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for links in Supabase emails (invites, password recovery).
// The link carries a one-time token; verifying it here sets the session cookie,
// then we send the person on to finish setting up their account.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/welcome";

  if (!token_hash || !type) {
    redirect("/login?error=invalid-link");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    // Expired or already-used invite links land here.
    redirect("/login?error=expired-link");
  }

  redirect(next.startsWith("/") ? next : "/welcome");
}
