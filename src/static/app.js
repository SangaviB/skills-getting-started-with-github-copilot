document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

  // Clear loading message
  activitiesList.innerHTML = "";

  // Reset activity select (keep the placeholder) to avoid duplicating options on refresh
  activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list with friendly cards and cartoon SVGs
      Object.entries(activities).forEach(([name, details]) => {
        const spotsLeft = details.max_participants - details.participants.length;

        // create card
        const card = document.createElement("div");
        card.className = "activity-card";

        // simple inline SVG cartoon chooser based on name keywords
        const svg = getCartoonSVG(name);

        // Create participants list
    const participantsList = details.participants.length > 0 
      ? `<ul class="participants-list">${details.participants.map(participant => `<li><span class="participant-email">${escapeHtml(participant)}</span> <button class="participant-remove" data-activity="${escapeHtml(name)}" data-email="${escapeHtml(participant)}" aria-label="Remove ${escapeHtml(participant)}">&times;</button></li>`).join('')}</ul>` 
      : `<p>No participants signed up yet.</p>`;

        card.innerHTML = `
          <div class="activity-top">
            <div class="activity-illustration">${svg}</div>
            <div class="activity-info">
              <h4>${name}</h4>
              <p>${details.description}</p>
              <div class="activity-meta"><strong>Schedule:</strong> ${details.schedule} · <strong>Availability:</strong> ${spotsLeft} spots left</div>
            </div>
          </div>
          <div class="participants">
            <strong>Participants:</strong>
            ${participantsList}
          </div>
          <div class="card-actions">
            <button class="btn enroll" data-activity="${escapeHtml(name)}">Enroll</button>
            <button class="btn details" data-activity="${escapeHtml(name)}">Details</button>
          </div>
        `;

        activitiesList.appendChild(card);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Small helpers
  function escapeHtml(str) {
    return String(str).replace(/[&"'<>]/g, function (s) {
      return ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' }[s]);
    });
  }

  function getCartoonSVG(name) {
    const key = name.toLowerCase();
    if (key.includes('robot') || key.includes('coding') || key.includes('tech')) {
      // robot
      return `<svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="44" height="30" rx="6" fill="#90caf9"/><rect x="22" y="8" width="20" height="14" rx="4" fill="#42a5f5"/><circle cx="26" cy="30" r="3" fill="#fff"/><circle cx="38" cy="30" r="3" fill="#fff"/><rect x="28" y="40" width="8" height="5" rx="2" fill="#1976d2"/></svg>`;
    }
    if (key.includes('music') || key.includes('band') || key.includes('choir')) {
      return `<svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="18" width="14" height="36" rx="6" fill="#ffd54f"/><path d="M30 10v38l22-8V2z" fill="#ffb74d"/><circle cx="18" cy="10" r="6" fill="#fff"/></svg>`;
    }
    if (key.includes('art') || key.includes('craft') || key.includes('drawing')) {
      return `<svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="10" fill="#f48fb1"/><rect x="36" y="12" width="18" height="28" rx="6" fill="#ce93d8"/></svg>`;
    }
    if (key.includes('sport') || key.includes('soccer') || key.includes('basket')) {
      return `<svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="22" fill="#a5d6a7"/><path d="M32 10v44M10 32h44" stroke="#689f38" stroke-width="3"/></svg>`;
    }
    // default friendly star
    return `<svg viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,6 39,26 60,26 43,38 49,58 32,46 15,58 21,38 4,26 25,26" fill="#ffd54f"/></svg>`;
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the newly-registered participant appears immediately
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // Modal behavior
  const modal = document.getElementById('details-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalSchedule = document.getElementById('modal-schedule');
  const modalIllustration = document.getElementById('modal-illustration');
  const modalEnroll = document.getElementById('modal-enroll');

  // Delegate click events for dynamic buttons (Details / Enroll)
  activitiesList.addEventListener('click', (e) => {
    const detailsBtn = e.target.closest('.btn.details');
    const enrollBtn = e.target.closest('.btn.enroll');
    const removeBtn = e.target.closest('.participant-remove');
    if (detailsBtn) {
      const name = detailsBtn.dataset.activity;
      openDetails(name);
    }
    if (enrollBtn && enrollBtn.closest('.activity-card')) {
      const name = enrollBtn.dataset.activity;
      // preselect in form and scroll to signup
      activitySelect.value = name;
      document.getElementById('email').focus();
      window.scrollTo({ top: signupForm.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
    }

    if (removeBtn) {
      const activity = removeBtn.dataset.activity;
      const email = removeBtn.dataset.email;
      // confirm quickly (small prompt)
      if (!confirm(`Unregister ${email} from ${activity}?`)) return;

      // Call DELETE endpoint
      fetch(`/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      })
        .then(async (r) => {
          const body = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(body.detail || body.message || 'Failed to unregister');
          // refresh activities list to reflect change
          fetchActivities();
          // show a small success message
          messageDiv.textContent = body.message || `Removed ${email} from ${activity}`;
          messageDiv.className = 'success';
          messageDiv.classList.remove('hidden');
          setTimeout(() => messageDiv.classList.add('hidden'), 4000);
        })
        .catch((err) => {
          console.error('Error unregistering:', err);
          messageDiv.textContent = err.message || 'Failed to unregister participant.';
          messageDiv.className = 'error';
          messageDiv.classList.remove('hidden');
          setTimeout(() => messageDiv.classList.add('hidden'), 5000);
        });
    }
  });

  // Close modal when clicking elements with [data-close]
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target.closest('[data-close]')) {
      closeModal();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function openDetails(name) {
    // Try fetching a dedicated endpoint first; if it doesn't exist, fetch all activities and pick the one we want
    const singleUrl = `/activities/${encodeURIComponent(name)}`;
    fetch(singleUrl)
      .then((r) => {
        if (!r.ok) throw new Error('No single-activity endpoint');
        return r.json();
      })
      .catch(() => {
        // fallback: fetch the full list and pick the activity by name
        return fetch('/activities').then((r) => r.json()).then((all) => all[name]);
      })
      .then((details) => {
        if (!details) throw new Error('Activity details not found');
        modalTitle.textContent = name;
        modalDescription.textContent = details.description || 'No description available.';
        modalSchedule.textContent = 'Schedule: ' + (details.schedule || 'TBD');

        // render a bigger SVG for the modal and add animated class
        modalIllustration.innerHTML = getCartoonSVG(name).replace('<svg', '<svg class="animated"');

        // make enroll button target this activity
        modalEnroll.onclick = () => {
          activitySelect.value = name;
          closeModal();
          document.getElementById('email').focus();
        };

        modal.classList.remove('hidden');
        // focus the close button for accessibility
        const closeBtn = modal.querySelector('[data-close]');
        if (closeBtn) closeBtn.focus();
      })
      .catch((err) => {
        console.error('Failed to load details for', name, err);
        // show a minimal modal with a message
        modalTitle.textContent = name;
        modalDescription.textContent = 'Details are not available right now.';
        modalSchedule.textContent = '';
        modalIllustration.innerHTML = getCartoonSVG(name).replace('<svg', '<svg class="animated"');
        modal.classList.remove('hidden');
      });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modalIllustration.innerHTML = '';
  }
});
