let meals = [];

fetch('../data/meals.json')
  .then(response => {
    if (!response.ok) throw new Error("Failed to load meals data");
    return response.json();
  })
  .then(data => {
    meals = data;
    loadMealDetails(); // Call after data is loaded
  })
  .catch(error => {
    console.error('Error loading meal data:', error);
  });

function getMealByName(name) {
  return meals.find(m => m.name === name);
}

function loadMealDetails() {
  const params = new URLSearchParams(window.location.search);
  const mealName = params.get('id');
  const meal = getMealByName(mealName);

  if (!meal) {
    document.body.innerHTML = "<p>Meal not found.</p>";
    return;
  }

  document.getElementById('meal-name').textContent = meal.name;
  document.getElementById('meal-img').src = "../"+meal.image;
  document.getElementById('meal-img').alt = meal.name;
  document.getElementById('meal-desc').textContent = meal.description;
  document.getElementById('meal-budget').textContent = meal.budget || 'Not specified';
  document.getElementById('meal-rating').textContent = meal.rating ? meal.rating + ' ⭐' : 'No rating';
  document.getElementById('meal-map').href = meal.mapLink;
  document.getElementById('meal-reason').textContent =
    meal.reason && meal.reason.trim()
      ? meal.reason
      : "It matches your craving and budget!";

  document.getElementById('detail-view-map').onclick = function() {
    window.open(meal.mapLink, '_blank');
  };
  document.getElementById('detail-share').onclick = function() {
    navigator.clipboard.writeText(meal.mapLink).then(() => {
      alert("Map link copied! Share now!");
    });
  };
  document.getElementById('detail-eat-today').onclick = function() {
    // Add to meal history (same as main.js)
    let history = JSON.parse(localStorage.getItem('mealHistory')) || [];
    history.push({ name: meal.name, date: new Date().toISOString() });
    localStorage.setItem('mealHistory', JSON.stringify(history));
    alert('Added to meal history🍱');
  };
}
