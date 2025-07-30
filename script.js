document.addEventListener("DOMContentLoaded", () => {
  let selectedAnswers = []; // Step 1: prepare to store answers

  const options = document.querySelectorAll(".answer-option");

  options.forEach(option => {
    option.addEventListener("click", () => {
      const profile = option.dataset.profile;

      // Step 2: store this answer
      selectedAnswers.push(profile);
      console.log("Stored answers so far:", selectedAnswers);

      // Step 3: visually mark it as selected
      options.forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");

      // Hide first question
      document.getElementById("quiz").style.display = "none";

      // Show second question
      document.getElementById("question2").style.display = "block";
    });
  });

  //Fix: dropdown logic
  const preferenceDropdown = document.getElementById("preference");

  preferenceDropdown.addEventListener("change", () => {
    const selectedValue = preferenceDropdown.value;

    selectedAnswers.push(selectedValue);
    console.log("Stored answers so far:", selectedAnswers);

    // Show question 3
    document.getElementById("question2").style.display = "none";
    document.getElementById("question3").style.display = "block";
  });

  // Drink button logic
  const drinkButtons = document.querySelectorAll(".drink-btn");

  drinkButtons.forEach(button => {
    button.addEventListener("click", () => {
      const profile = button.dataset.profile;

      selectedAnswers.push(profile);
      console.log("Stored answers so far:", selectedAnswers);

      document.getElementById("question3").style.display = "none";
document.getElementById("question4").style.display = "block";

  });
});
// Question 4: Edible Notes (checkboxes)
const edibleForm = document.getElementById("edible-form");

if (edibleForm) {
  edibleForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Stop page refresh

    const checkedBoxes = document.querySelectorAll('input[name="edible"]:checked');
    checkedBoxes.forEach(box => {
      selectedAnswers.push(box.value);
    });

    console.log("Stored answers so far:", selectedAnswers);

    document.getElementById("question4").style.display = "none";
    alert("Great! You made it through Question 4.");
  });
}

});

