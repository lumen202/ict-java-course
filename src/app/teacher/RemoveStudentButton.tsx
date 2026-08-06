import { removeStudent } from "./actions";

// Only offered for people who haven't registered yet — removing someone from
// the class list doesn't disable an account they already made, and pretending
// otherwise would be misleading.
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
