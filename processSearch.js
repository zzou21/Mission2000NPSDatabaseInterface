let jsonData = []; // Variable to hold the loaded JSON data

// Fetch JSON data from a file
function fetchData() {
  fetch('../AuxiliaryDataProcessing/missionData.json') // Replace with the correct path to your JSON file
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      jsonData = data; // Store the loaded data
      console.log("JSON data loaded:", jsonData); // Debugging
    })
    .catch(error => console.error('Error fetching JSON data:', error));
}

// Function to render search results
function renderResults(results) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  results.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("result-item");

    // Display basic information
    div.innerHTML = `
      <h2>${item["Given Name"]} (${item["Sex"]})</h2>
      <p>Title: ${item["Title"] || "N/A"}</p>
      <p>ID: ${item["id"]}</p>
    `;

    // Display events if available
    if (item["Events"].length > 0) {
      const eventsHTML = item["Events"]
        .map(event => `<li>${event["Event"]} (${event["Relationship"]})</li>`)
        .join("");
      div.innerHTML += `<p>Events:</p><ul>${eventsHTML}</ul>`;
    }

    resultsDiv.appendChild(div);
  });
}

// Search function to filter the JSON data
function search() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  const results = jsonData.filter(item => {
    // Check top-level fields
    const matchesGivenName = item["Given Name"].toLowerCase().includes(query);
    const matchesTitle = item["Title"] && item["Title"].toLowerCase().includes(query);

    // Check nested "Events" field
    const matchesEvents = item["Events"].some(event =>
      event["Event"].toLowerCase().includes(query) ||
      event["Relationship"].toLowerCase().includes(query)
    );

    return matchesGivenName || matchesTitle || matchesEvents;
  });

  renderResults(results);
}

// Add event listeners for the search functionality
document.getElementById("searchButton").addEventListener("click", search);
document.getElementById("searchInput").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    search();
  }
});

// Fetch JSON data when the page loads
fetchData();