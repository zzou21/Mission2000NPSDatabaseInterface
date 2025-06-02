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
        
        for event in self.eventRelationshipContent:
            personIDInEvent = event["Personal_ID"]
            event["PersonInfo"] = personalDictionary.get(personIDInEvent, None)
        
        # Combined personal information to event_relationship. Now needs to combine Event_relationship into event


if __name__ == "__main__":
    eventRelationshipJSON = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/Event_Relationship.json"
    eventJSON = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/Event.json"
    personalInformationJSON = "/Users/Jerry/Desktop/DHproj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON/Personal_Information.json"

    dataReformattingMachine = dataReformatting(eventRelationshipJSON, eventJSON, personalInformationJSON)

    dataReformattingMachine.combinePersonToEvents()