// unit3-week10 · Day 3 — The staff list: a second endpoint for people who must see everything
//
// The public menu now hides retired snacks, so staff need a list that doesn't. Today's Java adds
// GET /api/staff/snacks: every snack, with an `available` flag, through its OWN record
// (StaffSnack(snack_id, name, price, available)); Snack and every answer built on it stay exactly as
// they were. Today's page (Part 2) is staff.html: one table, an Edit link, Take off / Put back and
// Remove on each row, and an Add form, all through api.js.
// Design decision (spec D3): the staff list is a separate path, /api/staff/snacks, not
// /api/snacks?all=true. Reason observed: before any staff mapping existed, /api/snacks/staff was
// swallowed by /api/snacks/{id} and answered 400 "Method parameter 'id': Failed to convert value of
// type 'java.lang.String' to required type 'int'; For input string: "staff"". A path under /api/staff/
// cannot collide with {id}, and the public list's code is not touched.
// Observed on a real build: /api/staff/snacks lists all snacks including retired ones, each with a
// boolean available; /api/snacks and /api/snacks/{id} keep exactly snack_id, name, price; staff.html
// matches the staff list, Add adds a row, Take off makes the row say No and the label flip, Put back
// reverses it, Remove removes it; Remove on Kutsinta writes "Sorry: Snack 90 is used by a sale or a
// special" and the row stays; no public page links to staff.html.
// Video (transcript read with yt-dlp 2026-11-18): Majin Dev, "JS Dom part0: Create element"
//  (D4Cs2XvnNsA, 2:49): watch 1:25 to 2:19. It covers createElement and append of ONE element only.

import type { DayPlan } from "../../types";
import { day3Part2 } from "./day3-part2";
import { EX, PREV } from "./captured";
import { STAFF_LIST_ROUNDTRIP, STAFF_LIST_SUPERSET } from "./commands";
import { mc, mission, paste, bq } from "./helpers";
import {
  CONTROLLER_D3,
  SQL_CLEAN_CHECKS,
  SQL_CLEAN_PRACTICE,
  SQL_PRACTICE_SNACK,
  SQL_RETIRE_PRACTICE,
  STAFF_LIST,
  STAFF_SNACK_RECORD,
} from "./snippets";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "A staff list that shows everything, a second record so nothing else changes, and a page built on it",
  warmupGame: {
    kind: "quest",
    id: "warmup-two-lists",
    title: "🧾 Warm-up: who sees what?",
    intro: "Since Monday the menu hides retired snacks. The people who run the canteen can't work from that list.",
    missions: [
      mission(
        "A staff member wants to put a retired snack back on the menu. She opens the edit page for it (that works: GET /api/snacks/{id} isn't filtered) but how does she FIND it, if no list shows it?",
        "Think about what /api/snacks answers now.",
        mc(
          "What does the staff page need that the menu doesn't have?",
          "A list of every snack, including the retired ones, with a flag to tell them apart",
          ["A list with only the retired snacks", "A second database"],
          "'All snacks' and 'the menu' are two different questions, so two different endpoints.",
        ),
      ),
      mission(
        "Where should the staff list live? One idea is a new address under snacks, /api/snacks/staff. Another is a new area, /api/staff/snacks. Remember that /api/snacks/{id} takes a number from the address.",
        "What would  /api/snacks/{id}  do with the word staff in the place of the number?",
        mc(
          "Which is the safer address, and why?",
          "/api/staff/snacks: it can't be mistaken for /api/snacks/{id}, which would try to read the word staff as a snack number",
          ["/api/snacks/staff: it is shorter", "Both are identical"],
          "You will see the problem with your own eyes in the lab: before a staff mapping exists, /api/snacks/staff answers with Spring's refusal to turn the word into a number.",
        ),
      ),
      mission(
        "The staff list needs one more fact per snack: available. You could add it to the Snack record that every endpoint already uses. Or you could make a second record just for staff.",
        "How many answers would change if Snack got a fourth field?",
        mc(
          "Why make a second record, StaffSnack?",
          "Snack is used by the menu, the search, the find, the order lookup and the add form: a fourth field would change all of their answers; a new record changes only the new endpoint",
          ["Records can only have three fields", "Spring requires one record per endpoint"],
          "Smallest possible change. Last week's checkpoints still pass because their answers don't change at all.",
        ),
      ),
    ],
  },
  videos: [
    {
      title: "JS DOM part 0: create an element (Majin Dev)",
      youtubeId: "D4Cs2XvnNsA",
      length: "2:49",
      practice: {
        intro:
          "Watch 1:25 to 2:19: how to create a new element and add it to the page. It is very short, and it covers ONE element. Skip 1:48 to 1:58, where he sets the content with innerHTML: you use textContent, as in every page since Week 6. He appends to document.body; your staff page appends rows to a table's tbody.",
        steps: [
          "Write in notes.md: which two steps does he use to put a new heading on the page, and in what order?",
          "Write: in menu.js, which lines already do these two steps for each snack?",
        ],
        note: "The video has no table, no buttons and no fetched data. Part 2's lab builds all of it, line by line, the way menu.js and orders.js already do. The reading on createElement on MDN is the other half.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: GET /api/staff/snacks",
      intro:
        "You will add the record and the endpoint, see why the address isn't under /api/snacks, and prove that nothing else changed. Restart after every change to a .java file. The test snack is 8000: look before you add.",
      missions: [
        mission(
          "A retired snack to find. Run  SELECT * FROM snacks WHERE snack_id = 8000;  first. If it returns a row, STOP and use another number everywhere. Otherwise:\n\n" +
            SQL_PRACTICE_SNACK +
            "\n\n" +
            SQL_RETIRE_PRACTICE +
            "\n\nOpen localhost:8080/api/snacks: Practice isn't there. Open localhost:8080/api/snacks/8000: it is.",
          "The menu hides it; the single lookup doesn't. That is Monday's design, and the reason today's list is needed.",
          mc(
            "Which address shows the retired snack today?",
            "Only the one that asks for it by number; no list shows it yet",
            ["/api/snacks", "/api/find?name=Practice"],
            "Every list that builds a menu filters. The staff list will be the one that does not.",
          ),
        ),
        mission(
          "The address problem. Before you add anything, open  localhost:8080/api/snacks/staff  and write what it answers.",
          "It answers 400 with a sentence that starts  Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'int'  and ends  For input string: \"staff\".  /api/snacks/{id} grabbed the word.",
          mc(
            "Why does /api/snacks/staff answer with an error about 'id'?",
            "Spring matched it to /api/snacks/{id}, took staff as the snack number, and couldn't turn it into an int",
            ["Because the staff list is empty", "Because MySQL is stopped"],
            "A path with a variable in it will swallow any word in that spot. Put the new list somewhere it can't be mistaken.",
          ),
        ),
        mission(
          "The record. Create StaffSnack.java (right-click the folder with SnackController.java → New File), with your package line first, then:\n\n" +
            STAFF_SNACK_RECORD +
            "\n\nIt is Snack plus one field, available. Then in SnackController.java, as the last thing inside the class, above the final closing brace, add the method:\n\n" +
            STAFF_LIST +
            "\n\nRestart. Open localhost:8080/api/staff/snacks and read it: every snack, including Practice with  \"available\":false.",
          "The SELECT has no WHERE: staff want everything. The columns are labelled as the record's fields, as always: snack_id, name, price, available. A red StaffSnack means the file is missing its package line or has a typo in the name.",
          mc(
            "Why has staffSnacks no WHERE and the menu's SELECTs have one?",
            "The menu answers 'what can a customer order?'; the staff list answers 'what does the ledger hold?'",
            ["A WHERE is optional", "The staff list is faster without it"],
            "Same table, two questions, two SELECTs.",
          ),
        ),
        mission(
          "Prove nothing else changed. Open localhost:8080/api/snacks and localhost:8080/api/snacks/90. Write the keys of one snack in each. Then open localhost:8080/api/staff/snacks and write its keys.",
          "The first two still have snack_id, name and price, and nothing else. Only the staff list has available.",
          mc(
            "What are the keys of a snack in the menu list now?",
            "snack_id, name and price, exactly as before: the new field is on StaffSnack only",
            ["snack_id, name, price and available", "Only name"],
            "That is what a second record buys: last week's pages and checkpoints couldn't notice anything.",
          ),
        ),
        mission(
          "Who may read the staff list? Today: anyone who knows the address. Write one sentence in notes.md about that, and one about why the staff page will not be linked from the menu.",
          "Nothing stops a customer from typing /api/staff/snacks. A page nobody links to is hidden, not protected. That is true of last week's edit page too.",
          mc(
            "Is a page that no menu links to protected?",
            "No: it is only not advertised; anyone who types the address can open it",
            ["Yes: browsers hide it", "Yes: MySQL checks"],
            "Say it plainly in your notes. A real shop would need more than an unlinked page; for now, be honest about what you have.",
          ),
        ),
        mission(
          "Clean up and compare. Put the practice snack away:\n\n" +
            SQL_CLEAN_PRACTICE +
            "\n\nAfter Part 1 your SnackController.java should look like this (line 1 is your own package line; blank lines and method order don't matter):\n\n" +
            CONTROLLER_D3,
          "Common differences: StaffSnack missing a field (a column in the JSON stays out); a WHERE copied in from the menu's SELECTs; the new method outside the class.",
        ),
        paste(
          "Write Part 1 into notes.md: why the staff list is its own address and its own record, what the menu's JSON still contains, and the one honest sentence about who can read the staff list.",
          "In your own words.",
          "Paste Part 1 of notes.md",
        ),
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-staff-list",
      title: "🧪 Part 1 · Checkpoint: a list that shows everything",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080). They make their own snack, named Check and a number, and remove it again. If a line leaves one behind, remove it with  " +
        SQL_CLEAN_CHECKS +
        "  Monday's app has no staff list, so it cannot pass.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It adds a snack, takes it off the menu, and asks the staff list, the public menu and the snack by its number. It also checks the menu's keys are unchanged. Paste what it copies.",
          command: STAFF_LIST_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "staff_status", equals: 200, message: "GET /api/staff/snacks should answer 200. A 404 means the endpoint isn't there (restart; check the address and @GetMapping)." },
            { path: "staff_shows_it", equals: true, message: "The staff list doesn't show the retired snack. Has your SELECT a WHERE available = TRUE copied in? The staff list has no WHERE." },
            { path: "staff_says_unavailable", equals: true, message: "The staff list should say  \"available\":false  for a retired snack." },
            { path: "staff_keys", equals: "snack_id,name,price,available", message: "Each staff entry should have exactly snack_id, name, price, available, in that order. Check StaffSnack.java." },
            { path: "hidden_from_menu", equals: true, message: "The public menu should still hide the retired snack." },
            { path: "menu_keys_unchanged", equals: true, message: "The public menu's snacks should still have only snack_id, name and price. Did you add the field to Snack by mistake?" },
            { path: "one_by_number_status", equals: 200, message: "GET /api/snacks/{id} should still find a retired snack." },
            { path: "cleaned_up", equals: true, message: "The line couldn't remove its snack. Use the cleanup statement above." },
          ],
          hint: "staff_keys is the keys of the entry the line looked at, joined with commas: the record's field order.",
          solution: STAFF_LIST,
          example: EX.d3Staff,
          previousStage: PREV.d3Staff,
          explain: "Two lists from one table: the menu for customers, the ledger for staff, and neither one changed the other's shape.",
        },
        {
          goal: "Run this line on a localhost:8080 page. It asks the staff list and the public menu and compares them: the staff list must hold every snack on the menu, marked available, and at least as many snacks. Paste what it copies.",
          command: STAFF_LIST_SUPERSET,
          checks: [
            { is: "object", message: "This should be one small object." },
            { path: "staff_is_array", equals: true, message: "The staff list should be a JSON list starting with [. Is the endpoint answering?" },
            { path: "staff_has_every_menu_snack", equals: true, message: "Some snack on the menu is missing from the staff list, or has a different name or price. The staff list must hold everything the menu holds." },
            { path: "staff_marks_menu_snacks_available", equals: true, message: "Every snack on the menu should say available: true in the staff list." },
            { path: "staff_at_least_as_long", equals: true, message: "The staff list is shorter than the menu: it must have at least as many snacks." },
          ],
          hint: "Same table, no WHERE, one more column.",
          solution: CONTROLLER_D3,
          example: EX.d3Superset,
          previousStage: PREV.d3Superset,
          explain: "The menu is a subset of the ledger. The staff list is the ledger.",
        },
      ],
    },
    ...day3Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five dashboards",
      intro: "Each patient is a real failure of this kind of lab. Say what is wrong and what you would change.",
      missions: [
        mission(
          "Patient 1. A student copied the menu's SELECT into staffSnacks, WHERE available = TRUE included. The dashboard works until a snack is taken off the menu: then its row disappears and nobody can put it back.",
          "What did the staff list's SELECT keep out?",
          mc(
            "What is wrong?",
            "The staff list must show retired snacks too: it has no WHERE; a copied filter hides exactly the rows staff need",
            ["The page is broken", "The flag is stored wrong"],
            "Copying code copies its rules. Read what each SELECT is FOR before you reuse it.",
          ),
        ),
        mission(
          "Patient 2. Before writing any staff mapping, a student opens localhost:8080/api/snacks/staff and reads a 400:  Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'int'; For input string: \"staff\".  He is sure the app is broken.",
          "Which mapping did Spring match, and what did it expect in the place of staff?",
          mc(
            "What is happening?",
            "/api/snacks/{id} matched: Spring took the word staff as a snack number and couldn't turn it into an int; nothing is broken, the address is just taken",
            ["MySQL has no table called staff", "The app needs a restart"],
            "A path with a variable in it swallows any word in that spot. That is why the staff list lives under its own area, /api/staff/.",
          ),
        ),
        mission(
          "Patient 3. The staff page's Take off button works (the database changes) but the row still says Yes and the button still says Take off until the page is reloaded.",
          "What does the page do after a successful write?",
          mc(
            "What is missing?",
            "loadSnacks() after the write: the table was drawn from an older answer, and nothing asked again",
            ["A restart of the app", "A .catch"],
            "A page shows what it last fetched. After a write, fetch again: the rule from Week 9.",
          ),
        ),
        mission(
          "Patient 4. A student named the record field  boolean isAvailable.  The staff list answers fine, but the dashboard's 'On the menu' column says No for every snack, even the ones that are on the menu.",
          "What key does the JSON carry, and what does the page read?",
          mc(
            "What went wrong?",
            "The JSON key is the field's name, isAvailable, and the page reads snack.available, which isn't there (so it is undefined, and counts as No)",
            ["MySQL stored the flag wrong", "Booleans can't be sent as JSON"],
            "Keys are the field names, as since Week 7. The page and the record must agree on the spelling.",
          ),
        ),
        mission(
          "Patient 5. A student presses Remove on Kutsinta and the page writes  Sorry: Snack 90 is used by a sale or a special.  He files a bug: 'the Remove button doesn't work'.",
          "Which sentence did Week 9's Thursday teach?",
          mc(
            "Is it a bug?",
            "No: it is the foreign key's wall, turned into a sentence by deleteSnack; the right move for a snack that has been sold is Take off the menu",
            ["Yes: Remove should always work", "Yes: the sentence is wrong"],
            "The dashboard keeps the wall and offers the way round it, one button away.",
          ),
        ),
        paste(
          "Write your discharge notes: one line per patient with the first thing you would check, and then one line that starts: 'Before I copy a query for a new purpose I …'.",
          "Patient 1 gives you the line.",
          "Paste your five notes and your rule",
        ),
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own dashboard",
      intro: "Make the staff page more useful. Do at least one idea; if you have time, do more.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Keep every checkpoint passing. Ideas: (1) grey out the rows that are off the menu (add a class and a rule in style.css); (2) a count line:  12 snacks, 2 off the menu;  (3) sort the staff list by name instead of number, in the SQL, and say why you would or wouldn't; (4) a filter box on the page that hides rows whose name doesn't contain the text (like menu.html's search, but on the rows already there); (5) harder: show for each snack how many sales it has, with ONE new SELECT using a LEFT JOIN and COUNT, in a record of its own, and say why you didn't add it to StaffSnack.",
          hint: "Ideas 1, 2 and 4 are page-only (Ctrl+Shift+R). For 5, a LEFT JOIN keeps snacks with no sales, which an INNER JOIN would drop (Week 3).",
        },
        paste(
          "Paste what you added: the new lines (and which file), how you tested it, and what it did.",
          "How you tested it can be one sentence.",
          "Paste your new lines, how you tested, and what it did",
        ),
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-two-lists",
    title: "⚔️ Boss battle: The Hidden Row",
    intro: "The Hidden Row is a snack nobody can find. Light it up for staff only.",
    boss: { name: "the Hidden Row", emoji: "🕵️" },
    questions: [
      bq("Why does the staff page need its own list?", "The menu hides retired snacks, and staff must see them to put them back", ["Staff are in a hurry", "The menu is too long"], "Two questions: what can be ordered, and what the ledger holds."),
      bq("Why is the address /api/staff/snacks and not /api/snacks/staff?", "/api/snacks/{id} would take the word staff as a snack number", ["Shorter paths are slower", "Spring forbids the word"], "Observed: before any mapping existed, /api/snacks/staff answered a 400 about the id."),
      bq("Why a new record, StaffSnack, and not a fourth field on Snack?", "Snack is used by every other endpoint, and its shape must not change", ["Records have three fields", "JSON can't hold four"], "The smallest change that gives staff what they need."),
      bq("Does the staff SELECT have a WHERE on available?", "No: it shows everything", ["Yes, available = TRUE", "Yes, available = FALSE"], "It must show both."),
      bq("What keys does one snack have in /api/snacks now?", "snack_id, name, price", ["snack_id, name, price, available", "name, price"], "Unchanged: the checkpoint reads the keys."),
      bq("Is an unlinked page protected?", "No: it is not advertised, but anyone who knows the address can open it", ["Yes: browsers hide it", "Yes: the app checks"], "Be honest about what you have."),
      bq("After a Take off click, why does the page call loadSnacks() again?", "The table shows what was last fetched; the truth has to be asked for", ["Because Spring requires it", "To restart the app"], "A rule from Week 9 that every write follows."),
      bq("Remove on Kutsinta writes Sorry: Snack 90 is used by a sale or a special. Is that a bug?", "No: it is the foreign key's wall, and Take off the menu is the way round", ["Yes: Remove should always work", "Yes: the message is too long"], "Thursday's 409, on a button."),
      bq("A record field is named isAvailable. What key does the JSON have?", "isAvailable: the key is the field's name", ["available", "is_available"], "A page that reads snack.available finds nothing."),
      bq("The Edit link on each row goes to:", "edit-snack.html?id=N, with the row's number", ["edit-snack.html", "/api/snacks/N"], "The page you built on Monday is the other half of the dashboard."),
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: why does the staff page need a list the menu can't give, and what did you build to give it?",
      "Why is the address /api/staff/snacks and not /api/snacks/staff? What did you see when you opened the second one?",
      "Why a second record, StaffSnack, and what does that protect?",
      "What does the staff page do after every write, and why?",
      "Who can open the staff page today, and what would a real shop need?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Staff can see every snack. Part 2 puts them on one page with the buttons you already have, all through api.js.",
  },
};
