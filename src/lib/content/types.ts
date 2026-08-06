// Content model for course weeks.
// Every week page is rendered entirely from a `Week` object — no page-specific
// JSX per week. To add a week, create a file in `weeks/` and register it in
// `index.ts`. See docs/agent/codebase-map/course-content.md.

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

export type VideoAssignment = {
  title: string;
  /** YouTube video ID (the `v=` param) — rendered as an in-page player. */
  youtubeId: string;
  /** Duration as shown on YouTube, e.g. "10:30" — lets students plan. */
  length: string;
};

export type DayPlan = {
  /** "Day 1", "Day 2", … */
  day: string;
  /** One line: what this day accomplishes. */
  focus: string;
  /** Keep total video time short — beginners need room to type along. */
  videos: VideoAssignment[];
  /** What to actually DO after (or while) watching. Every day has practice. */
  practice: string;
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
  /**
   * Video track — a paced, day-by-day plan through a playlist. Students with
   * no foundation need small daily portions, not one long video: keep each
   * day's video time short (~10–20 min) and pair it with concrete practice.
   */
  video: {
    /** Playlist name, e.g. the YouTube playlist title. */
    title: string;
    /** Link to the full playlist (escape hatch / watch ahead). */
    playlistUrl: string;
    /** How to watch actively — applies to every day. */
    watchNotes: string[];
    days: DayPlan[];
  };
  /** Reading track — text alternative covering the same material. */
  reading: ReadingItem[];
  activity: Activity;
  selfCheck: SelfCheckItem[];
  status: "available" | "coming-soon";
};
