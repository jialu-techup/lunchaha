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

/*function justPickForMe() {
  const random = mealData[Math.floor(Math.random() * mealData.length)];
  alert(`Try this today: ${random.name}`);
  renderMeals([random]);
  trackMeal(random.name);
  checkForRepeats(random.name);
} */

  function justPickForMe() {
  const shuffleDuration = 2000; // 2 seconds
  const intervalTime = 100;
  let elapsed = 0;
  let interval;

  const container = document.getElementById('meal-container');
  container.innerHTML = '<p>🔄 Finding your perfect lunch match...</p>';

  interval = setInterval(() => {
    const random = mealData[Math.floor(Math.random() * mealData.length)];
    renderMeals([random]);

    // Add shuffle animation class
    setTimeout(() => {
      const card = document.querySelector('.meal-card');
      if (card) {
        card.classList.add('shuffle-animation');
        // Remove class after animation so it can re-trigger on next render
        setTimeout(() => card.classList.remove('shuffle-animation'), 300);
      }
    }, 10); // Wait until DOM updates

    elapsed += intervalTime;
    if (elapsed >= shuffleDuration) {
      clearInterval(interval);
      const finalPick = mealData[Math.floor(Math.random() * mealData.length)];
      renderMeals([finalPick]);
      alert(`🎉 Try this today: ${finalPick.name}`);
      trackMeal(finalPick.name);
      checkForRepeats(finalPick.name);
    }
  }, intervalTime);
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
  const tagCraveHTML = (meal["crave"] || []).map(tag =>
    `<span class="tag-pill tag-${tag.toLowerCase().replace(/\s+/g, '')}">${tag}</span>`
  ).join('');

  const tagBaseHTML = (meal.base || []).map(tag =>
    `<span class="tag-pill tag-${tag.toLowerCase().replace(/\s+/g, '').replace('/', '')}">${tag}</span>`
  ).join('');

  const tagDietHTML = (meal.diet || []).map(tag =>
    `<span class="tag-pill tag-${tag.toLowerCase().replace(/\s+/g, '')}">${tag}</span>`
  ).join('');

  const tagBudgetHTML = [`${meal.budget}`].map(tag =>
    `<span class="tag-pill tag-${tag.toLowerCase().replace(/\s+/g, '')}">${tag}</span>`
  ).join('');

container.innerHTML += `
  <div class="meal-card">
    <div class="image-wrapper">
      <img src="${meal.image}" alt="${meal.name}">
      <div class="tag-overlay top-left">${tagBaseHTML}</div>
      <div class="tag-overlay bottom-right">${tagBudgetHTML}</div>
      <div class="tag-overlay bottom-left">${tagCraveHTML}</div>
      <div class="tag-overlay top-right">${tagDietHTML}</div>
    </div>
    <h4>${meal.name}</h4>
    <p>${meal.description}</p>
    <button class="view-map-btn" onclick="viewMap('${meal.mapLink}')">📍 View Map</button>
    <button onclick="shareMeal('${meal.name}')">📤 Share</button>
  </div>
`;
})
}

function viewMap(mapUrl) {
  window.open(mapUrl, '_blank'); // Opens in a new tab
}
