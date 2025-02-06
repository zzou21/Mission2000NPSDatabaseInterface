import json, requests
import requests
from bs4 import BeautifulSoup

if __name__ == "__main__":
    lib = {"name": "Alicio", }
    # Test data scraping for Mission 2000 data
    urlTemplate = "https://www.nps.gov/applications/tuma/Detail.cfm?Personal_ID="
    counter = 9
    storageDictionary = {}
    tracker = 0
    while counter < 15:
        urlScrape = urlTemplate + str(counter)
        requestMainMissionTest = requests.get(urlScrape)
        resultBS4 = BeautifulSoup(requestMainMissionTest.content, "html.parser")
        print(resultBS4.prettify())
        print("\n\n\n\n\n\n\n")
        print(f"This is person with ID {counter}")
        counter += 1


    # url = "https://www.nps.gov/applications/tuma/Detail.cfm?Personal_ID=999"
    # requestMainMission = requests.get(url)
    # print(requestMainMission)
    # soup = BeautifulSoup(requestMainMission.content, 'html.parser')
    # print(soup.prettify())

