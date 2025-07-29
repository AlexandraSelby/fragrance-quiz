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

      // Hide first question
      document.getElementById("quiz").style.display = "none";

      // Show second question
      document.getElementById("question2").style.display = "block";
    });
  });


  const preferenceDropdown = document.getElementById("preference");

  preferenceDropdown.addEventListener("change", () => {
    const selectedValue = preferenceDropdown.value;

    // Store it like the others
    selectedAnswers.push(selectedValue);
    console.log("Stored answers so far:", selectedAnswers);

    // TODO: Show question 3 here later
  });
});
