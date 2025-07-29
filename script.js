document.addEventListener("DOMContentLoaded", () => {
  let selectedAnswers = []; // Step 1: prepare to store answers

  const options = document.querySelectorAll(".answer-option");

  options.forEach(option => {
    option.addEventListener("click", () => {
      const profile = option.dataset.profile;

      // Step 2: store this answer
      selectedAnswers.push(profile);
      console.log("Stored answers so far:", selectedAnswers);

      // Step 3: (Optional) visually mark it as selected
      options.forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");

      // More logic will go here in the next step (like going to next question)
    });
  });
});
