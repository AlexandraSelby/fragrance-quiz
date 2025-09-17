const BASE_URL = window.location.origin;

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

  // Make all options focusable
  opts.forEach(el => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");

    // Keyboard accessibility
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click(); // Triggers the same logic as a mouse click
      }
    });
  });

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

// Question 1: Floral note → Base note (initial image click)
  wireQuestion(
    "quiz",
    "question2",
    "#answers .answer-option"
  );

// Question 2: Base note → Signature sip (initially was a dropdown)
  wireQuestion(
    "question2",
    "question3",
    "#base-options .answer-option"
  );

// Question 3: Signature sip → Edible notes (initially was button selection)
  wireQuestion(
    "question3",
    "question4",
    "#drink-options .answer-option"
  );

// Question 4: Edible notes → Aesthetic vibe
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

// Question 8: Intensity → Question 9
  wireQuestion(
    "question8",
    "question9",
    "#q8-options .answer-option"
  );

// Question 9: Budget → (next)
  wireQuestion(
    "question9",
    "question10",
    "#q9-options .answer-option"
  );

    // Question 10: Name → Results (custom input handler)
(function () {
  const input = document.getElementById("name-input");
  const btn = document.getElementById("name-next");
  if (!btn || !input) return;

  function goNext() {
    const name = (input.value || "").trim();
    if (!name) return; // require a name
    selectedAnswers.push(name); // keep using the same array

    document.getElementById("question10").style.display = "none";
    document.getElementById("results").style.display = "block";

    // Call backend API to generate outcome (INSIDE goNext)
    try {
      fetch(`${BASE_URL}/generate-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          answers: selectedAnswers.slice(0, -1) // exclude name from answers
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.text) {
            document.getElementById("result-text").innerHTML = data.text;
          } else {
            document.getElementById("result-text").textContent =
              "Sorry, something went wrong with the result.";
          }
        })
        .catch(err => {
          console.error("API error:", err);
          document.getElementById("result-text").textContent =
            "There was an error contacting the AI.";
        });
    } catch (e) {
      console.error("JS crash:", e);
    }
  }

  btn.addEventListener("click", goNext);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goNext();
  });
})();
});
