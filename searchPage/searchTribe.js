// This file searches by the tribal affiliation of each individual.

// Display selected tribal affiliations as tags
document.addEventListener("DOMContentLoaded", function () {
  const tribeSelect = document.getElementById("searchTribe");
  const displayDiv = document.getElementById("selectedTribesDisplay");

  function updateDisplay() {
    const selected = Array.from(tribeSelect.selectedOptions).map(opt => opt.value);
    displayDiv.innerHTML = "";

    if (selected.length === 0) {
      displayDiv.innerHTML = "<em>No tribal affiliations selected.</em>";
      return;
    }

    selected.forEach(tribe => {
      const tag = document.createElement("span");
      tag.textContent = tribe;
      tag.style.cssText = `
        display: inline-block;
        margin: 2px 5px;
        padding: 5px 10px;
        background: #eee;
        border-radius: 15px;
        font-size: 0.9em;
      `;
      displayDiv.appendChild(tag);
    });
  }

  tribeSelect.addEventListener("change", updateDisplay);
  updateDisplay();
});

(function (){

let jsonData = [];

function fetchData() {
  fetch('../dataProcessing/dataFiles/JSON/combinedData.json')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
      return response.json();
    })
    .then(data => {
      jsonData = data;
      console.log("JSON data loaded:", jsonData);
    })
    .catch(error => console.error('Error fetching JSON data:', error));
}

// Main search function
function searchByTribalAffiliation() {
  const selectedTribes = Array.from(document.getElementById("searchTribe").selectedOptions)
    .map(opt => opt.value.trim());
  const yearInput = document.getElementById("searchYearTribeAffiliation").value.trim();
  const results = [];
  const yearCounts = {};

  if (yearInput && !/^\d{4}$/.test(yearInput)) {
    alert("Please enter a valid 4-digit year (e.g., 1741) or leave it blank to search all years.");
    return;
  }

  jsonData.forEach(event => {
    const dateStr = event["EventDate"];
    let year = "Unknown";
    if (dateStr) {
      const parts = dateStr.split("/");
      if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
        year = parts[2];
      }
    }
    event["ParsedYear"] = year;

    const matchYear = !yearInput || year === yearInput;

    const people = event["Person"] || [];
    const matchTribe = people.some(person => {
      const tribe = person?.PersonInfo?.RaceorTribe?.trim() || "Unknown";
      return selectedTribes.includes(tribe);
    });

    if (matchTribe && matchYear) {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      results.push(event);
    }
  });

  results.sort((a, b) => {
    const yearA = /^\d{4}$/.test(a["ParsedYear"]) ? parseInt(a["ParsedYear"]) : Infinity;
    const yearB = /^\d{4}$/.test(b["ParsedYear"]) ? parseInt(b["ParsedYear"]) : Infinity;
    return yearA - yearB;
  });

  renderResults(results, yearCounts, selectedTribes);
}

// Show/hide person details toggle
function toggleDetails(id, caretElement) {
  const detailsDiv = document.getElementById(`details-${id}`);
  const isVisible = detailsDiv.style.display === "block";
  detailsDiv.style.display = isVisible ? "none" : "block";
  caretElement.textContent = isVisible ? "▸" : "▾";
}
window.toggleDetails = toggleDetails;

// Renders results grouped by year
function renderResults(results, yearCounts, selectedTribes) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No events found for the selected tribal affiliation(s).</p>";
    return;
  }

  const eventsByYear = {};
  results.forEach(event => {
    const year = event["ParsedYear"];
    if (!eventsByYear[year]) eventsByYear[year] = [];
    eventsByYear[year].push(event);
  });

  const sortedYears = Object.keys(eventsByYear).sort((a, b) => {
    const aIsYear = /^\d{4}$/.test(a);
    const bIsYear = /^\d{4}$/.test(b);
    if (aIsYear && bIsYear) return parseInt(a) - parseInt(b);
    if (!aIsYear && !bIsYear) return a.localeCompare(b);
    return aIsYear ? -1 : 1;
  });

  const summary = document.createElement("div");
  summary.innerHTML = "<h3>Events per Year (click to expand)</h3>";
  resultsDiv.appendChild(summary);

  sortedYears.forEach(year => {
    const caretId = `year-${year}`;
    const caret = document.createElement("div");
    caret.classList.add("year-caret");
    caret.innerHTML = `
      <span class="caret" onclick="toggleDetails('${caretId}', this)">▸</span>
      <strong>${year}</strong>: ${eventsByYear[year].length} event(s)
    `;

    const eventList = document.createElement("div");
    eventList.id = `details-${caretId}`;
    eventList.style.display = "none";

    eventsByYear[year].forEach((event, eventIndex) => {
      const div = document.createElement("div");
      div.classList.add("result-item");
      div.innerHTML = `
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
        const peopleList = people.map((p, i) => {
          const info = p["PersonInfo"] || {};
          const tribe = info["RaceorTribe"]?.trim() || "Unknown";
          const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
          const relationship = p["Relationship"] || "Unknown Role";
          const title = info["Title"] ? ` (${info["Title"]})` : "";
          const id = `${event["EventID"]}-${eventIndex}-${i}`;
          const highlight = selectedTribes.includes(tribe) ? `<strong style="color:green;"> (Matched Tribe)</strong>` : "";

          const details = `
            <div class="person-details" id="details-${id}" style="display:none; margin-left:1em; font-size:0.9em;">
              <p><strong>Sex:</strong> ${info["Sex"] || "N/A"}</p>
              <p><strong>Place of Birth:</strong> ${info["Placeofbirth"] || "N/A"}</p>
              <p><strong>Place of Death:</strong> ${info["Placeofdeath"] || "N/A"}</p>
              <p><strong>Residence:</strong> ${info["Residence"] || "N/A"}</p>
              <p><strong>Race or Tribe:</strong> ${tribe}</p>
              <p><strong>Title:</strong> ${info["Title"] || "N/A"}</p>
              <p><strong>Place of Service:</strong> ${info["PlaceofService"] || "N/A"}</p>
              <p><strong>Order:</strong> ${info["Order"] || "N/A"}</p>
              <p><strong>Notes:</strong> ${info["Notes"] || "None"}</p>
            </div>
          `;

          return `
            <li>
              <span class="caret" onclick="toggleDetails('${id}', this)">▸</span>
              <strong>${relationship}</strong>: ${fullName}${title} ${highlight}
              ${details}
            </li>
          `;
        }).join("");

        div.innerHTML += `<p><strong>People Involved:</strong></p><ul>${peopleList}</ul>`;
      }

      eventList.appendChild(div);
    });

    resultsDiv.appendChild(caret);
    resultsDiv.appendChild(eventList);
  });
}

// Register event listener for tribe-based search
document.getElementById("searchButtonTribeAffiliation").addEventListener("click", searchByTribalAffiliation);

// Load data on page load
fetchData();

})();