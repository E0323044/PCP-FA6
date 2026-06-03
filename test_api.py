import urllib.request
import json
import sys

base_url = "https://t4e-testserver.onrender.com/api"

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    if data is not None:
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)

print("Checking root...")
status, body = make_request(base_url)
print(f"Root: {status} -> {body}")

# Try authenticating
print("\nTrying login with /auth/login (studentId, password)...")
status, body = make_request(f"{base_url}/auth/login", "POST", data={
    "studentId": "E0323044",
    "password": "561433"
})
print(f"Login Response: {status} -> {body}")

print("\nTrying login with /auth/login (registerNo, password)...")
status, body = make_request(f"{base_url}/auth/login", "POST", data={
    "registerNo": "E0323044",
    "password": "561433"
})
print(f"Login Response: {status} -> {body}")

print("\nTrying login with /login (studentId, password)...")
status, body = make_request(f"{base_url}/login", "POST", data={
    "studentId": "E0323044",
    "password": "561433"
})
print(f"Login Response: {status} -> {body}")

print("\nTrying GET /students...")
status, body = make_request(f"{base_url}/students")
print(f"GET /students: {status} -> {body}")

print("\nTrying GET /data...")
status, body = make_request(f"{base_url}/data")
print(f"GET /data: {status} -> {body}")

print("\nTrying GET /dataset...")
status, body = make_request(f"{base_url}/dataset")
print(f"GET /dataset: {status} -> {body}")


