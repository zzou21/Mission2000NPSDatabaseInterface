// This file processes search by event type

document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("searchEventType");
  const display = document.getElementById("selectedEventTypeDisplay");

  select.addEventListener("change", function () {
  display.innerHTML = ""; // Clear previous display

  const selectedOptions = Array.from(select.selectedOptions);

  selectedOptions.forEach(option => {
      const pill = document.createElement("span");
      pill.className = "pill";
      pill.textContent = option.value;
      display.appendChild(pill);
  });
  });

  // Override default select behavior
  Array.from(select.options).forEach(option => {
    option.addEventListener("mousedown", function (e) {
      e.preventDefault(); // Prevent default click behavior

      // Toggle selected state manually
      option.selected = !option.selected;

      // Optionally trigger 'change' event to update pills or filters
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
    });
  });
});


(function () {
let jsonData = [];

function fetchData() {
  fetch('../dataProcessing/dataFiles/JSON/combinedData.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      jsonData = data;
      console.log("JSON data loaded:", jsonData);
    })
    .catch(error => console.error('Error fetching JSON data:', error));
}

function toggleDetails(id, caretElement) {
  const detailsDiv = document.getElementById(`details-${id}`);
  const isVisible = detailsDiv.style.display === "block";
  detailsDiv.style.display = isVisible ? "none" : "block";
  caretElement.textContent = isVisible ? "▸" : "▾";
}
window.toggleDetails = toggleDetails;

function searchByEventType() {
  const selectedTypes = Array.from(document.getElementById("searchEventType").selectedOptions).map(opt => opt.value.trim());
  if (selectedTypes.length === 0) {
    alert("Please select at least one event type.");
    return;
  }

  const resultsByType = {};

  jsonData.forEach(event => {
    const type = event["Event"]?.trim() || "Unknown";
    const dateStr = event["EventDate"];
    let year = "Unknown";
    if (dateStr) {
      const parts = dateStr.split("/");
      if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
        year = parts[2];
      }
    }
    event["ParsedYear"] = year;

    if (selectedTypes.includes(type)) {
      if (!resultsByType[type]) resultsByType[type] = {};
      if (!resultsByType[type][year]) resultsByType[type][year] = [];
      resultsByType[type][year].push(event);
    }
  });

  renderResultsByType(resultsByType);
}

function renderResultsByType(resultsByType) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (Object.keys(resultsByType).length === 0) {
    resultsDiv.innerHTML = "<p>No events found for the selected event types.</p>";
    return;
  }

  const summary = document.createElement("div");
  summary.innerHTML = "<h3>Events by Type and Year (click to expand)</h3>";
  resultsDiv.appendChild(summary);

  Object.keys(resultsByType).forEach(type => {
    const typeId = `type-${type.replace(/\s+/g, '-')}`;
    const typeDiv = document.createElement("div");
    typeDiv.classList.add("event-type-block");
    typeDiv.innerHTML = `
      <span class="caret" onclick="toggleDetails('${typeId}', this)">▸</span>
      <strong>${type}</strong>
    `;

    const yearContainer = document.createElement("div");
    yearContainer.id = `details-${typeId}`;
    yearContainer.style.display = "none";

    const sortedYears = Object.keys(resultsByType[type]).sort((a, b) => {
      const aIsYear = /^\d{4}$/.test(a);
      const bIsYear = /^\d{4}$/.test(b);
      if (aIsYear && bIsYear) return parseInt(a) - parseInt(b);
      if (!aIsYear && !bIsYear) return a.localeCompare(b);
      return aIsYear ? -1 : 1;
    });

    sortedYears.forEach(year => {
      const yearId = `${typeId}-${year}`;
      const yearDiv = document.createElement("div");
      yearDiv.innerHTML = `
        <span class="caret" onclick="toggleDetails('${yearId}', this)">▸</span>
        <strong>${year}</strong>: ${resultsByType[type][year].length} event(s)
      `;

      const eventsDiv = document.createElement("div");
      eventsDiv.id = `details-${yearId}`;
      eventsDiv.style.display = "none";

      resultsByType[type][year].forEach((event, i) => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("result-item");
        eventDiv.innerHTML = `
          <h4>Event ID: ${event["EventID"]}</h4>
          <p><strong>Place:</strong> ${event["EventPlace"] || "N/A"}</p>
          <p><strong>Date:</strong> ${event["EventDate"] || "Unknown"}</p>
          <p><strong>Type:</strong> ${event["Event"] || "Unknown"}</p>
          <p><strong>Book:</strong> ${event["Book"] || "N/A"}</p>
          <p><strong>Notes:</strong> ${event["Notes"] || "None"}</p>
          <p><strong>Credit:</strong> ${event["Credit"] || "None"}</p>
        `;

        const people = event["Person"] || [];
        if (people.length > 0) {
          const peopleList = people.map((p, index) => {
            const info = p["PersonInfo"] || {};
            const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
            const relationship = p["Relationship"] || "Unknown Role";
            const title = info["Title"] ? ` (${info["Title"]})` : "";
            const id = `${event["EventID"]}-${year}-${i}`;

            return `
              <li>
                <span class="caret" onclick="toggleDetails('${id}', this)">▸</span>
                <strong>${relationship}</strong>: ${fullName}${title}
                <div class="person-details" id="details-${id}" style="display:none; margin-left:1em; font-size:0.9em;">
                  <p><strong>Sex:</strong> ${info["Sex"] || "N/A"}</p>
                  <p><strong>Place of Birth:</strong> ${info["Placeofbirth"] || "N/A"}</p>
                  <p><strong>Place of Death:</strong> ${info["Placeofdeath"] || "N/A"}</p>
                  <p><strong>Residence:</strong> ${info["Residence"] || "N/A"}</p>
                  <p><strong>Race or Tribe:</strong> ${info["RaceorTribe"] || "N/A"}</p>
                  <p><strong>Title:</strong> ${info["Title"] || "N/A"}</p>
                  <p><strong>Place of Service:</strong> ${info["PlaceofService"] || "N/A"}</p>
                  <p><strong>Order:</strong> ${info["Order"] || "N/A"}</p>
                  <p><strong>Notes:</strong> ${info["Notes"] || "None"}</p>
                </div>
              </li>
            `;
          }).join("");

          eventDiv.innerHTML += `<p><strong>People Involved:</strong></p><ul>${peopleList}</ul>`;
        }

        eventsDiv.appendChild(eventDiv);
      });

      yearContainer.appendChild(yearDiv);
      yearContainer.appendChild(eventsDiv);
    });

    resultsDiv.appendChild(typeDiv);
    resultsDiv.appendChild(yearContainer);
  });
}

document.getElementById("searchButtonEventType").addEventListener("click", searchByEventType);
fetchData();
})();
