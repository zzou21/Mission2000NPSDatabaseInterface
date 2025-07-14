// Search by person name through two search input bars, one for First Name and one for Last Name.
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

    const firstNameRaw = document.getElementById("firstNameInput").value.trim();
    const lastNameRaw = document.getElementById("lastNameInput").value.trim();
    const yearRaw = document.getElementById("searchNameYear").value.trim();

    const firstNameInput = firstNameRaw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
    const lastNameInput = lastNameRaw.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    const displayFirst = firstNameRaw || "(any)";
    const displayLast = lastNameRaw || "(any)";
    const displayYear = yearRaw || "(any year)";
    const description = document.createElement("div");
    description.innerHTML = `<h4>Results for First Name: <em>${displayFirst}</em> and Last Name: <em>${displayLast}</em> in year <em>${displayYear}</em>:</h4>`;
    resultsDiv.appendChild(description);

    const matchedMap = new Map();

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

        const personalID = info["Personal_ID"];
        const given = (info["Givenname"] || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
        const surname = (info["Surname"] || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

        const firstNameMatch = !firstNameInput || given.includes(firstNameInput);
        const lastNameMatch = !lastNameInput || surname.includes(lastNameInput);

        if (firstNameMatch && lastNameMatch) {
          if (!matchedMap.has(personalID)) {
            matchedMap.set(personalID, {
              person,
              events: []
            });
          }
          matchedMap.get(personalID).events.push(event);
        }
      });
    });

    const matchedResults = Array.from(matchedMap.values());

    if (matchedResults.length === 0) {
      resultsDiv.innerHTML += "<p>No matching individuals found.</p>";
      clearSearchInputs(["firstNameInput", "lastNameInput", "searchNameYear"]);
      return;
    }

    const summary = document.createElement("div");
    summary.innerHTML = `<h4>Total People Found: ${matchedResults.length}</h4>`;
    resultsDiv.appendChild(summary);

    matchedResults.forEach((entry, index) => {
    const p = entry.person;
    const info = p["PersonInfo"];
    const personID = info["Personal_ID"];
    const fullName = [info["Givenname"], info["Surname"]].filter(Boolean).join(" ") || "Unknown Name";
    const title = info["Title"] ? ` (${info["Title"]})` : "";
    const eventCount = entry.events.length;

    const personDiv = document.createElement("div");
    personDiv.classList.add("result-item");

    personDiv.innerHTML = `
      <h4>Result ${index + 1}: ${fullName}${title} &mdash; 
        <span style="font-weight:normal;">
          Person ID: ${personID} — Appears in ${eventCount} event(s)
        </span>
      </h4>
      <p><strong>Relationship:</strong> ${p["Relationship"] || "N/A"}</p>
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

    // Build event list
    const eventDetailsList = document.createElement("ul");
    eventDetailsList.style.marginTop = "0.5em";

    entry.events.forEach(evt => {
      const summaryLine = `
        <strong>Event:</strong> ${evt["Event"] || "Unknown"} |
        <strong>Date:</strong> ${evt["EventDate"] || "Unknown"} |
        <strong>Place:</strong> ${evt["EventPlace"] || "N/A"} |
        <strong>Book:</strong> ${evt["Book"] || "N/A"} |
        <strong>Event ID:</strong> ${evt["EventID"]}
      `;

      const listItem = document.createElement("li");
      listItem.innerHTML = `<details>
        <summary>${summaryLine}</summary>
        <div style="margin-left:1em; font-size: 0.9em;">
          <p><strong>Credit:</strong> ${evt["Credit"] || "None"}</p>
        </div>
      </details>`;

      // Build people list inside this event
      const people = evt.Person || [];
      const peopleList = people.map(other => {
        const oInfo = other.PersonInfo || {};
        const oName = [oInfo.Givenname, oInfo.Surname].filter(Boolean).join(" ") || "Unknown Name";
        const oRole = other.Relationship || "Unknown Role";
        const oTribe = oInfo.RaceorTribe || "Unknown";
        const oID = oInfo.Personal_ID || "Unknown";

        return `
          <details style="margin-left: 1em; margin-top: 0.5em;">
            <summary><strong>${oRole}</strong>: ${oName} (${oTribe}) — <span style="font-weight:normal;">Person ID: ${oID}</span></summary>
            <div style="margin-left: 1em; font-size: 0.85em;">
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

      const peopleContainer = document.createElement("div");
      peopleContainer.innerHTML = `<p style="margin-left: 1em;"><em>People in this event:</em></p>${peopleList}`;
      listItem.querySelector("details").appendChild(peopleContainer);

      eventDetailsList.appendChild(listItem);
    });

    const eventListDetails = document.createElement("details");
    eventListDetails.style.marginLeft = "1em";
    eventListDetails.innerHTML = `<summary><strong>Associated Events</strong></summary>`;
    // Count unique associated people across all events
    const associatedPeople = new Set();
    entry.events.forEach(evt => {
      const people = evt.Person || [];
      people.forEach(other => {
        const otherID = other.Personal_ID;
        if (otherID && otherID !== personID) {
          associatedPeople.add(otherID);
        }
      });
    });

    const associatedCount = associatedPeople.size;

    const associatedCountLine = document.createElement("p");
    associatedCountLine.style.marginLeft = "1em";
    associatedCountLine.style.fontStyle = "italic";
    associatedCountLine.textContent = `Associated with ${associatedCount} unique individual(s) across all events.`;

    personDiv.appendChild(associatedCountLine);

    eventListDetails.appendChild(eventDetailsList);
    personDiv.appendChild(eventListDetails);

    // Find other people across all events
    const otherPeople = new Map();
    entry.events.forEach(evt => {
      (evt.Person || []).forEach(other => {
        if (other.Personal_ID !== personID && !otherPeople.has(other.Personal_ID)) {
          otherPeople.set(other.Personal_ID, other);
        }
      });
    });

    // This displays all related people below the "Associated Event" caret
    // if (otherPeople.size > 0) {
    //   const othersHTML = Array.from(otherPeople.values()).map(other => {
    //     const oInfo = other.PersonInfo || {};
    //     const oName = [oInfo.Givenname, oInfo.Surname].filter(Boolean).join(" ") || "Unknown Name";
    //     const oRole = other.Relationship || "Unknown Role";
    //     const oTribe = oInfo.RaceorTribe || "Unknown";
    //     const oID = oInfo.Personal_ID || "Unknown";

    //     return `
    //       <details style="margin-top: 0.5em; margin-left: 1em;">
    //         <summary><strong>${oRole}</strong>: ${oName} (${oTribe}) — <span style="font-weight:normal;">Person ID: ${oID}</span></summary>
    //         <div style="margin-left: 1em; font-size: 0.9em;">
    //           <p><strong>Sex:</strong> ${oInfo.Sex || "N/A"}</p>
    //           <p><strong>Place of Birth:</strong> ${oInfo.Placeofbirth || "N/A"}</p>
    //           <p><strong>Place of Death:</strong> ${oInfo.Placeofdeath || "N/A"}</p>
    //           <p><strong>Residence:</strong> ${oInfo.Residence || "N/A"}</p>
    //           <p><strong>Race or Tribe:</strong> ${oTribe}</p>
    //           <p><strong>Title:</strong> ${oInfo.Title || "N/A"}</p>
    //           <p><strong>Place of Service:</strong> ${oInfo.PlaceofService || "N/A"}</p>
    //           <p><strong>Order:</strong> ${oInfo.Order || "N/A"}</p>
    //           <p><strong>Notes:</strong> ${oInfo.Notes || "None"}</p>
    //           <p><strong>Date of birth:</strong> ${oInfo.Dateofbirth || "None"}</p>
    //           <p><strong>Date of death:</strong> ${oInfo.Dateofdeath || "None"}</p>
    //         </div>
    //       </details>
    //     `;
    //   }).join("");

    //   const wrapper = document.createElement("div");
    //   wrapper.innerHTML = `<p style="margin-left: 1em;"><em>Other people involved:</em></p>${othersHTML}`;
    //   personDiv.appendChild(wrapper);
    // }

    resultsDiv.appendChild(personDiv);
  });

    clearSearchInputs(["firstNameInput", "lastNameInput", "searchNameYear"]);
  }

  document.getElementById("searchByNameButton").addEventListener("click", searchByName);
  document.getElementById("searchByNameButton").disabled = true;

  document.addEventListener("DOMContentLoaded", fetchData);
})();