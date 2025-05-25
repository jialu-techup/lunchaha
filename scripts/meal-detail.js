let meals = [];

fetch('../data/meals.json')
  .then(response => {
    if (!response.ok) throw new Error("Failed to load meals data");
    return response.json();
  })
  .then(data => {
    meals = data;
    loadMealDetails();
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

  // Nudge logic: check if this meal has been eaten 3+ times in the last 4 lunches
  const history = JSON.parse(localStorage.getItem('mealHistory')) || [];
  const normalized = n => n.toLowerCase().trim();
  const recentMeals = history
    .filter(h => (new Date() - new Date(h.date)) < 7 * 24 * 60 * 60 * 1000)
    .reverse()
    .slice(0, 5); // last 5 lunches
  const count = recentMeals.filter(m => normalized(m.name) === normalized(meal.name)).length;
  let displayName = meal.name;
  for (let m of recentMeals) {
    if (normalized(m.name) === normalized(meal.name)) {
      displayName = m.name;
      break;
    }
  }
  const nudgeDiv = document.getElementById('meal-nudge');
  if (count >= 3 && nudgeDiv) {
    nudgeDiv.innerHTML = `You’ve had <strong>${displayName}</strong> ${count} times recently — how about switching things up for lunch today? 🌱`;
    nudgeDiv.style.background = '#fffbe0';
    nudgeDiv.style.color = '#e1701a';
    nudgeDiv.style.padding = '8px 16px';
    nudgeDiv.style.borderRadius = '16px';
    nudgeDiv.style.fontWeight = '600';
    nudgeDiv.style.boxShadow = '0 2px 8px rgba(255,179,71,0.10)';
    nudgeDiv.style.fontSize = '1rem';
    nudgeDiv.style.maxWidth = '320px';
    nudgeDiv.style.textAlign = 'right';
  } else if (nudgeDiv) {
    nudgeDiv.innerHTML = '';
  }

  document.getElementById('meal-img').src = "../" + meal.image;
  document.getElementById('meal-img').alt = meal.name;
  document.getElementById('meal-desc').textContent = meal.description;
  document.getElementById('meal-budget').textContent = meal.budget || 'Not specified';
  document.getElementById('meal-rating').textContent = meal.rating ? meal.rating + ' ⭐' : 'No rating';
  document.getElementById('meal-reason').textContent =
    meal.reason && meal.reason.trim()
      ? meal.reason
      : "It matches your craving and budget!";
  document.getElementById('meal-location').textContent = meal.location || 'Not specified';

  // View Map button: open Google Maps link in new tab
  const viewMapBtn = document.getElementById('detail-view-map');
  if (viewMapBtn) {
    viewMapBtn.onclick = function () {
      if (meal.mapLink) {
        window.open(meal.mapLink, '_blank', 'noopener');
      } else {
        alert('No map link available for this meal.');
      }
    };
  }

  // Share button: copy Google Maps link to clipboard
  const shareBtn = document.getElementById('detail-share');
  if (shareBtn) {
    shareBtn.onclick = function () {
      if (meal.mapLink) {
        navigator.clipboard.writeText(meal.mapLink)
          .then(() => {
            alert("Map link copied! You can now paste it to share.");
          })
          .catch(() => {
            alert("Failed to copy the link. Please try again.");
          });
      } else {
        alert('No map link available to share.');
      }
    };
  }
}
