import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HashSession } from "./HashSession";

// Landing point for links in Supabase emails (invites, password recovery).
// Three link shapes exist in the wild, so all three are handled:
//
//   ?token_hash=…&type=…  a template using {{ .TokenHash }} — the tidiest
//   ?code=…               the PKCE authorization code
//   #access_token=…       Supabase's DEFAULT template, via /auth/v1/verify.
//                         Server-invisible; handled by <HashSession/>.
export default async function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  const params = await searchParams;

  const rawNext = typeof params.next === "string" ? params.next : "/welcome";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/welcome";

  const token_hash = typeof params.token_hash === "string" ? params.token_hash : null;
  const type = typeof params.type === "string" ? (params.type as EmailOtpType) : null;
  const code = typeof params.code === "string" ? params.code : null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    redirect(error ? "/login?error=expired-link" : next);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    redirect(error ? "/login?error=expired-link" : next);
  }

  // No usable query params: the token is probably in the fragment.
  return (
    <main className="mx-auto w-full max-w-sm px-6 py-20">
      <h1 className="text-lg font-semibold">Just a moment</h1>
      <div className="mt-2">
        <HashSession next={next} />
      </div>
      <noscript>
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">
          This step needs JavaScript. Go to the sign-in page and create your
          account with the email your teacher added instead.
        </p>
      </noscript>
    </main>
  );
}
