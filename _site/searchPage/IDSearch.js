(function () {
  let jsonData = [];

  function fetchData() {
    fetch('../dataProcessing/dataFiles/JSON/combinedData.json')
      .then(res => res.json())
      .then(data => {
        jsonData = data;
        console.log("JSON loaded for ID search.");
        document.getElementById("IDSearchButton").disabled = false;
      })
      .catch(err => console.error("Failed to load JSON:", err));
  }

  function clearSearchInputs(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  }

  function searchByID() {
    if (jsonData.length === 0) {
      alert("Data not loaded yet. Please wait.");
      return;
    }

    const idInputRaw = document.getElementById("IDSearchInput").value.trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!/^\d+$/.test(idInputRaw)) {
      resultsDiv.innerHTML = "<p>Please enter a valid numeric ID.</p>";
      return;
    }

    const idToFind = parseInt(idInputRaw, 10);
    const matchedResults = [];

    jsonData.forEach(event => {
      const people = event.Person || [];

      let matchedViaEvent = event.EventID === idToFind;
      let matchedViaPerson = false;
      let matchedPerson = null;

      people.forEach(person => {
        const personalId = person.Personal_ID;
        const personInfoId = person.PersonInfo?.Personal_ID;

        if (personalId === idToFind || personInfoId === idToFind) {
          matchedViaPerson = true;
          matchedPerson = person;
        }
      });

      if (matchedViaEvent || matchedViaPerson) {
        matchedResults.push({
          matchType: matchedViaEvent ? "Event" : "Person",
          event,
          person: matchedPerson
        });
      }
    });

    if (matchedResults.length === 0) {
      resultsDiv.innerHTML = `<p>No event or person found with ID <strong>${idToFind}</strong>.</p>`;
      clearSearchInputs(["IDSearchInput"]);
      return;
    }

    const summary = document.createElement("div");
    summary.innerHTML = `<h4>Results for ID: <em>${idToFind}</em></h4>`;
    resultsDiv.appendChild(summary);

    matchedResults.forEach((entry, index) => {
      const event = entry.event;
      const people = event.Person || [];

      const eventDiv = document.createElement("div");
      eventDiv.classList.add("result-item");

      const year = (() => {
        const dateStr = event.EventDate;
        if (dateStr) {
          const parts = dateStr.split("/");
          if (parts.length === 3 && /^\d{4}$/.test(parts[2])) {
            return parts[2];
          }
        }
        return "Unknown";
      })();

      eventDiv.innerHTML = `
        <h4>Result ${index + 1} &mdash; 
        <span style="font-weight: normal;">
            ${entry.matchType === "Event"
            ? `Event ID: ${entry.event.EventID}`
            : `Person ID: ${entry.person?.PersonInfo?.Personal_ID ?? "Unknown"}`}
        </span>
        </h4>
        <p><strong>Event Type:</strong> ${event.Event || "Unknown"} | 
           <strong>Date:</strong> ${event.EventDate || "Unknown"} | 
           <strong>Place:</strong> ${event.EventPlace || "N/A"} | 
           <strong>Year:</strong> ${year}</p>
        <p><strong>Book:</strong> ${event.Book || "N/A"} | 
           <strong>Page:</strong> ${event.PageNumber || "N/A"}</p>
        <p><strong>Notes:</strong> ${event.Notes || "None"}</p>
        <p><strong>Credit:</strong> ${event.Credit || "None"}</p>
      `;

      const peopleList = people.map((person, i) => {
        const info = person.PersonInfo || {};
        const fullName = [info.Givenname, info.Surname].filter(Boolean).join(" ") || "Unknown Name";
        const role = person.Relationship || "Unknown Role";
        const title = info.Title ? ` (${info.Title})` : "";
        const isMatch = info.Personal_ID === idToFind;

        const detailStyle = isMatch ? "background-color: #ffffe0; border-left: 3px solid orange;" : "";

        return `
          <details style="margin-left: 1em; margin-top: 1em; ${detailStyle}">
            <summary><strong>${role}:</strong> ${fullName}${title}${isMatch ? " <em>(ID match)</em>" : ""}</summary>
            <div style="margin-left: 1em; font-size: 0.9em;">
              <p><strong>Sex:</strong> ${info.Sex || "N/A"}</p>
              <p><strong>Place of Birth:</strong> ${info.Placeofbirth || "N/A"}</p>
              <p><strong>Place of Death:</strong> ${info.Placeofdeath || "N/A"}</p>
              <p><strong>Residence:</strong> ${info.Residence || "N/A"}</p>
              <p><strong>Race or Tribe:</strong> ${info.RaceorTribe || "N/A"}</p>
              <p><strong>Title:</strong> ${info.Title || "N/A"}</p>
              <p><strong>Place of Service:</strong> ${info.PlaceofService || "N/A"}</p>
              <p><strong>Order:</strong> ${info.Order || "N/A"}</p>
              <p><strong>Notes:</strong> ${info.Notes || "None"}</p>
              <p><strong>Date of Birth:</strong> ${info.Dateofbirth || "None"}</p>
              <p><strong>Date of Death:</strong> ${info.Dateofdeath || "None"}</p>
            </div>
          </details>
        `;
      }).join("");

      eventDiv.innerHTML += `<div><strong>People Involved:</strong>${peopleList}</div>`;
      resultsDiv.appendChild(eventDiv);
    });

    clearSearchInputs(["IDSearchInput"]);
  }

  document.getElementById("IDSearchButton").addEventListener("click", searchByID);
  document.getElementById("IDSearchButton").disabled = true;

  document.addEventListener("DOMContentLoaded", fetchData);
})();