#encoding:UTF-8

import requests
import json
from sys import argv

URL = "https://one-shot-puml.herokuapp.com/login"
page = requests.get(URL)

print("response code: " + str(page.status_code))

response_code = page.status_code

message = "一切正常"
if response_code != 200:
  message = "one-shot-plantuml.herokuapp.com 网站异常，response code: " + str(response_code)

headers = {"Content-Type": "text/plain"}
data = {
  "msgtype": "text",
  "text": {
     "content": message,
  }
}

r = requests.post(
  url=argv[1],
  headers=headers, json=data)
print(r.text)