"use client";

// Submit button that asks first. Deleting a turn-in throws away a student's
// work and makes them redo it, so it should never be one stray click. The
// form itself stays a server component calling a server action — only the
// confirmation needs the client.
export function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
