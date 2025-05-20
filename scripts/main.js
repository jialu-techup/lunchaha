let mealData = [];

fetch('./data/meals.json')
  .then(res => res.json())
  .then(data => {
    mealData = data;
    renderMeals(mealData);
  });

function applyFilters() {
  const selected = document.querySelectorAll('.filter:checked');
  const filters = {};

  selected.forEach(input => {
    const type = input.dataset.type;
    if (!filters[type]) filters[type] = [];
    filters[type].push(input.value);
  });

  const filteredMeals = mealData.filter(meal => {
    return Object.keys(filters).every(type => {
      return filters[type].some(value => meal[type]?.includes(value));
    });
  });

  renderMeals(filteredMeals);
}

function justPickForMe() {
  const random = mealData[Math.floor(Math.random() * mealData.length)];
  alert(`Try this today: ${random.name}`);
  renderMeals([random]);
  trackMeal(random.name);
  checkForRepeats(random.name);
}

function renderMeals(meals) {
  const container = document.getElementById('meal-container');
  container.innerHTML = '';
  meals.forEach(meal => {
    container.innerHTML += `
      <div class="meal-card">
        <img src="${meal.image}" alt="${meal.name}">
        <h4>${meal.name}</h4>
        <p>${meal.description}</p>
        <button class="pickup-btn" onclick="alert('Redirecting to order page for ${meal.name}...')">Order & Pick Up</button>
        <button onclick="shareMeal('${meal.name}')">📤 Share</button>
      </div>
    `;
    trackMeal(meal.name);
    checkForRepeats(meal.name);
  });
}

function shareMeal(name) {
  const shareURL = `https://lunch-aha-app.com/?meal=${encodeURIComponent(name)}`;
  navigator.clipboard.writeText(shareURL).then(() => {
    alert("Link copied! Share it with your team.");
  });
}

function trackMeal(name) {
  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  history.push({ name, date: new Date().toISOString() });
  localStorage.setItem('mealHistory', JSON.stringify(history));
}

function checkForRepeats(name) {
  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const recent = history.filter(h => {
    const date = new Date(h.date);
    return (new Date() - date) < 7 * 24 * 60 * 60 * 1000 && h.name === name;
  });
  if (recent.length >= 3) {
    alert(`You've had ${name} ${recent.length} times this week. How about mixing it up?`);
  }
}

function initMap() {
  const mbc = { lat: 1.2766, lng: 103.7918 }; // Mapletree Business City
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: mbc,
  });
  new google.maps.Marker({
    position: mbc,
    map: map,
    title: "Lunch Spot!"
  });
}
