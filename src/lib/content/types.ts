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
  /**
   * What to do straight after *this* video, shown directly beneath it. Watching
   * two videos then doing one lump of practice loses the first one — pair each
   * video with the thing it enables.
   */
  practice?: string;
};

export type DayActivity = {
  /**
   * Stable slug for this activity's turn-in box (lowercase/dashes). Never
   * change it once students have submitted — it keys their saved work.
   */
  id: string;
  /** Shown as the card heading — lead with an emoji, e.g. "🎮 Level 1: …". */
  title: string;
  /**
   * Rendered as a numbered list — one concrete action per step. Activities are
   * solo, hands-on tasks written in plain language: no "ask a classmate" steps
   * and no game-flavored prose ("level", "boss", points) — the playable game
   * lives in `DayPlan.game`, not in activity text.
   */
  steps: string[];
  /** Optional why-this-matters / encouragement line under the steps. */
  tip?: string;
  /**
   * What to paste into this activity's own turn-in box. Every activity should
   * have one — turning in each block's output is what keeps the day active
   * instead of read-through.
   */
  submit?: string;
};

export type GameQuestion = {
  prompt: string;
  /** Optional SQL snippet, rendered monospace under the prompt. */
  code?: string;
  choices: string[];
  /** Index into `choices`. */
  answer: number;
  /** Shown after answering — teach the why, especially on a wrong pick. */
  explain: string;
};

/**
 * A playable boss-battle quiz: the student answers questions to knock the
 * boss's HP down before running out of hearts. Wrong answers send the question
 * back into the queue, so every concept is answered correctly by the end —
 * retrieval practice dressed as an RPG. Rendered by `components/BossBattle.tsx`.
 */
export type BossBattleGame = {
  kind: "boss-battle";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  boss: { name: string; emoji: string };
  questions: GameQuestion[];
};

export type RowHuntRound = {
  /** The query, in words: "Find everyone whose favorite subject is Math." */
  question: string;
  /** Row indexes (into `rows`) that answer it. */
  matches: number[];
  /** The same query as real SQL, revealed after the round. */
  sql?: string;
  explain?: string;
};

/**
 * "You are the database": a table appears on screen and each round asks a
 * query in plain words — the student answers by clicking the matching rows,
 * then sees the same query as real SQL. Teaches scanning/WHERE/AND/OR by
 * doing, before the syntax exists. Rendered by `components/RowHunt.tsx`.
 */
export type RowHuntGame = {
  kind: "row-hunt";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  /** Display name of the table, e.g. "friends". */
  tableName: string;
  columns: string[];
  rows: string[][];
  rounds: RowHuntRound[];
};

export type QuestMission = {
  /** What to actually do, in one or two short sentences of plain language. */
  task: string;
  /** Optional SQL to run, shown monospace under the task. */
  code?: string;
  /**
   * Multiple-choice check that clears the mission — wrong picks stay on
   * screen for retry, so it can't be skipped without engaging.
   */
  check?: { question: string; choices: string[]; answer: number; explain: string };
  /**
   * If set instead of `check`, the mission clears by typing/pasting into a
   * box (label = this text). What's entered is included in the turn-in.
   */
  input?: string;
};

/**
 * A quest: real work (in Workbench, in a file) broken into missions shown ONE
 * at a time, each cleared by a quick check or a paste — built for students who
 * drown in long instruction lists. Rendered by `components/Quest.tsx`.
 */
export type QuestGame = {
  kind: "quest";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  missions: QuestMission[];
};

export type TypingRound = {
  /** What to accomplish, in words: "List every database on the server." */
  prompt: string;
  /**
   * The SQL with blanks: text inside {curly braces} is what the student must
   * type. "CREATE {DATABASE} school;" renders with one typing box; a template
   * that is one big blank ("{SHOW DATABASES;}") means type it all from
   * memory. Matching is case-insensitive and whitespace-tolerant.
   */
  template: string;
  /** Shown after the round is typed correctly. */
  explain?: string;
};

/**
 * A typing game: fill in the blanks of real SQL, escalating to whole commands
 * from memory. Muscle memory for syntax — the thing watching a video can't
 * give. Rendered by `components/TypingGame.tsx`.
 */
export type TypingGame = {
  kind: "typing";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  rounds: TypingRound[];
};

/** A playable mini-game. Results auto-save as turn-ins under the game's id. */
export type DayGame = BossBattleGame | RowHuntGame | QuestGame | TypingGame;

export type DayPlan = {
  /** "Day 1", "Day 2", … */
  day: string;
  /** One line: what this day accomplishes. */
  focus: string;
  /**
   * Opening playable game before any video — gets the day's core idea into
   * their hands before the watching starts. Prefer this over a text warmup.
   */
  warmupGame?: DayGame;
  /** Opening text activity — use only when a playable warm-up doesn't fit. */
  warmup?: DayActivity;
  /** Keep total video time short — beginners need room to type along. */
  videos: VideoAssignment[];
  /**
   * Hands-on blocks after the videos — what stretches a short video block
   * into a full class session. Prefer `DayGame`s (quests, row-hunts,
   * battles): one mission at a time beats a wall of steps, especially for
   * weaker readers. Plain `DayActivity` cards are the fallback for short,
   * simple tasks.
   */
  activities?: (DayActivity | DayGame)[];
  /** The day's boss battle, rendered after the activities. */
  game?: DayGame;
  /**
   * The day's closing task, shown after everything else. On a no-video day
   * this is the whole lesson.
   */
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
