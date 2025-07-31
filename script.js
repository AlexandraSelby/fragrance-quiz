
document.addEventListener("DOMContentLoaded", () => {
  // Global storage of quiz answers
  const selectedAnswers = [];

  // ————————————————
  // 1) Generic helper to wire up any question
  /**
   * wireQuestion: handles a question→nextQuestion flow
   * @param {string} fromId   container ID of current question
   * @param {string} toId     container ID of next question
   * @param {string} selector CSS selector matching option elements
   * @param {boolean} multi   if true, allow multi‑select (requires nextId)
   * @param {string} nextId   ID of “Next” button when multi=true
   */
  function wireQuestion(fromId, toId, selector, multi = false, nextId = null) {
    const opts = document.querySelectorAll(selector);

    if (!multi) {
      // Single‑choice: click → store + go to next
      opts.forEach(el =>
        el.addEventListener("click", () => {
          selectedAnswers.push(el.dataset.profile);
          document.getElementById(fromId).style.display = "none";
          document.getElementById(toId).style.display = "block";
        })
      );
    } else {
      // Multi‑choice: toggle selection, then wait for Next button
      opts.forEach(el =>
        el.addEventListener("click", () => {
          el.classList.toggle("selected");
        })
      );
      document.getElementById(nextId).addEventListener("click", () => {
        document
          .querySelectorAll(selector + ".selected")
          .forEach(el => {
            selectedAnswers.push(el.dataset.profile);
          });
        document.getElementById(fromId).style.display = "none";
        document.getElementById(toId).style.display = "block";
      });
    }
  }

  // ————————————————

  // Question 1: Floral note → Base note (initial image click)
  wireQuestion(
    "quiz",
    "question2",
    "#answers .answer-option"
  );

  // Question 2: Base note → Signature sip (initially was a dropdown)
  wireQuestion(
    "question2",
    "question3",
    "#base-options .answer-option"
  );

  // Question 3: Signature sip → Edible notes (initially was button selection)
  wireQuestion(
    "question3",
    "question4",
    "#drink-options .answer-option"
  );

  // Question 4: Edible notes → Aesthetic vibe
wireQuestion(
  "question4",
  "question5",
  "#edible-options .edible-option"
);

 // Question 5: Aesthetic vibe → Season
wireQuestion(
  "question5",
  "question6",
  "#aesthetic-options .aesthetic-option"
);

// Question 6: Season → Occasion
  wireQuestion(
    "question6",
    "question7",
    "#season-options .answer-option"
  );

// Question 7: Occasion → Intensity
  wireQuestion(
    "question7",
    "question8",
    "#occasion-options .answer-option"
  );



  // TODO: wire up remaining questions in exactly the same way
});

