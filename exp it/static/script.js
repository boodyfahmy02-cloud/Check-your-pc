/* =====================================================
   Check Your PC - Expert System
   script.js (Final Stable Version)
   ===================================================== */

/* -------------------------
   1) Collect Facts
------------------------- */
function collectFacts() {
  const facts = {};

  // Symptoms (checkboxes)
  document.querySelectorAll("input.form-check-input").forEach(cb => {
    facts[cb.value] = cb.checked;
  });

  // Numeric inputs
  const ram = parseInt(document.getElementById("ram").value) || 0;
  const disk = parseInt(document.getElementById("disk").value) || 0;
  const temp = parseInt(document.getElementById("temp").value) || 0;

  // Validation (realistic values)
  if (ram < 0 || ram > 100 || disk < 0 || disk > 100 || temp < 0 || temp > 120) {
    alert("Please enter realistic values:\nRAM/Disk: 0–90\nTemp: 0–120°C");
    return null;
  }

  // Derived facts
  facts.high_ram = ram >= 70;
  facts.disk_full = disk >= 70;
  facts.high_temp = temp >= 70;

  // Select inputs
  facts.net_state = document.getElementById("netstate").value;
  facts.ip_valid = document.getElementById("ipvalid").value === "true";
  facts.recent_driver_install =
    document.getElementById("recentdriver").value === "true";

  // Derived for backend
  facts.wifi_connected = facts.net_state === "wifi";

  return facts;
}

/* -------------------------
   2) Knowledge Base (Rules)
------------------------- */
const RULES = [
  {
    id: "R1",
    problem: "Overheating Issue",
    check: f => f.high_temp && (f.loud_fan || f.frequent_crashes),
    explanation: "High temperature with fan noise or frequent crashes.",
    recommendations: [
      "Clean CPU fan and heatsink",
      "Improve airflow",
      "Replace thermal paste"
    ],
    confidence: 90
  },
  {
    id: "R2",
    problem: "Performance Issue",
    check: f => f.slow_pc && f.high_ram && f.disk_full,
    explanation: "High RAM usage and low disk space slow the system.",
    recommendations: [
      "Free disk space",
      "Close background applications",
      "Upgrade RAM"
    ],
    confidence: 85
  },
  {
    id: "R3",
    problem: "Network Configuration Issue",
    check: f => f.no_internet && f.wifi_connected && !f.ip_valid,
    explanation: "Internet is unavailable due to invalid IP configuration.",
    recommendations: [
      "Renew IP address",
      "Restart router",
      "Reset network settings"
    ],
    confidence: 75
  },
  {
    id: "R4",
    problem: "Driver Compatibility Issue",
    check: f => f.boot_loop && f.recent_driver_install,
    explanation: "Recently installed driver caused boot failure.",
    recommendations: [
      "Boot into Safe Mode",
      "Rollback driver",
      "Use System Restore"
    ],
    confidence: 88
  },
  {
    id: "R5",
    problem: "Blue Screen (BSOD)",
    check: f => f.blue_screen,
    explanation: "Critical system error detected (Blue Screen).",
    recommendations: [
      "Check RAM health",
      "Update or rollback drivers",
      "Scan system files"
    ],
    confidence: 80
  }
];

/* -------------------------
   3) Inference Engine
   (Backward Chaining style)
------------------------- */
function runInference(facts) {
  const matches = [];

  RULES.forEach(rule => {
    if (rule.check(facts)) {
      matches.push(rule);
    }
  });

  // Highest confidence first
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches;
}

/* -------------------------
   4) Display Result
------------------------- */
function showResult(result) {
  const box = document.getElementById("result");
  box.style.display = "block";

  if (!result.length) {
    box.innerHTML = "<b>No matching diagnosis found.</b>";
    return;
  }

  const best = result[0];

  box.innerHTML = `
    <h5>Diagnosis Result</h5>
    <p><b>Rule:</b> ${best.rule_name}</p>
    <p><b>Problem:</b> ${best.cause}</p>
    <p><b>Explanation:</b> ${best.explanation}</p>
    <p><b>Confidence:</b> ${Math.round(best.confidence * 100)}%</p>
    <p><b>Recommendations:</b></p>
    <ul>
      ${best.recommendations.map(r => `<li>${r}</li>`).join("")}
    </ul>
  `;
}

/* -------------------------
   5) Diagnose Button
------------------------- */
document.getElementById("diagnoseBtn").addEventListener("click", async () => {
  console.log('Diagnose button clicked');
  const facts = collectFacts();
  console.log('Collected facts:', facts);
  if (!facts) return;

  try {
    console.log('Sending request to /diagnose');
    const response = await fetch('/diagnose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(facts),
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received data:', data);
    console.log('data.result:', data.result);
    showResult(data.result);
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while diagnosing: ' + error.message);
  }
});

/* -------------------------
   6) Rules Panel (Optional)
------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  const rulesList = document.getElementById("rules-list");
  if (!rulesList) return;

  try {
    const response = await fetch('/rules');
    const data = await response.json();
    rulesList.innerHTML = data.rules.map(r => `
      <div style="margin-bottom:10px;">
        <b>${r.id} – ${r.name}</b>
        <p>${r.explanation}</p>
        <small>Confidence: ${r.confidence}%</small>
      </div>
    `).join("");
  } catch (error) {
    console.error('Error loading rules:', error);
    rulesList.innerHTML = "<p>Failed to load rules.</p>";
  }

  // Toggle rules panel
  const toggleBtn = document.getElementById("toggle-rules");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => { 
      const isHidden = rulesList.style.display === "none";
      rulesList.style.display = isHidden ? "block" : "none";
      toggleBtn.textContent = isHidden ? "Hide" : "Show";
    });
  }
});
