import { UnstuckNotifier } from "./UnstuckNotifier";

// Every /teacher/* page already guards itself with requireTeacher(returnTo) —
// this layout doesn't repeat that check, since it would only know a generic
// "/teacher" returnTo and would lose each page's own post-login destination.
// It exists purely to mount the "someone's stuck" sound notifier once, so it
// keeps listening across every teacher page rather than just
// /teacher/lessons, where the visible flag lives.
export default function TeacherLayout({ children }: LayoutProps<"/teacher">) {
  return (
    <>
      <UnstuckNotifier />
      {children}
    </>
  );
}
