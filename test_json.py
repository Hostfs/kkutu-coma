import urllib.request

urls = [
    "https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary1.json",
    "https://raw.githubusercontent.com/acidsound/korean_wordlist/master/korean_dictionary2.json"
]

for i, url in enumerate(urls, 1):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            count = 0
            for line in response:
                count += 1
            print(f"File {i} lines: {count}")
    except Exception as e:
        print(f"Error {i}: {e}")
