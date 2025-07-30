
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


  // TODO: wire up Question 3, 4, 5 in exactly the same way
});

