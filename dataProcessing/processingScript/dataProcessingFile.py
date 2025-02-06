'''
This file is used for exploratory data processing. NPS's Mission 2000 data came in the format of one MDB (Microsoft Database) that contains three tables: Events, Event Relationship, and Personal Information.

Because this interface project is hosted on GitHub Pages, it does not have a backend. So the Python scripts here are only for exploratory data processing or users who have technical experience to use. There is another file that uses JavaScript to run a client-side search algorithm that is the version hosted on the interface.
'''
import pandas_access as mdb
import pandas as pd
import os, json


# This class object is designed for transferring file formats among MDB, CSV, JSON, and others as necessary.
class fileReformatting:
    def __init__(self, mdbPath, CSVDestinationFolderPath, JSONDestinationFolderPath):
        self.mdbPath = mdbPath
        self.CSVDestinationFolderPath = CSVDestinationFolderPath
        self.JSONDestinationFolderPath = JSONDestinationFolderPath

    def mdbToCSV(self):
        mdbTables = mdb.list_tables(self.mdbPath) #This variable stores all the tables in the MDB file. An MDB file could contain multiple tables, of which each needs to be stores as one CSV or JSON.
        for singleTable in mdbTables:
            df = mdb.read_table(self.mdbPath, singleTable)
            destinationCSVPath = os.path.join(self.CSVDestinationFolderPath, f"{singleTable}.csv")
            df.to_csv(destinationCSVPath, index=False, encoding="utf-8")
            print(f"Exported {singleTable} to {destinationCSVPath}")
    
    def CSVToJSON(self, csvPathList):
        # Load CSV into Pandas DataFrame
        CSVJSONFileDestinationPaths = []
        for csvPath in csvPathList:
            pair = [] #format: [csvPath, jsonPath]
            pair.append(csvPath)
            csvFileName = os.path.basename(csvPath)
            jsonFileName, _ = os.path.splitext(csvFileName)
            jsonFileName = jsonFileName + ".json"
            jsonFileName = os.path.join(self.JSONDestinationFolderPath, jsonFileName)
            pair.append(jsonFileName)
            CSVJSONFileDestinationPaths.append(pair)
        
        for csvJsonPair in CSVJSONFileDestinationPaths:
            
        # Convert DataFrame to JSON# Load CSV into Pandas DataFrame
            df = pd.read_csv(csvJsonPair[0])
            df.to_json(csvJsonPair[1], orient="records", indent=4)
            print(f"CSV successfully converted {os.path.basename(csvJsonPair[0])}to JSON and saved as {csvJsonPair[1]}")

if __name__ == "__main__":
    mdbFilePath = "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/MDB/mission2000.mdb"
    CSVDestinationFolderPath = "dataProcessing/dataFiles/CSV"
    jsonDestinationFolderPath = "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/JSON"
    fileReformattingMachine = fileReformatting(mdbFilePath ,CSVDestinationFolderPath, jsonDestinationFolderPath)
    # fileReformattingMachine.mdbToCSV()
    csvPathList = [
        "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/CSV/Event_Relationship.csv",
        "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/CSV/Event.csv",
        "/Users/Jerry/Desktop/DH proj-reading/Mission2000NPSDatabaseInterface/dataProcessing/dataFiles/CSV/Personal_Information.csv"
    ]

    fileReformattingMachine.CSVToJSON(csvPathList)

