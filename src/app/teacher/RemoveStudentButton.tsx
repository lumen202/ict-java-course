import { removeStudent } from "./actions";

// Only offered for people who don't currently have an account — removing
// someone from the class list doesn't disable an account they already made,
// and pretending otherwise would be misleading. ("Currently" is live-checked
// against Auth when possible, so this reappears once a deleted account is
// actually gone — see hasAccount in students/page.tsx.)
export function RemoveStudentButton({ email }: { email: string }) {
  return (
    <form action={removeStudent}>
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
      >
        Remove
      </button>
    </form>
  );
}
