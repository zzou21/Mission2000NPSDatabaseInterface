// Search by person name through two search input bars.

(function () {
  let jsonData = [];

  function fetchData() {
    fetch('../dataProcessing/dataFiles/JSON/combinedData.json')
      .then(res => res.json())
      .then(data => {
        jsonData = data;
        console.log("JSON loaded for name search.");
        document.getElementById("searchByNameButton").disabled = false;
      })
      .catch(err => console.error("Failed to load JSON:", err));
  }

  function clearSearchInputs(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  function searchByName() {
    if (jsonData.length === 0) {
      alert("Data not loaded yet. Please wait.");
      return;
    }

    // Raw input values (for display)
    const firstNameRaw = document.getElementById("firstNameInput").value.trim();
    const lastNameRaw = document.getElementById("lastNameInput").value.trim();
    const yearRaw = document.getElementById("searchNameYear").value.trim();

    // Normalized input values (for matching)
    const firstNameInput = firstNameRaw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const lastNameInput = lastNameRaw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    // Description section
    const displayFirst = firstNameRaw || "(any)";
    const displayLast = lastNameRaw || "(any)";
    const displayYear = yearRaw || "(any year)";
    const description = document.createElement("div");
    description.innerHTML = `<h4>Results for First Name: <em>${displayFirst}</em> and Last Name: <em>${displayLast}</em> in year <em>${displayYear}</em>:</h4>`;
    resultsDiv.appendChild(description);

    const matchedResults = [];

    jsonData.forEach(event => {
      const eventDate = event["EventDate"];
      let eventYear = "Unknown";
      if (eventDate) {
        const parts = eventDate.split("/");
        if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
          eventYear = parts[2];
        }
      }

      if (yearRaw && eventYear !== yearRaw) return;

      const people = event["Person"] || [];

      people.forEach(person => {
        const info = person["PersonInfo"];
        if (!info) return;

        const given = (info["Givenname"] || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        const surname = (info["Surname"] || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

        const firstNameMatch = !firstNameInput || given.includes(firstNameInput);
        const lastNameMatch = !lastNameInput || surname.includes(lastNameInput);

        if (firstNameMatch && lastNameMatch) {
          matchedResults.push({ person, event });
        }
      });
    });

    if (matchedResults.length === 0) {
      resultsDiv.innerHTML += "<p>No matching individuals found.</p>";
      clearSearchInputs(["firstNameInput", "lastNameInput", "searchNameYear"]);
      return;
    }

    // Add total results summary
    const summary = document.createElement("div");
    summary.innerHTML = `<h4>Total Results: ${matchedResults.length}</h4>`;
    resultsDiv.appendChild(summary);

    matchedResults.forEach((entry, index) => {
      const p = entry.person;
      const event = entry.event;
      const info = p["PersonInfo"];

      const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
      const title = info["Title"] ? ` (${info["Title"]})` : "";

      const personDiv = document.createElement("div");
      personDiv.classList.add("result-item");

      personDiv.innerHTML = `
        <h4>Result ${index + 1}: ${fullName}${title}</h4>
        <p><strong>Relationship:</strong> ${p["Relationship"] || "N/A"}</p>
      `;

      const personInfoHTML = `
        <div style="margin-left: 1em; font-size: 0.95em;">
          <p><strong>Sex:</strong> ${info["Sex"] || "N/A"}</p>
          <p><strong>Place of Birth:</strong> ${info["Placeofbirth"] || "N/A"}</p>
          <p><strong>Place of Death:</strong> ${info["Placeofdeath"] || "N/A"}</p>
          <p><strong>Residence:</strong> ${info["Residence"] || "N/A"}</p>
          <p><strong>Race or Tribe:</strong> ${info["RaceorTribe"] || "N/A"}</p>
          <p><strong>Title:</strong> ${info["Title"] || "N/A"}</p>
          <p><strong>Place of Service:</strong> ${info["PlaceofService"] || "N/A"}</p>
          <p><strong>Order:</strong> ${info["Order"] || "N/A"}</p>
          <p><strong>Notes:</strong> ${info["Notes"] || "None"}</p>
          <p><strong>Date of Birth:</strong> ${info["Dateofbirth"] || "None"}</p>
          <p><strong>Date of Death:</strong> ${info["Dateofdeath"] || "None"}</p>
        </div>
      `;
      personDiv.innerHTML += personInfoHTML;

      const eventDetails = document.createElement("details");
      eventDetails.style.marginLeft = "1em";
      eventDetails.innerHTML = `
        <summary><strong>Event:</strong> ${event["Event"] || "Unknown"} | 
                <strong>Date:</strong> ${event["EventDate"] || "Unknown"} | 
                <strong>Place:</strong> ${event["EventPlace"] || "N/A"} | 
                <strong>Book:</strong> ${event["Book"] || "N/A"}</summary>
        <div style="margin-left: 1em; font-size: 0.95em;">
          <p><strong>Credit:</strong> ${event["Credit"] || "None"}</p>
        </div>
      `;

      const others = event["Person"]
        .filter(other => other.Personal_ID !== p.Personal_ID)
        .map(other => {
          const oInfo = other.PersonInfo || {};
          const oName = [oInfo.Givenname, oInfo.Surname].filter(Boolean).join(" ") || "Unknown Name";
          const oRole = other.Relationship || "Unknown Role";
          const oTribe = oInfo.RaceorTribe || "Unknown";

          return `
            <details style="margin-top: 0.5em; margin-left: 1em;">
              <summary><strong>${oRole}</strong>: ${oName} (${oTribe})</summary>
              <div style="margin-left: 1em; font-size: 0.9em;">
                <p><strong>Sex:</strong> ${oInfo.Sex || "N/A"}</p>
                <p><strong>Place of Birth:</strong> ${oInfo.Placeofbirth || "N/A"}</p>
                <p><strong>Place of Death:</strong> ${oInfo.Placeofdeath || "N/A"}</p>
                <p><strong>Residence:</strong> ${oInfo.Residence || "N/A"}</p>
                <p><strong>Race or Tribe:</strong> ${oTribe}</p>
                <p><strong>Title:</strong> ${oInfo.Title || "N/A"}</p>
                <p><strong>Place of Service:</strong> ${oInfo.PlaceofService || "N/A"}</p>
                <p><strong>Order:</strong> ${oInfo.Order || "N/A"}</p>
                <p><strong>Notes:</strong> ${oInfo.Notes || "None"}</p>
                <p><strong>Date of birth:</strong> ${oInfo.Dateofbirth || "None"}</p>
                <p><strong>Date of death:</strong> ${oInfo.Dateofdeath || "None"}</p>
              </div>
            </details>
          `;
        }).join("");

      if (others.length > 0) {
        const otherWrapper = document.createElement("div");
        otherWrapper.innerHTML = `<p style="margin-left: 1em;"><em>Other people involved:</em></p>${others}`;
        eventDetails.appendChild(otherWrapper);
      }

      personDiv.appendChild(eventDetails);
      resultsDiv.appendChild(personDiv);
    });

    // Clear search inputs after displaying results
    clearSearchInputs(["firstNameInput", "lastNameInput", "searchNameYear"]);
  }

  document.getElementById("searchByNameButton").addEventListener("click", searchByName);
  document.getElementById("searchByNameButton").disabled = true;

  document.addEventListener("DOMContentLoaded", fetchData);
})();
