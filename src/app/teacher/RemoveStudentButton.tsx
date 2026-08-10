import { removeStudent } from "./actions";
import { ConfirmButton } from "@/components/ConfirmButton";

// Take someone off the course. Offered for every row, including people who
// already registered — it used to be hidden for those, which meant that once a
// class had all signed up the button was never visible anywhere (BUG-009).
//
// What it does depends on whether there's an account behind the address, so the
// confirmation says which one is about to happen: a class-list-only removal is
// trivially undone by adding them back, deleting an account is not.
export function RemoveStudentButton({
  email,
  hasAccount,
}: {
  email: string;
  hasAccount: boolean;
}) {
  return (
    <form action={removeStudent}>
      <input type="hidden" name="email" value={email} />
      <ConfirmButton
        className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
        confirmLabel={hasAccount ? "Yes, remove them" : "Yes, remove"}
        message={
          hasAccount
            ? `Remove ${email} from the course?\n\nThey come off the class list and their account is deleted, along with everything they've turned in. They'll be signed out. This can't be undone.`
            : `Remove ${email} from the class list?\n\nThey won't be able to create an account. Nothing else changes — you can add them back any time.`
        }
      >
        Remove
      </ConfirmButton>
    </form>
  );
}
