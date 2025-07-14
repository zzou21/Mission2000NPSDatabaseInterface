(function () {
  let jsonData = [];

  function fetchData() {
    fetch('../dataProcessing/dataFiles/JSON/combinedData.json')
      .then(res => res.json())
      .then(data => {
        jsonData = data;
        console.log("JSON loaded for general word search.");
        document.getElementById("generalWordSearchButton").disabled = false;
      })
      .catch(err => console.error("Failed to load JSON:", err));
  }

  //Function to create highlighting effect on matching word search
  function highlightMatch(text, term) {
    text = text.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    if (!text || !term) return text;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
    // Match term at the start of any word (using \b)
    const regex = new RegExp(`\\b(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  // Clear search input in the input bar after clicking "search"
  function clearSearchInputs(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }


  function searchByGeneralWord() {
    const rawInput = document.getElementById("generalWordSearchInput").value.trim();
    const input = rawInput.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const highlightTerm = input.normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!input) {
      alert("Please enter a word or phrase to search.");
      return;
    }

    const matchedResults = [];

    jsonData.forEach(event => {
      const eventMatch = (event.Notes || "").toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")
        .split(/\s+/).some(word => word.startsWith(input));

      const matchedPeople = (event.Person || []).map(person => {
        const info = person.PersonInfo || {};
        const fieldsToCheck = {
          Title: info.Title,
          "Place of Birth": info.Placeofbirth,
          "Place of Death": info.Placeofdeath,
          "Cause of Death": info.Causeofdeath,
          Residence: info.Residence,
          "Place of Service": info.PlaceofService,
          Translation: info.Translation,
          "Burial Place": info.BurialPlace,
          Order: info.Order,
          Notes: info.Notes
        };

        const matchedFields = [];

        Object.entries(fieldsToCheck).forEach(([label, value]) => {
          const normalized = (value || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
          if (normalized.split(/\s+/).some(word => word.startsWith(input))) {
            matchedFields.push(label);
          }
        });

        return matchedFields.length > 0
          ? { person, matchedFields }
          : null;
      }).filter(Boolean);


      if (eventMatch || matchedPeople.length > 0) {
        matchedResults.push({
          event,
          matchedPeople
        });
      }
    });

    if (matchedResults.length === 0) {
      resultsDiv.innerHTML = `<p>No matches found for "<strong>${input}</strong>".</p>`;
      return;
    }

    const summary = document.createElement("div");
    summary.innerHTML = `<h4>Results for: "<em>${input}</em>" (${matchedResults.length} matching event(s))</h4>`;
    resultsDiv.appendChild(summary);

    matchedResults.forEach((entry, index) => {
      const event = entry.event;
      const matchedPeople = entry.matchedPeople;
      const year = (() => {
        const dateStr = event.EventDate;
        if (dateStr) {
          const parts = dateStr.split("/");
          if (parts.length === 3 && /^\d{4}$/.test(parts[2])) return parts[2];
        }
        return "Unknown";
      })();

      const eventDiv = document.createElement("div");
      eventDiv.classList.add("result-item");

      eventDiv.innerHTML = `
        <h4>Result ${index + 1} — Event ID: ${event.EventID}</h4>
        <p><strong>Event Type:</strong> ${event.Event || "Unknown"} | 
           <strong>Date:</strong> ${event.EventDate || "Unknown"} | 
           <strong>Place:</strong> ${event.EventPlace || "N/A"} | 
           <strong>Year:</strong> ${year}</p>
        <p><strong>Book:</strong> ${event.Book || "N/A"} | 
          <strong>Page:</strong> ${event.PageNumber || "N/A"}</p>
          <p><strong>Event Notes:</strong> ${highlightMatch(event.Notes || "None", highlightTerm)}</p>
      `;

      const peopleList = matchedPeople.map(({ person, matchedFields }, i) => {
        const info = person.PersonInfo || {};
        const personID = info.Personal_ID;
        const fullName = [info.Givenname, info.Surname].filter(Boolean).join(" ") || "Unknown Name";
        const role = person.Relationship || "Unknown Role";
        const title = info.Title ? ` (${info.Title})` : "";

        return `
          <details style="margin-left: 1em; margin-top: 1em;">
            <summary><strong>${role}</strong>: ${fullName}${title} — 
              <span style="font-weight:normal;">Person ID: ${personID} <p style="color:red;"><strong>Matched fields:</strong> ${matchedFields.join(", ")} - Click on dropdown to find detail.</span>
            </summary>
            <div style="margin-left: 1em; font-size: 0.9em;">
              <p><strong>Title:</strong> ${highlightMatch(info.Title || "N/A", highlightTerm)}</p>
              <p><strong>Place of Birth::</strong> ${highlightMatch(info.Placeofbirth || "N/A", highlightTerm)}</p>
              <p><strong>Place of Death:</strong> ${highlightMatch(info.Placeofdeath || "N/A", highlightTerm)}</p>
              <p><strong>Cause of Death:</strong> ${highlightMatch(info.Causeofdeath || "N/A", highlightTerm)}</p>
              <p><strong>Residence:</strong> ${highlightMatch(info.Residence || "N/A", highlightTerm)}</p>
              <p><strong>Place of Service:</strong> ${highlightMatch(info.PlaceofService || "N/A", highlightTerm)}</p>
              <p><strong>Translation:</strong> ${highlightMatch(info.Translation || "N/A", highlightTerm)}</p>
              <p><strong>Burial Place:</strong> ${highlightMatch(info.BurialPlace || "N/A", highlightTerm)}</p>
              <p><strong>Order:</strong> ${highlightMatch(info.Order || "N/A", highlightTerm)}</p>
              <p><strong>Notes:</strong> ${highlightMatch(info.Notes || "N/A", highlightTerm)}</p>
            </div>
          </details>
        `;
      }).join("");

      eventDiv.innerHTML += `<div><strong>People Involved:</strong>${peopleList}</div>`;
      resultsDiv.appendChild(eventDiv);
    });

    clearSearchInputs(["generalWordSearchInput"]);
  }

  document.getElementById("generalWordSearchButton").addEventListener("click", searchByGeneralWord);
  document.getElementById("generalWordSearchButton").disabled = true;

  document.addEventListener("DOMContentLoaded", fetchData);
})();
