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
  // Exclude meals that have appeared 3 or more times in the last 7 days
  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const recentHistory = history.filter(h => (new Date() - new Date(h.date)) < 7 * 24 * 60 * 60 * 1000);
  const mealCounts = {};
  recentHistory.forEach(entry => {
    const key = entry.name.toLowerCase().trim();
    mealCounts[key] = (mealCounts[key] || 0) + 1;
  });
  // Only include meals that have appeared less than 3 times
  const eligibleMeals = mealData.filter(meal => {
    const key = meal.name.toLowerCase().trim();
    return !mealCounts[key] || mealCounts[key] < 3;
  });

  const shuffleDuration = 2000; // 2 seconds
  const intervalTime = 100;
  let elapsed = 0;
  let interval;

  const container = document.getElementById('meal-container');
  container.innerHTML = '<p>🔄 Finding your perfect lunch match...</p>';

  interval = setInterval(() => {
    if (eligibleMeals.length === 0) {
      container.innerHTML = '<p>No eligible meals found. Try clearing your history or eating something new!</p>';
      clearInterval(interval);
      return;
    }
    const random = eligibleMeals[Math.floor(Math.random() * eligibleMeals.length)];
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
      const finalPick = eligibleMeals[Math.floor(Math.random() * eligibleMeals.length)];
      renderMeals([finalPick]);
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
  const normalize = str => str.toLowerCase().replace(/[^\w\s]/gi, '').trim();

  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const recent = history.filter(h => {
    const date = new Date(h.date);
    return (new Date() - date) < 7 * 24 * 60 * 60 * 1000 &&
           normalize(h.name) === normalize(name);
  });

  // Select the tip paragraph from the DOM
  const tipElement = document.getElementById('meal-tip');

  if (recent.length >= 3) {
    const message = `You’ve had <strong>${name}</strong> ${recent.length} times this week — maybe try something different today! 🌱`;
    if (tipElement) {
      tipElement.innerHTML = `<em>Tip:</em> ${message}`;
    } else {
      alert(`You've had ${name} ${recent.length} times this week. How about mixing it up?`);
    }
  } else if (tipElement) {
    // Clear previous tip if no issue
    tipElement.innerHTML = `<em>Tip:</em> You're doing great with variety! 🎉`;
  }

  return true;
  
}



function renderHistory() {
  const tableBody = document.getElementById('meal-log-table');
  const tipElement = document.getElementById('meal-tip');
  if (!tableBody) return;

  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const recentMeals = history
    .filter(h => (new Date() - new Date(h.date)) < 7 * 24 * 60 * 60 * 1000)
    .reverse()
    .slice(0, 5);

  // Clear the current table content
  tableBody.innerHTML = '';

  if (recentMeals.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3">No meals tracked yet.</td></tr>`;
    if (tipElement) tipElement.innerHTML = `<em>Tip:</em> You're doing great with variety! 🎉`;
    return;
  }

  for (let meal of recentMeals) {
    const date = new Date(meal.date);
    const day = date.toLocaleDateString('en-SG', { weekday: 'short' });
    const formattedDate = date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${day}</td>
      <td>${formattedDate}</td>
      <td>${meal.name}</td>
    `;
    tableBody.appendChild(row);
  }

  // Check for any meal eaten 3 or more times in the last 5 lunches
  const mealCounts = {};
  recentMeals.forEach(entry => {
    const key = entry.name.toLowerCase().trim();
    mealCounts[key] = (mealCounts[key] || 0) + 1;
  });
  if (tipElement) {
    const repeated = Object.entries(mealCounts).find(([_, count]) => count >= 3);
    if (repeated) {
      tipElement.innerHTML = `<em>Tip:</em> You’ve had <strong>${repeated[0]}</strong> ${repeated[1]} times recently — maybe try something different for your next lunch! 🌱`;
    } else {
      tipElement.innerHTML = `<em>Tip:</em> You're doing great with variety! 🎉`;
    }
  }
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
        <button class="find-out-more-btn" onclick="window.location.href='pages/meal-detail.html?id=${encodeURIComponent(meal.name)}';event.stopPropagation();">🔎 Find Out More</button>
      </div>
    `;
  });
}

// Add this function at the bottom of your main.js:
function eatThisToday(name) {
  // Count how many times this meal appears in the last 5 lunches (before this click)
  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const normalized = n => n.toLowerCase().trim();
  const recentMeals = history
    .filter(h => (new Date() - new Date(h.date)) < 7 * 24 * 60 * 60 * 1000)
    .reverse()
    .slice(0, 4); // Only last 4, since this click will be the 5th
  const count = recentMeals.filter(m => normalized(m.name) === normalized(name)).length;

  // Add the new meal to history
  trackMeal(name);

  // Use the most recent matching meal's name for display (preserves original case)
  let displayName = name;
  for (let m of recentMeals) {
    if (normalized(m.name) === normalized(name)) {
      displayName = m.name;
      break;
    }
  }

  if (count >= 3) {
    setTimeout(() => {
      alert(`You’ve had ${displayName} ${count + 1} times recently — how about switching things up for lunch today? 🌱`);
    }, 100);
  } else {
    setTimeout(() => {
      alert('Added to lunch history 📅');
    }, 100);
  }
}

