(function () {
  let jsonData = [];

  // Utility: Clear multi-select and pills
  function clearMultiSelect(selectId, pillDisplayId) {
    const select = document.getElementById(selectId);
    const display = document.getElementById(pillDisplayId);

    if (select) {
      Array.from(select.options).forEach(option => {
        option.selected = false;
      });
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
    }

    if (display) {
      display.innerHTML = "";
    }
  }

  // Handle select-pill display for combined search
  ["combinedPlace", "combinedSearchEventType", "combinedSearchTribe"].forEach(selectId => {
    const select = document.getElementById(selectId);
    const displayId = selectId === "combinedPlace"
      ? "combinedSelectedEventPlaceDisplay"
      : selectId === "combinedSearchEventType"
      ? "combinedSelectedEventTypeDisplay"
      : "combinedSelectedTribesDisplay";

    const display = document.getElementById(displayId);

    select.addEventListener("change", function () {
      display.innerHTML = "";
      Array.from(select.selectedOptions).forEach(option => {
        const pill = document.createElement("span");
        pill.className = "pill";
        pill.textContent = option.value;
        display.appendChild(pill);
      });
    });

    Array.from(select.options).forEach(option => {
      option.addEventListener("mousedown", function (e) {
        e.preventDefault();
        option.selected = !option.selected;
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
      });
    });
  });

  // Fetch JSON data
  function fetchData() {
    fetch('../dataProcessing/dataFiles/JSON/combinedData.json')
      .then(response => response.json())
      .then(data => {
        jsonData = data;
        console.log("JSON data loaded:", jsonData);
      })
      .catch(error => console.error('Error fetching JSON data:', error));
  }

  // Toggle person details
  window.toggleDetails = function (id, caretElement) {
    const detailsDiv = document.getElementById(`details-${id}`);
    const isVisible = detailsDiv.style.display === "block";
    detailsDiv.style.display = isVisible ? "none" : "block";
    caretElement.textContent = isVisible ? "▸" : "▾";
  };

  // Render results grouped by year
  function renderResults(results, yearCounts, searchSummary) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    const description = document.createElement("div");
    description.innerHTML = searchSummary;
    resultsDiv.appendChild(description);
    const totalCount = results.length;
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<p><strong>Total Results:</strong> ${totalCount}</p>`;
    resultsDiv.appendChild(totalDiv);

    if (results.length === 0) {
      resultsDiv.innerHTML += "<p>No matching events found.</p>";
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
            const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
            const relationship = p["Relationship"] || "Unknown Role";
            const title = info["Title"] ? ` (${info["Title"]})` : "";
            const id = `${event["EventID"]}-${eventIndex}-${i}`;
            const personID = info["Personal_ID"];
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
                <strong>${relationship}</strong>: ${fullName}${title} - 
                <span style="font-weight: normal;">Person ID: ${personID}</span>
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

  // Combined Search Function
  function combinedSearch() {
    const selectedPlaces = Array.from(document.getElementById("combinedPlace").selectedOptions).map(opt => opt.value.toLowerCase());
    const selectedEventTypes = Array.from(document.getElementById("combinedSearchEventType").selectedOptions).map(opt => opt.value.toLowerCase());
    const selectedTribes = Array.from(document.getElementById("combinedSearchTribe").selectedOptions).map(opt => opt.value.toLowerCase());

    const firstName = document.getElementById("combinedFirstNameInput").value.trim().toLowerCase();
    const lastName = document.getElementById("combinedLastNameInput").value.trim().toLowerCase();
    const yearInput = document.getElementById("combinedSearchYear").value.trim();

    const results = [];
    const yearCounts = {};

    if (yearInput && !/^\d{4}$/.test(yearInput)) {
      alert("Please enter a valid 4-digit year or leave it blank.");
      return;
    }

    jsonData.forEach(item => {
      const eventPlace = (item.EventPlace || "").toLowerCase();
      const eventType = (item.Event || "").toLowerCase();
      const dateStr = item.EventDate;
      let year = "Unknown";

      if (dateStr) {
        const parts = dateStr.split("/");
        if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
          year = parts[2];
        }
      }

      item["ParsedYear"] = year;

      const matchPlace = selectedPlaces.length === 0 || selectedPlaces.includes(eventPlace);
      const matchType = selectedEventTypes.length === 0 || selectedEventTypes.includes(eventType);
      const matchTribe = selectedTribes.length === 0 || (item.Person || []).some(p => {
        const tribe = (p.PersonInfo?.RaceorTribe || "").toLowerCase();
        return selectedTribes.includes(tribe);
      });
      const matchYear = !yearInput || year === yearInput;
      const matchName = (item.Person || []).some(p => {
        const info = p.PersonInfo || {};
        const g = (info.Givenname || "").toLowerCase();
        const s = (info.Surname || "").toLowerCase();
        return (!firstName || g.includes(firstName)) && (!lastName || s.includes(lastName));
      });

      if (matchPlace && matchType && matchTribe && matchYear && matchName) {
        yearCounts[year] = (yearCounts[year] || 0) + 1;
        results.push(item);
      }
    });

    results.sort((a, b) => {
      const yearA = /^\d{4}$/.test(a["ParsedYear"]) ? parseInt(a["ParsedYear"]) : Infinity;
      const yearB = /^\d{4}$/.test(b["ParsedYear"]) ? parseInt(b["ParsedYear"]) : Infinity;
      return yearA - yearB;
    });

    // Build readable filter summary
    const readableType = selectedEventTypes.length > 0 ? selectedEventTypes.join(", ") : "All Event Types";
    const readablePlace = selectedPlaces.length > 0 ? selectedPlaces.join(", ") : "All Places";
    const readableTribe = selectedTribes.length > 0 ? selectedTribes.join(", ") : "All Tribal Affiliations";
    const readableYear = yearInput || "All Years";
    const readableName = (firstName || lastName) 
    ? `people named ${[firstName, lastName].filter(Boolean).join(" ")}`
    : "any person";

    // Compose HTML summary
    const searchSummary = `
    <h3>Results for:</h3>
    <p><strong>Event Type:</strong> ${readableType}</p>
    <p><strong>Event Place:</strong> ${readablePlace}</p>
    <p><strong>Tribal Affiliation:</strong> ${readableTribe}</p>
    <p><strong>Name:</strong> ${readableName}</p>
    <p><strong>Year:</strong> ${readableYear}</p>
    `;


    renderResults(results, yearCounts, searchSummary);

    // Optionally clear UI after search
    clearMultiSelect("combinedPlace", "combinedSelectedEventPlaceDisplay");
    clearMultiSelect("combinedSearchEventType", "combinedSelectedEventTypeDisplay");
    clearMultiSelect("combinedSearchTribe", "combinedSelectedTribesDisplay");
    document.getElementById("combinedFirstNameInput").value = "";
    document.getElementById("combinedLastNameInput").value = "";
    document.getElementById("combinedSearchYear").value = "";
  }

  document.getElementById("combinedSearchButton").addEventListener("click", combinedSearch);

  fetchData();
})();