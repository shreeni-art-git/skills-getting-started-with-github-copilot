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

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const card = document.createElement("div");
        card.className = "activity-card";

        // Participants list with delete icon
        const participantsHtml = details.participants.map(email => `
          <li class="participant-item">
            <span>${email}</span>
            <button class="delete-btn" title="Remove participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}">&#128465;</button>
          </li>
        `).join('');

        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Available Spots:</strong> ${details.max_participants - details.participants.length} of ${details.max_participants}</p>
          <div class="participants">
            <h5>Current Participants:</h5>
            <ul class="participants-list">
              ${participantsHtml}
            </ul>
          </div>
        `;

        activitiesList.appendChild(card);

        // Add option to select
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const activity = decodeURIComponent(btn.getAttribute('data-activity'));
          const email = decodeURIComponent(btn.getAttribute('data-email'));
          if (confirm(`Remove ${email} from ${activity}?`)) {
            await unregisterParticipant(activity, email);
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Unregister participant function
  async function unregisterParticipant(activity, email) {
    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        fetchActivities();
      } else {
        alert("Failed to remove participant.");
      }
    } catch (err) {
      alert("Error removing participant.");
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;
    const messageDiv = document.getElementById("message");

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        messageDiv.className = "message success";
        messageDiv.textContent = `Successfully signed up for ${activity}!`;
        // Reload activities to show updated participants
        fetchActivities();
      } else {
        messageDiv.className = "message error";
        messageDiv.textContent = "Error signing up for activity";
      }
    } catch (error) {
      messageDiv.className = "message error";
      messageDiv.textContent = "Error connecting to server";
    }
  });

  // Load activities when page loads
  fetchActivities();
});
