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
        setTimeout(() => card.classList.remove('shuffle-animation'), 300);
      }
    }, 10);

    elapsed += intervalTime;
    if (elapsed >= shuffleDuration) {
      clearInterval(interval);
      const finalPick = mealData[Math.floor(Math.random() * mealData.length)];
      renderMeals([finalPick]);
      // Do NOT call trackMeal or alert here!
      setTimeout(function() {
        alert(`🎉 Try this today: ${finalPick.name}`);
      }, 500);
    }
  }, intervalTime);
}

function alertme(name){
  alert(`🎉 Try this today: ${name}`);
}


function handleOrder(name) {
  alert(`Redirecting to order page for ${name}...`);
  trackMeal(name);
  checkForRepeats(name);
}


function shareMeal(mapLink) {
  navigator.clipboard.writeText(mapLink).then(() => {
    alert("Map link copied! Share now!");
  }).catch(err => {
    console.error('Failed to copy text: ', err);
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
  return true;
}

function renderHistory() {
  const historyContent = document.getElementById('history-content');
  if (!historyContent) return;

  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const recentMeals = history
    .filter(h => (new Date() - new Date(h.date)) < 7 * 24 * 60 * 60 * 1000)
    .reverse()
    .slice(0, 5);

  // Helper to get day of week
  function getDayOfWeek(dateStr) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(dateStr);
    return days[d.getDay()];
  }

  let tableRows = recentMeals.map(h =>
    `<tr>
      <td>${h.name}</td>
      <td>${getDayOfWeek(h.date)}</td>
      <td>${new Date(h.date).toLocaleDateString()}</td>
    </tr>`
  ).join('');

  historyContent.innerHTML = `
    <table class="meal-history-table">
      <thead>
        <tr>
          <th>Meal Name</th>
          <th>Day</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="3">No meals tracked yet.</td></tr>'}
      </tbody>
    </table>
    ${suggestVarietyTip(recentMeals)}
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
      <a href="pages/meal-detail.html?id=${encodeURIComponent(meal.name)}" class="meal-card-link" style="text-decoration:none;color:inherit;">
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
          <button class="eat-today-btn" onclick="event.stopPropagation();eatThisToday('${meal.name}')">🍽️ Eat This Today!</button>
        </div>
      </a>
    `;
  });
}

// Add this function at the bottom of your main.js:
function eatThisToday(name) {
  trackMeal(name);
  alert('Added to meal history🍱');
}

