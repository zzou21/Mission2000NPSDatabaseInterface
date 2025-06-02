# This file attempts to combine the three different JSON data files into one for easier search.

import json
from collections import defaultdict

class dataReformatting:
    def __init__(self, eventRelationshipJSON, eventJSON, personalInformationJSON):
        with open(eventRelationshipJSON, "r", encoding="utf-8") as eventRelationship:
            self.eventRelationshipContent = json.load(eventRelationship)
        with open(eventJSON, "r", encoding="utf-8") as event:
            self.eventContent = json.load(event)
        with open(personalInformationJSON, "r", encoding="utf-8") as personalInformation:
            self.personalInformationContent = json.load(personalInformation)
    
    def combinePersonToEvents(self):
        personalDictionary = {person["Personal_ID"]: person for person in self.personalInformationContent}
        
        eventGroupedPersonal = defaultdict(list)

        for record in self.eventRelationshipContent:
            eventID = record["Event_ID"]
            person = {
                "Relationship": record["Relationship"],
                "Personal_ID": record["Personal_ID"],
                "Notes": record.get("Notes", None),
                "PersonInfo": personalDictionary.get(record["Personal_ID"], None)
            }
            eventGroupedPersonal[eventID].append(person)

        combinedEventsWithAllPerson = []
        for eventID, person in eventGroupedPersonal.items():
            combinedEventsWithAllPerson.append({
                "EventID": eventID,
                "Person": person
            })
        
        eventDescriptionDict = {description["Event_ID"]: description for description in self.eventContent}
        for event in combinedEventsWithAllPerson:
            eventID = event["EventID"]
            oneEventDescriptionDict = eventDescriptionDict.get(eventID, {})
            for key, value in oneEventDescriptionDict.items():
                if key != "Event_ID":
                    event[key] = value
        
        for event in combinedEventsWithAllPerson:
            if event["EventID"] == 5:
                print(event)
        
        with open ("/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/processingScript/combinedData.json", "w", encoding="utf-8") as f:
            json.dump(combinedEventsWithAllPerson, f, indent=4)
        


if __name__ == "__main__":
    eventRelationshipJSON = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/Event_Relationship.json"
    eventJSON = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/Event.json"
    personalInformationJSON = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/Personal_Information.json"

    dataReformattingMachine = dataReformatting(eventRelationshipJSON, eventJSON, personalInformationJSON)

    dataReformattingMachine.combinePersonToEvents()