// This file searches by event and optionally search by year.

document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("searchPlace");
  const display = document.getElementById("selectedEventPlaceDisplay");

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



(function() {
let jsonData = [];


function clearMultiSelect(selectId, pillDisplayId) {
  const select = document.getElementById(selectId);
  const display = document.getElementById(pillDisplayId);

  if (select) {
    Array.from(select.options).forEach(option => {
      option.selected = false;
    });

    // Manually trigger change to update pills
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
  }

  if (display) {
    display.innerHTML = "";
  }
}


// Fetch JSON data from a file
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

// Search function to filter by EventPlace and group by year
function searchByEventPlace() {
  const selectedPlaces = Array.from(document.getElementById("searchPlace").selectedOptions)
  .map(opt => opt.value.toLowerCase());

  const yearInput = document.getElementById("searchYearEventPlace").value.trim();
  const results = [];
  const yearCounts = {};

  // Validate year input (must be blank or 4 digits)
  if (yearInput && !/^\d{4}$/.test(yearInput)) {
    alert("Please enter a valid 4-digit year (e.g., 1702) or leave it blank to show all years.");
    return;
  }

  jsonData.forEach(item => {
    const eventPlace = (item["EventPlace"] || "").toLowerCase();
    const dateStr = item["EventDate"];
    let year = "Unknown";

    if (dateStr) {
      const parts = dateStr.split("/");
      if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
        year = parts[2];
      }
    }

    item["ParsedYear"] = year;

    const matchPlace = selectedPlaces.length === 0 || selectedPlaces.some(p => eventPlace.includes(p));

    const matchYear = !yearInput || year === yearInput;

    if (matchPlace && matchYear) {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      results.push(item);
    }
  });

  results.sort((a, b) => {
    const yearA = /^\d{4}$/.test(a["ParsedYear"]) ? parseInt(a["ParsedYear"]) : Infinity;
    const yearB = /^\d{4}$/.test(b["ParsedYear"]) ? parseInt(b["ParsedYear"]) : Infinity;
    return yearA - yearB;
  });

  renderResults(results, yearCounts);
  clearMultiSelect("searchPlace", "selectedEventPlaceDisplay");
  document.getElementById("searchYearEventPlace").value = ""; // Optional: clear year input too

}

// Toggle function for showing/hiding person detail
function toggleDetails(id, caretElement) {
  const detailsDiv = document.getElementById(`details-${id}`);
  const isVisible = detailsDiv.style.display === "block";
  detailsDiv.style.display = isVisible ? "none" : "block";
  caretElement.textContent = isVisible ? "▸" : "▾";
}

// Render search results and yearly summary
function renderResults(results, yearCounts) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  const selectedPlaces = Array.from(document.getElementById("searchPlace").selectedOptions)
    .map(opt => opt.value)
    .join(", ") || "All Locations";

  const yearInput = document.getElementById("searchYearEventPlace").value.trim() || "All Years";

  const description = document.createElement("div");
  description.innerHTML = `<h3>Results for: <em>${selectedPlaces}</em> in <em>${yearInput}</em></h3>`;
  resultsDiv.appendChild(description);


  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No events found for that location.</p>";
    return;
  }

  // Group events by year
  const eventsByYear = {};
  results.forEach(event => {
    const year = event["ParsedYear"];
    if (!eventsByYear[year]) {
      eventsByYear[year] = [];
    }
    eventsByYear[year].push(event);
  });

  // Sort years (real years first, "Unknown" last)
  const sortedYears = Object.keys(eventsByYear).sort((a, b) => {
    const aIsYear = /^\d{4}$/.test(a);
    const bIsYear = /^\d{4}$/.test(b);
    if (aIsYear && bIsYear) return parseInt(a) - parseInt(b);
    if (!aIsYear && !bIsYear) return a.localeCompare(b);
    return aIsYear ? -1 : 1;
  });

  // Create summary header
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

    // Add individual event cards under this year
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
          const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
          const relationship = p["Relationship"] || "Unknown Role";
          const title = info["Title"] ? ` (${info["Title"]})` : "";
          const id = `${event["EventID"]}-${eventIndex}-${i}`;

          const details = `
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
              <p><strong>Date of birth:</strong> ${info["Dateofbirth"] || "None"}</p>
              <p><strong>Date of death:</strong> ${info["Dateofdeath"] || "None"}</p>

            </div>
          `;

          return `
            <li>
              <span class="caret" onclick="toggleDetails('${id}', this)">▸</span>
              <strong>${relationship}</strong>: ${fullName}${title}
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

// Add event listeners for the search button and enter key
document.getElementById("searchEventPlaceButton").addEventListener("click", searchByEventPlace);
document.getElementById("searchYearEventPlace").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchByEventPlace();
  }
});

fetchData();
})();
