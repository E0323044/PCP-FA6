import urllib.request
import urllib.parse
import json

base_url = "https://t4e-testserver.onrender.com"

def try_post(path, data, is_json=True):
    url = f"{base_url}{path}"
    headers = {}
    if is_json:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        req_data = urllib.parse.urlencode(data).encode("utf-8")
        headers["Content-Type"] = "application/x-www-form-urlencoded"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            print(f"POST {path} ({'JSON' if is_json else 'Form'}) -> {res.status} {res.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"POST {path} ({'JSON' if is_json else 'Form'}) -> Error {e.code} {e.read().decode()}")
    except Exception as e:
        print(f"POST {path} ({'JSON' if is_json else 'Form'}) -> Error: {e}")

credentials_list = [
    {"studentId": "E0323044", "password": "561433"},
    {"registerNo": "E0323044", "password": "561433"},
    {"username": "E0323044", "password": "561433"},
    {"email": "E0323044", "password": "561433"},
    {"studentId": "DHANUSHREE P", "password": "561433"},
]

for creds in credentials_list:
    print(f"\n--- Testing credentials: {creds} ---")
    for path in ["/api/auth/login", "/api/login", "/auth/login", "/login", "/api/students/login", "/api/student/login", "/api/auth/token", "/api/token"]:
        try_post(path, creds, is_json=True)
        try_post(path, creds, is_json=False)

