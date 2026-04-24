# HUNTER Recon Tool

A Python-based reconnaissance automation tool designed for bug bounty hunters and cybersecurity learners.

The tool performs subdomain discovery and checks which subdomains are alive using HTTP requests.

---

## Features

* Subdomain discovery
* Alive domain detection
* Multi-threaded scanning for faster results
* Automatic result saving
* Simple command-line interface
* Beginner friendly

---

## Installation

Clone the repository:

git clone https://github.com/Bhagyeshteli-cmd/hunter-recon-tool

Go to the project directory:

cd hunter-recon-tool

Install required libraries:

pip install -r requirements.txt

---

## Usage

Run the tool:

python3 recon.py

Example:

Enter target domain: tesla.com

---

## Example Output

[+] Starting reconnaissance...

[ALIVE] http://www.tesla.com
[ALIVE] http://shop.tesla.com

[+] Recon completed.
[+] Results saved in results.txt

---

## Project Structure

hunter-recon-tool
│
├── recon.py
├── requirements.txt
├── README.md
└── results.txt

---

## Disclaimer

This tool is created for educational and ethical security testing purposes only.
Do not use this tool on systems or websites without proper permission.

---

## Example Output

![Recon Result](screenshots/result.png)

## Author

Bhagyesh Teli
Cybersecurity Enthusiast

