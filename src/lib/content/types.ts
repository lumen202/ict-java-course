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

/**
 * One mission inside the Workbench simulator. Each step draws a scene (what
 * the fake Workbench shows) and names the one hotspot that clears it.
 */
export type WorkbenchSimStep = {
  /** What to do, in words: "Click the refresh icon next to SCHEMAS." */
  task: string;
  /**
   * Hotspot that clears the step: "run-all" | "run-cursor" |
   * "schemas-refresh" | "output-panel" | "result-grid" | "editor" |
   * `schema:<name>` (an item in the SCHEMAS panel).
   */
  target: string;
  /** Extra nudge shown after two wrong clicks. */
  hint?: string;
  /** Shown after the correct click — teach what the thing is for. */
  explain: string;
  /** SQL shown in the editor during this step (author a cursor marker inline if needed). */
  editor?: string;
  /** Items in the SCHEMAS panel. Defaults to ["sys"]. */
  schemas?: string[];
  /** Lines in the Output panel: green (ok) or red circles, like Workbench. */
  output?: { ok: boolean; text: string }[];
  /** Rows in the result grid, when a SELECT "ran". */
  result?: { columns: string[]; rows: string[][] };
};

/**
 * A clickable mock of MySQL Workbench: missions like "click the bolt that
 * runs only the statement under the cursor", cleared by clicking the right
 * part of the window. Builds tool familiarity before (or without) the real
 * install — wrong clicks explain what was clicked instead. Rendered by
 * `components/WorkbenchSim.tsx`.
 */
export type WorkbenchSimGame = {
  kind: "workbench-sim";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  steps: WorkbenchSimStep[];
};

export type ConsoleTask = {
  /** The goal in words: "Show every student in grade 9." */
  goal: string;
  /**
   * A canonical statement that does the job. The student's run is judged by
   * its EFFECT — the result it returns and/or what it changed — never by its
   * spelling, so any statement with the same outcome clears the task. If this
   * statement produces an ERROR, the task is cleared by hitting the same
   * error — that's how "break it on purpose" labs work here.
   */
  solution: string;
  /** Extra nudge shown after two runs that didn't clear the task. */
  hint?: string;
  /** Shown when the task clears. */
  explain?: string;
};

/** A table pre-existing in the console's starting state. */
export type ConsoleTableSetup = {
  name: string;
  /** type: "INT" | "VARCHAR(n)" | "DATE" — same syntax the student types. */
  columns: { name: string; type: string }[];
  rows: string[][];
};

/**
 * An in-page mini DB Fiddle: a tiny MySQL engine (`lib/minisql.ts`) runs
 * whatever the student types — CREATE/DROP/SHOW DATABASE, USE, CREATE/DROP
 * TABLE, DESCRIBE, INSERT, SELECT with WHERE/AND/OR/NOT/ORDER BY, ALTER TABLE
 * ADD COLUMN, UPDATE (with Workbench's safe-update mode emulated) — and
 * answers with a result grid or a real MySQL-style error (unknown column,
 * syntax error near X, column count mismatch…). Tasks are checked by
 * comparing effects against `solution`, so every correct spelling wins and
 * expected-error labs work. Rendered by `components/SqlConsole.tsx`.
 */
export type SqlConsoleGame = {
  kind: "sql-console";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  /** Starting state. Omit for a completely empty server. */
  setup?: {
    /** Databases (and their tables) that already exist. */
    databases?: { name: string; tables?: ConsoleTableSetup[] }[];
    /** Database pre-selected as if `USE` had been run. */
    use?: string;
    /** Workbench-style safe update mode. Defaults to true. */
    safeUpdates?: boolean;
  };
  tasks: ConsoleTask[];
};

export type OrderRound = {
  /** What the assembled lines accomplish, in words. */
  prompt: string;
  /** The lines in CORRECT order — they're shown shuffled. */
  lines: string[];
  /** Shown after the round is assembled correctly. */
  explain?: string;
};

/**
 * An arrange-the-lines game: shuffled SQL statements (or the lines of one
 * statement) are clicked into the right order. Teaches sequence and structure
 * — file order, clause order — which typing games can't. Rendered by
 * `components/OrderGame.tsx`.
 */
export type OrderGame = {
  kind: "order";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  rounds: OrderRound[];
};

export type AnswerSheetItem = {
  /** The question, exactly as the student should answer it. */
  question: string;
  /** Optional helper line under the question ("this one may need two queries…"). */
  note?: string;
};

/**
 * An in-site answer sheet: questions shown one at a time, each answered by
 * filling the same set of labeled boxes (e.g. prediction → the SQL run → the
 * real answer). Replaces "make a .txt answer sheet" busywork — everything is
 * typed here and lands in the turn-in as one document. Rendered by
 * `components/AnswerSheet.tsx`.
 */
export type AnswerSheetGame = {
  kind: "answer-sheet";
  /** Stable slug — keys the auto-saved result. Never change once live. */
  id: string;
  title: string;
  intro: string;
  /** Labels of the boxes every question gets, in order. Keep to 2–3. */
  fields: string[];
  items: AnswerSheetItem[];
};

/** A playable mini-game. Results auto-save as turn-ins under the game's id. */
export type DayGame =
  | BossBattleGame
  | RowHuntGame
  | QuestGame
  | TypingGame
  | WorkbenchSimGame
  | SqlConsoleGame
  | OrderGame
  | AnswerSheetGame;

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
