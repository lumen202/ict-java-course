// unit3-week9 · Day 4, Part 2 — "a Remove button on the edit page"
//
// edit-snack.html (Day 1, Part 2) gets a Remove button; edit-snack.js asks confirm(...), sends
// DELETE /api/snacks/{id}, writes "Snack N is off the menu." on 204 and "Sorry: <the app's
// sentence>" otherwise (the 409 reaches the page word for word). Observed in headless Chrome 156 on
// a real build (confirm answered "OK" by the checker): ?id=8000 (a snack nobody ordered) is removed
// and the menu loses it; ?id=90 (Kutsinta) shows "Sorry: Snack 90 is used by a sale or a special" and
// Kutsinta stays. After a removal the form still holds the old values: pressing Save then PUTs and the
// app answers 404 "No snack with id 8000", which the page shows after "Sorry:".

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { EDIT_REMOVE_COMMAND, EDIT_REMOVE_WALL_COMMAND } from "./commands";
import {
  EDIT_SNACK_HTML_D4,
  EDIT_SNACK_JS_D4,
  EDIT_SNACK_JS_REMOVE,
  EDIT_SNACK_REMOVE_BUTTON,
} from "./snippets";

const ADD_8000 =
  "fetch(\"/api/snacks\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 8000, name: \"Remove me\", price: 5 }) }).then(r => console.log(r.status))";

export const day4Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-remove-button",
    inline: true,
    title: "🛠️ Part 2 · Lab: a Remove button on the edit page",
    intro:
      "Part 1 can remove a snack from the console. Part 2 adds the button to edit-snack.html, with a question first and the app's own sentence when it says no. A page file needs only Ctrl+Shift+R after an edit, not a restart.",
    missions: [
      {
        task:
          "Edit edit-snack.html: under the closing tag of the form, the line  </form>,  add one line. It sits outside the form to keep Save's form to saving only, and it says type=\"button\", which means it never submits anything (a button inside a form WITHOUT that type submits the form):\n\n" +
          EDIT_SNACK_REMOVE_BUTTON +
          "\n\nOpen localhost:8080/edit-snack.html?id=90: a Remove button under Save. Don't press it yet.",
        hint: "Place it between  </form>  and  <p id=\"result\"></p>.  It has type=\"button\" and its own id, remove, which the script will look for.",
        check: {
          question: "What does type=\"button\" on the Remove button do, and why is the button outside the form?",
          choices: [
            "type=\"button\" means the button never submits a form, so Remove can't save the boxes; it is outside the form only to keep Save's form to saving",
            "Buttons are not allowed inside forms",
            "To make it look different",
          ],
          answer: 0,
          explain: "A button with type=\"button\" does nothing by itself: only the script you attach acts, even inside a form. (A button with no type, or type=\"submit\", inside a form submits it.) Keeping Remove outside the form just keeps the form to one job.",
        },
      },
      {
        task:
          "Edit edit-snack.js: at the very end of the file, below the submit listener and an empty line, add:\n\n" +
          EDIT_SNACK_JS_REMOVE +
          "\n\nPress Ctrl+Shift+R on the edit page.",
        hint: "It is Wednesday's cancelOrder, for a snack: confirm first, then DELETE, a 204 is success and writes a line, anything else has a JSON body whose message goes after Sorry:. There is no response.json() on the 204 path.",
        check: {
          question: "Which line stops a click from removing a snack by accident?",
          choices: [
            "if (!confirm(…)) { return; }: it ends the function before the fetch when the person says no",
            "The DELETE itself",
            "The 204 check",
          ],
          answer: 0,
          explain: "A page can add one cheap safety in front of the request. It doesn't replace the app's checks: it only protects people from mis-clicks.",
        },
      },
      {
        task:
          "Remove a snack nobody ordered. Add one from the Console of localhost:8080/menu.html:\n\n" +
          ADD_8000 +
          "\n\nBefore you add it, check 8000 is free:  SELECT * FROM snacks WHERE snack_id = 8000;  must show nothing (if it shows a row, use another number, such as 8010, in the line and in the address). Check it's on the menu. Then open localhost:8080/edit-snack.html?id=8000, press Remove, answer the box with Cancel (nothing should happen), press Remove again and answer OK. Read the line under the form, and reload the menu.",
        hint: "After OK the page says Snack 8000 is off the menu. and the menu has lost it. If the POST printed 409, snack 8000 is taken: choose another number in the line and the address.",
        check: {
          question: "What does the line under the form say after you answer OK?",
          choices: [
            "Snack 8000 is off the menu.",
            "Sorry: …",
            "Nothing",
          ],
          answer: 0,
          explain: "A 204 means it worked, and the page writes its own sentence because the app sent none.",
        },
      },
      {
        task:
          "Now the same page for a snack that has sales. Open localhost:8080/edit-snack.html?id=90 (Kutsinta), press Remove and answer OK. Write the line under the form, and check Kutsinta is still on the menu.",
        hint: "The line is Sorry: Snack 90 is used by a sale or a special. That sentence is the Java one from Part 1, arriving word for word. Kutsinta is still on the menu: MySQL refused.",
        check: {
          question: "Where was the sentence 'is used by a sale or a special' written?",
          choices: [
            "In edit-snack.js",
            "In deleteSnack's catch block in Java: the page only shows it after 'Sorry:'",
            "In MySQL",
          ],
          answer: 1,
          explain: "One sentence, one place. Change it in Java and the page follows with no change to the page.",
        },
      },
      {
        task:
          "A page that is out of date. Add snack 8000 again (the Console line above), open edit-snack.html?id=8000 in TWO tabs, and in the first tab press Remove (OK). In the second tab, which still shows the old boxes, press Save. Write what it says.",
        hint: "The second tab says Sorry: No snack with id 8000: Save sends a PUT, the count is 0, and the 404 comes back. The boxes still held the old values because nothing redrew them.",
        check: {
          question: "Which earlier day's idea produced that message?",
          choices: [
            "Monday's: a PUT whose UPDATE changed nothing because no snack matched, so the count was 0 and became a 404",
            "Thursday's wall",
            "Wednesday's 204",
          ],
          answer: 0,
          explain: "The same count, seen from a second tab. It's the app telling a stale page the truth.",
        },
      },
      {
        task:
          "Compare. After Part 2 your edit-snack.html and edit-snack.js should look like this, line by line (blank lines don't matter), with the Remove button as the only change to the page:\n\n" +
          EDIT_SNACK_HTML_D4 +
          "\n\n// ---- edit-snack.js ----\n\n" +
          EDIT_SNACK_JS_D4,
        hint: "Common differences: the Remove button missing type=\"button\" (a button with no type inside a form would submit it); the listener attached before the button exists (the script tag must be the last line of the body); response.json() on the 204 path.",
      },
      {
        task:
          "Add Part 2 to notes.md: what the Remove button sends (verb and address), what the page shows for a 204 and for a 409, and where the sentence for the 409 comes from.",
        hint: "Write it in your own words. The last part is about which file the sentence lives in.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-remove-button",
    title: "🧪 Part 2 · Checkpoint: the Remove button",
    intro:
      "Each task runs one line in the console of the edit page, presses Remove for you (answering the question box with OK), waits, and asks the app. For the first task, add snack 8000 first with the line in the lab and open  localhost:8080/edit-snack.html?id=8000.  The second uses Kutsinta, which has sales, so nothing can be lost. Part 1's page had no Remove button.",
    tasks: [
      {
        goal: "With snack 8000 on the menu, open localhost:8080/edit-snack.html?id=8000, press F12 → Console, and run this line. Paste what it copies.",
        command: EDIT_REMOVE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object starting with {." },
          { path: "has_remove_button", equals: true, message: "There is no element with id remove on this page. Add  " + EDIT_SNACK_REMOVE_BUTTON + "  under the form and press Ctrl+Shift+R." },
          { path: "message_on_page", equals: "Snack 8000 is off the menu.", message: "The page should write  Snack 8000 is off the menu.  after a 204. Check the click listener writes it when response.status is 204." },
          { path: "snack_gone_in_mysql", equals: true, message: "Snack 8000 is still there: GET /api/snacks/8000 should be 404. Did the page send DELETE to /api/snacks/ + snackId?" },
        ],
        hint: "If message_on_page is empty, the listener isn't attached or confirm blocked it. If the snack is still there, the fetch isn't sending method DELETE.",
        solution: EDIT_SNACK_REMOVE_BUTTON + "\n\n// edit-snack.js, at the end:\n" + EDIT_SNACK_JS_REMOVE,
        example: EX.d4PageRemove,
        previousStage: PREV.d4PageRemove,
        explain: "A button, a DELETE, a 204: the click took a row out of your snacks table.",
      },
      {
        goal: "Open localhost:8080/edit-snack.html?id=90 (Kutsinta), press F12 → Console, and run this line. It first checks in /api/sales that Kutsinta has a sale (and does nothing if it has none). Paste what it copies.",
        command: EDIT_REMOVE_WALL_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object starting with {." },
          { path: "has_remove_button", equals: true, message: "There is no Remove button on this page." },
          { path: "has_sales", equals: true, message: "Kutsinta has no sales in your ledger, so the line didn't press Remove. Week 8's test sales should be there; see the hint of Part 1's Kutsinta task." },
          { path: "message_on_page", contains: "is used by a sale or a special", message: "The page should write  Sorry: Snack 90 is used by a sale or a special.  Does the else branch write the app's own message after 'Sorry:'?" },
          { path: "still_on_menu", equals: true, message: "Kutsinta must still be on the menu afterwards. If it isn't, the wall is missing: re-add Kutsinta with  INSERT INTO snacks (snack_id, name, price) VALUES (90, 'Kutsinta', 10);  and add Week 3 Day 4's foreign key, as the hint of Part 1's Kutsinta task says." },
        ],
        hint: "In the else branch:  response.json().then(data => { result.textContent = `Sorry: ${data.message}`; });",
        solution: EDIT_SNACK_JS_REMOVE,
        example: EX.d4PageWall,
        previousStage: PREV.d4PageWall,
        explain: "The wall, reaching a person in words they can read.",
      },
    ],
  },
];
