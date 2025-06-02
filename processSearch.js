let jsonData = []; // Variable to hold the loaded JSON data

// Fetch JSON data from a file
function fetchData() {
  fetch('../dataProcessing/dataFiles/JSON/combinedData.json') // Replace with correct path
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      jsonData = data;
      console.log("JSON data loaded:", jsonData); // Debugging
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
  summary.innerHTML = "<h3>📊 Events per Year</h3>";
  const sortedYears = Object.keys(yearCounts).sort();
  const yearList = sortedYears.map(y => `<li>${y}: ${yearCounts[y]} event(s)</li>`).join("");
  summary.innerHTML += `<ul>${yearList}</ul>`;
  resultsDiv.appendChild(summary);

  // Show matching events
  results.forEach(event => {
    const div = document.createElement("div");
    div.classList.add("result-item");

    div.innerHTML = `
      <h2>📌 Event ${event["EventID"]} (${event["ParsedYear"]})</h2>
      <p><strong>Place:</strong> ${event["EventPlace"] || "N/A"}</p>
      <p><strong>Date:</strong> ${event["EventDate"] || "Unknown"}</p>
      <p><strong>Type:</strong> ${event["Event"] || "Unknown"}</p>
      <p><strong>Book:</strong> ${event["Book"] || "N/A"}</p>
      <p><strong>Notes:</strong> ${event["Notes"] || "None"}</p>
    `;

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

// Load data when the page is ready
fetchData();