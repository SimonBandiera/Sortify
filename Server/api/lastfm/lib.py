##
## EPITECH PROJECT, 2021
## Sortify
## File description:
## lib.py
##

import requests
import urllib.parse
import pprint
from bs4 import BeautifulSoup

def html_scrap(urls, mode):
    liste = []
    url = urls
    if mode == 1:
        url = url.replace("_/", "")
    header = {"User-Agent" : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"}
    soup = BeautifulSoup(requests.get(url, headers=header).text, "html.parser")
    tags = soup.find_all("li", {"class": "tag"})
    for tag in tags:
        liste.append(tag.find("a").text)
    liste = list(dict.fromkeys(liste))
    if liste == []:
        return html_scrap(urls, 0)
    return liste

def clean(liste):
    new_liste = []
    for element in liste:
        new_liste.append(element["name"])
    return new_liste


def clean_string(string):
    lenght = len(string)
    for i in range (0, lenght - 1):
        if string[i] == '(':
            string = string[: i - 1]
            break
    if string.find("feat"):
        string = string[: string.find("feat")]
    if string.find("Feat"):
        string = string[: string.find("Feat")]
    print(string)
    return string
