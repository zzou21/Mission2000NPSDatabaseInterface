# This file attempts to provide a way to easily search event locations and years together.
import json
from collections import defaultdict
from datetime import datetime

class dataSearch:
    def __init__(self, jsonDataPath):
        with open(jsonDataPath, "r", encoding="utf-8") as jsonData:
            self.combinedJsonData = json.load(jsonData)

    def search_by_event_place(self, keyword):
        keyword = keyword.lower()

        filtered = []
        for event in self.combinedJsonData:
            event_place = (event.get("EventPlace") or "").lower()
            if keyword in event_place:
                filtered.append(event)

        for event in filtered:
            date_str = event.get("EventDate", "")
            try:
                year = datetime.strptime(date_str, "%m/%d/%Y").year
            except:
                year = "Unknown"
            event["EventYear"] = year

        filtered.sort(key=lambda e: (e["EventYear"] if isinstance(e["EventYear"], int) else 9999))

        year_counts = defaultdict(int)
        for event in filtered:
            year_counts[event["EventYear"]] += 1

        print(f"\nResults for EventPlace containing '{keyword}':\n")
        for event in filtered:
            print(f"- Event_ID: {event['EventID']}, Year: {event['EventYear']}, Event: {event['Event']}, Notes: {event.get('Notes', '')}")

        print("\nEvents per year:")
        for year in sorted(year_counts):
            print(f"  {year}: {year_counts[year]} event(s)")

        # return filtered

    def findAllEventPlaces(self):
        eventPlaces = set()
        for event in self.combinedJsonData:
            if event["EventPlace"]:
                eventPlaces.add(event["EventPlace"])
        listOfEventPlaces = list(eventPlaces)
        listOfEventPlaces = sorted(listOfEventPlaces)
        for event in listOfEventPlaces:
            print(event)


if __name__=="__main__":
    jsonDataPath = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/combinedData.json"

    dataSearchMachine = dataSearch(jsonDataPath)
    dataSearchMachine.findAllEventPlaces()