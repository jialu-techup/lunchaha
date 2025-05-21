let mealData = [];

fetch('./data/meals.json')
  .then(res => res.json())
  .then(data => {
    console.log("loading meals data")
    mealData = data;
    renderMeals(mealData);
    renderHistory(); // Render history on load
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

function handleOrder(name) {
  alert(`Redirecting to order page for ${name}...`);
  trackMeal(name);
  checkForRepeats(name);
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
  renderHistory();
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

function renderHistory() {
  const historyContent = document.getElementById('history-content');
  if (!historyContent) return;

  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const recentMeals = history
    .filter(h => (new Date() - new Date(h.date)) < 7 * 24 * 60 * 60 * 1000)
    .map(h => `<li>${h.name} – ${new Date(h.date).toLocaleDateString()}</li>`)
    .reverse()
    .slice(0, 5);

  historyContent.innerHTML = `
    <ul>${recentMeals.length > 0 ? recentMeals.join('') : '<li>No meals tracked yet.</li>'}</ul>
    ${suggestVarietyTip(history)}
  `;
}

function suggestVarietyTip(history) {
  const counts = {};
  history.forEach(entry => {
    const day = entry.name;
    counts[day] = (counts[day] || 0) + 1;
  });

  const repeated = Object.entries(counts).filter(([_, count]) => count >= 3);
  if (repeated.length > 0) {
    return `<p>Reminder: You’ve had <strong>${repeated[0][0]}</strong> ${repeated[0][1]} times recently. Try something new tomorrow!</p>`;
  }
  return '';
}

// Toggle history section
document.addEventListener('DOMContentLoaded', () => {
  const historyToggle = document.getElementById('history-toggle');
  const historyContent = document.getElementById('history-content');

  if (historyToggle && historyContent) {
    historyToggle.addEventListener('click', () => {
      historyContent.style.display = historyContent.style.display === 'none' ? 'block' : 'none';
    });
  }
});

// Google Map Init
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

console.log("JS file is successfully linked!");

function toggleSubFilter(type) {
  const sections = ['diet', 'base', 'crave', 'budget'];
  sections.forEach(section => {
    const el = document.getElementById(`${section}-filters`);
    if (section === type) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    } else {
      el.style.display = 'none';
    }
  });
}

function applySingleFilter(type, value) {
  const filtered = mealData.filter(meal => {
    const field = meal[type];
    if (Array.isArray(field)) {
      return field.includes(value);
    } else {
      return field === value;
    }
  });
  renderMeals(filtered);
}

function renderMeals(meals) {
  const container = document.getElementById('meal-container');
  container.innerHTML = '';

  if (meals.length === 0) {
    container.innerHTML = `<p>No meals found. Try a different filter!</p>`;
    return;
  }

  meals.forEach(meal => {
    container.innerHTML += `
      <div class="meal-card">
        <img src="${meal.image}" alt="${meal.name}">
        <h4>${meal.name}</h4>
        <p>${meal.description}</p>
        <button class="pickup-btn" onclick="alert('Ordering ${meal.name}...')">Order & Pick Up</button>
        <button onclick="shareMeal('${meal.name}')">📤 Share</button>
      </div>
    `;
  });
}
