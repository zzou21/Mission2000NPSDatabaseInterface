let jsonData = [];

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
  const query = document.getElementById("searchInput").value.toLowerCase();
  const results = [];
  const yearCounts = {};

  jsonData.forEach(item => {
    const eventPlace = (item["EventPlace"] || "").toLowerCase();
    if (eventPlace.includes(query)) {
      // Parse year from EventDate
      const dateStr = item["EventDate"];
      let year = "Unknown";
      if (dateStr) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          year = parts[2]; // assumes MM/DD/YYYY
        }
      }
      item["ParsedYear"] = year;
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      results.push(item);
    }
  });

  // Sort results by ParsedYear (numeric, unknown last)
  results.sort((a, b) => {
    const yearA = isNaN(parseInt(a["ParsedYear"])) ? 9999 : parseInt(a["ParsedYear"]);
    const yearB = isNaN(parseInt(b["ParsedYear"])) ? 9999 : parseInt(b["ParsedYear"]);
    return yearA - yearB;
  });

  renderResults(results, yearCounts);
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
  resultsDiv.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No events found for that location.</p>";
    return;
  }

  // Show year summary
  const summary = document.createElement("div");
  summary.innerHTML = "<h3>Events per Year</h3>";
  const sortedYears = Object.keys(yearCounts).sort();
  const yearList = sortedYears.map(y => `<li>${y}: ${yearCounts[y]} event(s)</li>`).join("");
  summary.innerHTML += `<ul>${yearList}</ul>`;
  resultsDiv.appendChild(summary);

  // Show matching events
  results.forEach((event, eventIndex) => {
    const div = document.createElement("div");
    div.classList.add("result-item");

    div.innerHTML = `
      <h2>Event ${event["EventID"]} (${event["ParsedYear"]})</h2>
      <p><strong>Place:</strong> ${event["EventPlace"] || "N/A"}</p>
      <p><strong>Date:</strong> ${event["EventDate"] || "Unknown"}</p>
      <p><strong>Type:</strong> ${event["Event"] || "Unknown"}</p>
      <p><strong>Book:</strong> ${event["Book"] || "N/A"}</p>
      <p><strong>Notes:</strong> ${event["Notes"] || "None"}</p>
    `;

    // Add participants with caret toggles
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

    resultsDiv.appendChild(div);
  });
}

// Add event listeners for the search bar
document.getElementById("searchButton").addEventListener("click", searchByEventPlace);
document.getElementById("searchInput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchByEventPlace();
  }
});

// Fetch data when page loads
fetchData();
