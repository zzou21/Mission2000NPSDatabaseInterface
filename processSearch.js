// Sample JSON data (or fetch it dynamically if it's in a separate file)
const jsonData = [
    { id: 1, name: "Alice", info: "Data Scientist" },
    { id: 2, name: "Bob", info: "Web Developer" },
    { id: 3, name: "Charlie", info: "Designer" }
  ];
  
  // Function to render results
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
      div.innerHTML = `<h2>${item.name}</h2><p>${item.info}</p>`;
      resultsDiv.appendChild(div);
    });
  }
  
  // Search function
  function search() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const results = jsonData.filter(item =>
      item.name.toLowerCase().includes(query) || item.info.toLowerCase().includes(query)
    );
    renderResults(results);
  }
  
  // Event listener for search button
  document.getElementById("searchButton").addEventListener("click", search);
  
  // Optional: Allow "Enter" key to trigger the search
  document.getElementById("searchInput").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      search();
    }
  });