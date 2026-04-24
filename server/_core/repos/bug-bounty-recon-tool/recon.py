import requests
from concurrent.futures import ThreadPoolExecutor

# Banner
print("""
=====================================
        HUNTER Recon Tool
     Bug Bounty Recon Automation
=====================================
""")

domain = input("Enter target domain: ")

subdomains = [
    "www","mail","ftp","dev","test",
    "api","admin","blog","shop","portal"
]

found = []

print("\n[+] Starting reconnaissance...\n")


def scan(sub):
    url = f"http://{sub}.{domain}"

    try:
        r = requests.get(url, timeout=3)

        if r.status_code < 400:
            print("[ALIVE]", url)
            found.append(url)

    except:
        pass


with ThreadPoolExecutor(max_workers=10) as executor:
    executor.map(scan, subdomains)


print("\n[+] Recon completed.")

# Save results
if found:
    with open("results.txt", "w") as f:
        for url in found:
            f.write(url + "\n")

    print("[+] Results saved in results.txt")
else:
    print("[-] No active subdomains found.")
