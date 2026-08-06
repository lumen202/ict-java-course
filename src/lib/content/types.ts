// Content model for course weeks.
// Every week page is rendered entirely from a `Week` object — no page-specific
// JSX per week. To add a week, create a file in `weeks/` and register it in
// `index.ts`. See src/lib/content/README.md.

export type ReadingItem = {
  label: string;
  url: string;
  /** Why/how to use this resource, shown under the link. */
  note?: string;
};

export type SelfCheckItem = {
  question: string;
  /** Hidden until the student clicks "Show answer". */
  answer: string;
};

export type Activity = {
  title: string;
  /** One sentence: what the student will have produced when done. */
  goal: string;
  steps: string[];
  /**
   * The part that can't be copied from the tutorial — every activity must
   * have one. Keeps "typed along with the video" from passing as done.
   */
  twist: string;
  deliverables: string[];
};

export type Week = {
  /** URL segment, e.g. "unit1-week1". Never change after students have the link. */
  slug: string;
  unit: string;
  title: string;
  summary: string;
  objectives: string[];
  /** Video track — one primary video/playlist per week. */
  video: {
    title: string;
    url: string;
    /** Which part of the video to watch + how to watch actively. */
    watchNotes: string[];
  };
  /** Reading track — text alternative covering the same material. */
  reading: ReadingItem[];
  activity: Activity;
  selfCheck: SelfCheckItem[];
  status: "available" | "coming-soon";
};
