from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# =========================================================
# Knowledge Base (Rules)
# =========================================================
RULES = [
    {
        "id": "R1",
        "name": "Overheating Issue",
        "conditions": lambda f: (
            f.get("high_temp") and
            (f.get("frequent_crashes") or f.get("loud_fan"))
        ),
        "cause": "Overheating Detected",
        "explanation": "The system temperature is very high which can cause crashes and instability.",
        "recommendations": [
            "Turn off the PC and let it cool down.",
            "Clean CPU fan and heatsink.",
            "Improve airflow inside the case."
        ],
        "confidence": 0.90
    },
    {
        "id": "R2",
        "name": "Low Storage and High RAM Usage",
        "conditions": lambda f: (
            f.get("slow_pc") and
            f.get("high_ram") and
            f.get("disk_full")
        ),
        "cause": "Performance Issue",
        "explanation": "High RAM usage combined with low disk space causes slow performance.",
        "recommendations": [
            "Free up disk space.",
            "Close unnecessary background applications.",
            "Consider upgrading RAM."
        ],
        "confidence": 0.85
    },
    {
        "id": "R3",
        "name": "Network IP/DNS Issue",
        "conditions": lambda f: (
            f.get("no_internet") and
            (f.get("wifi_connected") or f.get("net_state") == "wired") and
            not f.get("ip_valid")
        ),
        "cause": "Network Configuration Issue",
        "explanation": "The device is connected to network but does not have a valid IP address.",
        "recommendations": [
            "Renew IP address.",
            "Flush DNS cache.",
            "Restart the router."
        ],
        "confidence": 0.80
    },
    {
        "id": "R4",
        "name": "Driver Boot Loop",
        "conditions": lambda f: (
            f.get("boot_loop") and
            f.get("recent_driver_install")
        ),
        "cause": "Driver Compatibility Issue",
        "explanation": "A recently installed driver is causing the system to enter a boot loop.",
        "recommendations": [
            "Boot into Safe Mode.",
            "Rollback or uninstall the problematic driver.",
            "Use System Restore."
        ],
        "confidence": 0.88
    },
    {
        "id": "R5",
        "name": "Blue Screen Error",
        "conditions": lambda f: f.get("blue_screen"),
        "cause": "Blue Screen of Death (BSOD)",
        "explanation": "A critical system error occurred, possibly related to hardware or drivers.",
        "recommendations": [
            "Note the error code on the blue screen.",
            "Run memory and disk diagnostics.",
            "Update system drivers."
        ],
        "confidence": 0.82
    }
]

# =========================================================
# Inference Engine (Backward Chaining / Rule Matching)
# =========================================================
def infer_diagnosis(facts):
    results = []

    for rule in RULES:
        if rule["conditions"](facts):
            results.append({
                "rule_id": rule["id"],
                "rule_name": rule["name"],
                "cause": rule["cause"],
                "explanation": rule["explanation"],
                "recommendations": rule["recommendations"],
                "confidence": rule["confidence"]
            })

    # sort by confidence (highest first)
    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results

# =========================================================
# Routes
# =========================================================
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/diagnosis')
def diagnosis():
    return render_template('diagnosis.html')

# ---------------------------------------------------------
# Diagnose Endpoint (POST)
# ---------------------------------------------------------
@app.route('/diagnose', methods=['POST'])
def diagnose():
    facts = request.get_json()
    diagnosis_results = infer_diagnosis(facts)

    if not diagnosis_results:
        return jsonify({
            "result": [],
            "message": "No matching rule found for the provided symptoms."
        })

    return jsonify({
        "result": diagnosis_results
    })

# ---------------------------------------------------------
# Rules Endpoint (GET) — for explanation / examiner
# ---------------------------------------------------------
@app.route('/rules', methods=['GET'])
def get_rules():
    readable_rules = []

    for r in RULES:
        readable_rules.append({
            "id": r["id"],
            "name": r["name"],
            "cause": r["cause"],
            "explanation": r["explanation"],
            "recommendations": r["recommendations"],
            "confidence": int(r["confidence"] * 100)
        })

    return jsonify({
        "rules": readable_rules
    })

# =========================================================
# Run App
# =========================================================
if __name__ == '__main__':
    app.run(debug=True)
