// This file searches by the tribal affiliation of each individual.

document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("searchTribe");
  const display = document.getElementById("selectedTribesDisplay");

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

function searchByTribalAffiliation() {
  const selectedTribes = Array.from(document.getElementById("searchTribe").selectedOptions).map(opt => opt.value.trim());
  const yearInput = document.getElementById("searchYearTribeAffiliation").value.trim();

  if (yearInput && !/^\d{4}$/.test(yearInput)) {
    alert("Please enter a valid 4-digit year (e.g., 1741) or leave it blank.");
    return;
  }

  const yearPersonEventMap = {};

  jsonData.forEach(event => {
    const dateStr = event["EventDate"];
    let year = "Unknown";
    if (dateStr) {
      const parts = dateStr.split("/");
      if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
        year = parts[2];
      }
    }
    if (yearInput && year !== yearInput) return;

    const people = event["Person"] || [];
    people.forEach(person => {
      const tribe = person?.PersonInfo?.RaceorTribe?.trim() || "Unknown";
      if (!selectedTribes.includes(tribe)) return;

      const key = `${year}||${person.Personal_ID}`;
      if (!yearPersonEventMap[key]) {
        yearPersonEventMap[key] = {
          year,
          person,
          events: []
        };
      }
      yearPersonEventMap[key].events.push(event);
    });
  });

  const groupedByYear = {};
  Object.values(yearPersonEventMap).forEach(entry => {
    const year = entry.year;
    if (!groupedByYear[year]) groupedByYear[year] = [];
    groupedByYear[year].push(entry);
  });

  renderResultsByPerson(groupedByYear);
  clearMultiSelect("searchTribe", "selectedTribesDisplay")
}

function renderResultsByPerson(groupedByYear) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
    const selectedPlaces = Array.from(document.getElementById("searchTribe").selectedOptions)
    .map(opt => opt.value)
    .join(", ") || "All Tribal Affiliations";

  const yearInput = document.getElementById("searchYearTribeAffiliation").value.trim() || "All Years";

  const description = document.createElement("div");
  description.innerHTML = `<h3>Results for: <em>${selectedPlaces}</em> in <em>${yearInput}</em></h3>`;
  resultsDiv.appendChild(description);


  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No events found for that tribal affiliation.</p>";
    return;
  }


  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    const isNumA = /^\d{4}$/.test(a);
    const isNumB = /^\d{4}$/.test(b);
    if (isNumA && isNumB) return parseInt(a) - parseInt(b);
    if (!isNumA && !isNumB) return a.localeCompare(b);
    return isNumA ? -1 : 1;
  });

  if (sortedYears.length === 0) {
    resultsDiv.innerHTML = "<p>No people found for the selected tribal affiliation(s).</p>";
    return;
  }

  const summary = document.createElement("div");
  summary.innerHTML = "<h3>People by Year (click to expand)</h3>";
  resultsDiv.appendChild(summary);

  sortedYears.forEach(year => {
    const people = groupedByYear[year];
    const caretId = `year-${year}`;
    const caret = document.createElement("div");
    caret.classList.add("year-caret");
    caret.innerHTML = `
      <span class="caret" onclick="toggleDetails('${caretId}', this)">▸</span>
      <strong>${year}</strong>: ${people.length} person(s)
    `;

    const personList = document.createElement("div");
    personList.id = `details-${caretId}`;
    personList.style.display = "none";

    people.forEach((entry, index) => {
      const p = entry.person;
      const info = p["PersonInfo"] || {};
      const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
      const tribe = info["RaceorTribe"] || "Unknown";
      const relationship = p["Relationship"] || "Unknown Role";
      const title = info["Title"] ? ` (${info["Title"]})` : "";
      const personId = `${year}-${index}`;

      const personDiv = document.createElement("div");
      personDiv.classList.add("result-item");
      personDiv.innerHTML = `
        <h4>${relationship}: ${fullName}${title} <span style="color:green;">(${tribe})</span></h4>
        <div style="margin-left:1em; font-size:0.9em; margin-bottom: 0.5em;">
          <p><strong>Sex:</strong> ${info["Sex"] || "N/A"}</p>
          <p><strong>Place of Birth:</strong> ${info["Placeofbirth"] || "N/A"}</p>
          <p><strong>Place of Death:</strong> ${info["Placeofdeath"] || "N/A"}</p>
          <p><strong>Residence:</strong> ${info["Residence"] || "N/A"}</p>
          <p><strong>Race or Tribe:</strong> ${tribe}</p>
          <p><strong>Title:</strong> ${info["Title"] || "N/A"}</p>
          <p><strong>Place of Service:</strong> ${info["PlaceofService"] || "N/A"}</p>
          <p><strong>Order:</strong> ${info["Order"] || "N/A"}</p>
          <p><strong>Notes:</strong> ${info["Notes"] || "None"}</p>
          <p><strong>Date of birth:</strong> ${info["Dateofbirth"] || "None"}</p>
          <p><strong>Date of death:</strong> ${info["Dateofdeath"] || "None"}</p>

        </div>
      `;


      const eventDetails = document.createElement("ul");
      eventDetails.style.marginTop = "0.5em";

      entry.events.forEach(evt => {
        const evtInfoWrapper = document.createElement("li");
        evtInfoWrapper.style.marginBottom = "0.5em";

        const eventMeta = `
          <strong>Event ID:</strong> ${evt["EventID"]} |
          <strong>Type:</strong> ${evt["Event"] || "Unknown"} |
          <strong>Date:</strong> ${evt["EventDate"] || "Unknown"} |
          <strong>Place:</strong> ${evt["EventPlace"] || "N/A"} |
          <strong>Book:</strong> ${evt["Book"] || "N/A"} |
          <strong>Credit:</strong> ${evt["Credit"] || "None"}
        `;

        evtInfoWrapper.innerHTML = eventMeta;

        const others = evt["Person"]
          .filter(other => other.Personal_ID !== p.Personal_ID)
          .map((other, idx) => {
            const oInfo = other["PersonInfo"] || {};
            const oName = [oInfo["Givenname"], oInfo["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
            const oRole = other["Relationship"] || "Unknown Role";
            const oTribe = oInfo["RaceorTribe"] || "Unknown";

            return `
              <details style="margin-top: 0.25em; margin-left: 1em;">
                <summary><strong>${oRole}</strong>: ${oName} (${oTribe})</summary>
                <div style="font-size: 0.85em; margin-left: 1em;">
                  <p><strong>Sex:</strong> ${oInfo["Sex"] || "N/A"}</p>
                  <p><strong>Place of Birth:</strong> ${oInfo["Placeofbirth"] || "N/A"}</p>
                  <p><strong>Place of Death:</strong> ${oInfo["Placeofdeath"] || "N/A"}</p>
                  <p><strong>Residence:</strong> ${oInfo["Residence"] || "N/A"}</p>
                  <p><strong>Race or Tribe:</strong> ${oTribe}</p>
                  <p><strong>Title:</strong> ${oInfo["Title"] || "N/A"}</p>
                  <p><strong>Place of Service:</strong> ${oInfo["PlaceofService"] || "N/A"}</p>
                  <p><strong>Order:</strong> ${oInfo["Order"] || "N/A"}</p>
                  <p><strong>Notes:</strong> ${oInfo["Notes"] || "None"}</p>
                  <p><strong>Date of birth:</strong> ${info["Dateofbirth"] || "None"}</p>
                  <p><strong>Date of death:</strong> ${info["Dateofdeath"] || "None"}</p>
                </div>
              </details>
            `;
          }).join("");

        if (others.length > 0) {
          const wrapper = document.createElement("div");
          wrapper.innerHTML = `<p style="margin-top: 0.25em;"><em>Other people involved:</em></p>${others}`;
          evtInfoWrapper.appendChild(wrapper);
        }

        eventDetails.appendChild(evtInfoWrapper);
      });

      personDiv.appendChild(eventDetails);
      personList.appendChild(personDiv);
    });

    resultsDiv.appendChild(caret);
    resultsDiv.appendChild(personList);
  });
}

document.getElementById("searchButtonTribeAffiliation").addEventListener("click", searchByTribalAffiliation);
fetchData();
})();