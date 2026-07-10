/* ==========================================================================
   CLOUDO-OPTIMA MAIN APP COORDINATOR
   Entry point orchestrating transitions, event bindings, and UI updates
   ========================================================================== */

import { AppState } from './js/state.js';
import { Logger } from './js/logger.js';
import { WasteDetective } from './js/wasteDetective.js';
import { TrafficCop } from './js/trafficCop.js';
import { Agent } from './js/agent.js';
import { initCharts, updateCharts } from './js/charts.js';

document.addEventListener("DOMContentLoaded", () => {
    // Bind terminal logger
    Logger.bindElement(document.getElementById("terminal-body"));
    Logger.log("CloudOptima FinOps Engine initialising...", "info");

    // Initialize core components
    runLoadingScreen();
    bindAuthEvents();
    bindTwoFactorEvents();
    bindCompanyLinkEvents();
    bindDashboardEvents();
    bindOptionsDrawerEvents();
});

/* ==========================================================================
   1. LOADING SCREEN TRANSITION
   ========================================================================== */
function runLoadingScreen() {
    const percentEl = document.getElementById("loading-percent");
    const barEl = document.getElementById("loading-bar");
    const statusEl = document.getElementById("loading-status");
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 4;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                transitionView("loading-screen", "auth-screen");
            }, 600);
        }

        percentEl.textContent = `${progress}%`;
        barEl.style.width = `${progress}%`;

        // Update status text
        if (progress < 25) {
            statusEl.textContent = "Booting secure cloud tunnel...";
        } else if (progress < 55) {
            statusEl.textContent = "Caching FinOps heuristic matrices...";
        } else if (progress < 80) {
            statusEl.textContent = "Deploying local routing microservices...";
        } else {
            statusEl.textContent = "System operational. Access granted.";
        }
    }, 100);
}

/* ==========================================================================
   2. AUTH SCREEN LOGIC
   ========================================================================== */
function bindAuthEvents() {
    const tabBtns = document.querySelectorAll(".auth-tab-btn");
    const forms = document.querySelectorAll(".auth-form");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const bypassBtns = document.querySelectorAll(".bypass-btn");

    // Form tab switcher
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            forms.forEach(f => f.classList.remove("active"));
            
            btn.classList.add("active");
            document.getElementById(`${btn.dataset.tab}-form`).classList.add("active");
        });
    });

    // Login Form Submit
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        
        AppState.updateUser({
            email: email,
            name: email.split("@")[0].toUpperCase() + " (ADMIN)"
        });
        
        setupTFAMasks();
        transitionView("auth-screen", "two-factor-screen");
    });

    // Signup Form Submit
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const role = document.getElementById("signup-role").value;
        const phone = document.getElementById("signup-phone").value;

        AppState.updateUser({
            name,
            email,
            role,
            phone
        });

        setupTFAMasks();
        transitionView("auth-screen", "two-factor-screen");
    });

    // Bypass Button (Direct access to sandbox dashboard)
    bypassBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            Logger.log("Sandbox Bypass activated. Connecting credentials...", "warn");
            AppState.updateUser({
                name: "Manohar Raju (Sandbox Mode)",
                email: "manohar.raju@cloudoptima.internal",
                role: "Lead Cloud Developer",
                loggedIn: true,
                twoFactorVerified: true
            });
            
            // Bypass linking screen too
            transitionView("auth-screen", "dashboard-screen");
            initializeDashboard();
        });
    });
}

function setupTFAMasks() {
    const user = AppState.state.user;
    
    // Mask Email
    const parts = user.email.split("@");
    const emailMask = parts[0].substring(0, 2) + "****@" + parts[1];
    document.getElementById("tfa-mask-email").textContent = emailMask;

    // Mask Phone
    const phoneMask = user.phone.substring(0, 3) + "******" + user.phone.substring(user.phone.length - 3);
    document.getElementById("tfa-mask-phone").textContent = phoneMask;
}

/* ==========================================================================
   3. TWO-FACTOR AUTHENTICATION (2FA) LOGIC
   ========================================================================== */
let activeOTP = "";
let tfaTimerInterval = null;

function bindTwoFactorEvents() {
    const methodCards = document.querySelectorAll(".tfa-method-card");
    const sendOtpBtn = document.getElementById("send-otp-btn");
    const verifyOtpBtn = document.getElementById("verify-otp-btn");
    const selectorArea = document.getElementById("tfa-selector");
    const inputArea = document.getElementById("otp-input-area");
    const digitInputs = document.querySelectorAll(".otp-digit");
    const resendBtn = document.getElementById("resend-otp-link");
    const timerLabel = document.getElementById("tfa-timer");
    const methodLabel = document.getElementById("selected-method-label");

    let selectedMethod = "email";

    // Method selection
    methodCards.forEach(card => {
        card.addEventListener("click", () => {
            methodCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            selectedMethod = card.dataset.method;
        });
    });

    // Dispatch Code
    sendOtpBtn.addEventListener("click", () => {
        dispatchSimulatedOTP(selectedMethod);
        selectorArea.classList.add("hidden");
        inputArea.classList.remove("hidden");
        methodLabel.textContent = selectedMethod;
        digitInputs[0].focus();
        startTFATimer();
    });

    // Auto-focus logic for digit boxes
    digitInputs.forEach((input, idx) => {
        input.addEventListener("input", (e) => {
            if (e.target.value.length === 1 && idx < digitInputs.length - 1) {
                digitInputs[idx + 1].focus();
            }
        });
        
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && e.target.value.length === 0 && idx > 0) {
                digitInputs[idx - 1].focus();
            }
        });
    });

    // Verify OTP
    verifyOtpBtn.addEventListener("click", () => {
        let enteredCode = "";
        digitInputs.forEach(input => enteredCode += input.value);

        if (enteredCode === activeOTP) {
            clearInterval(tfaTimerInterval);
            Logger.log("2FA verification credentials validated.", "success");
            AppState.updateUser({ twoFactorVerified: true });
            transitionView("two-factor-screen", "link-screen");
        } else {
            // Shaking card animation on error
            const card = document.querySelector(".tfa-card");
            card.style.animation = "none";
            setTimeout(() => {
                card.style.border = "1px solid var(--accent-crimson)";
                card.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
                Logger.log("2FA Security Check Failed: Invalid Code Entered.", "warn");
            }, 10);
        }
    });

    // Resend OTP trigger
    resendBtn.addEventListener("click", () => {
        dispatchSimulatedOTP(selectedMethod);
        resendBtn.disabled = true;
        startTFATimer();
    });
}

function dispatchSimulatedOTP(method) {
    // Generate random 6 digit OTP
    activeOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const user = AppState.state.user;
    
    // Construct message
    const destination = method === 'email' ? user.email : user.phone;
    const alertTitle = method === 'email' ? '📨 New E-Mail Received' : '💬 SMS Push Notification';
    const alertMessage = method === 'email'
        ? `<strong>From:</strong> security@cloudoptima.com<br><strong>Body:</strong> Your verification authorization code is <strong>${activeOTP}</strong>. Expiring in 2 minutes.`
        : `<strong>From:</strong> +1 (855) OPTIMA<br><strong>Message:</strong> CloudOptima security alert. OTP code is: ${activeOTP}. Do not share.`;
    
    // Display pop-up alert card in UI
    const hub = document.getElementById('notification-hub');
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.innerHTML = `
        <div class="toast-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="height:18px; width:18px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="toast-content">
            <div class="toast-title font-space">${alertTitle}</div>
            <div class="toast-message font-space">${alertMessage}</div>
        </div>
    `;
    
    hub.appendChild(notification);
    
    // Click to dismiss
    notification.addEventListener("click", () => notification.remove());

    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification) notification.remove();
    }, 8500);

    Logger.log(`2FA OTP code generated. Sent to connected secure account: ${destination}.`, "info");
}

function startTFATimer() {
    clearInterval(tfaTimerInterval);
    let secondsLeft = 120;
    const timerLabel = document.getElementById("tfa-timer");
    const resendBtn = document.getElementById("resend-otp-link");

    tfaTimerInterval = setInterval(() => {
        secondsLeft--;
        const min = Math.floor(secondsLeft / 60);
        const sec = secondsLeft % 60;
        timerLabel.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        if (secondsLeft <= 0) {
            clearInterval(tfaTimerInterval);
            resendBtn.disabled = false;
            activeOTP = "EXPIRED";
            timerLabel.textContent = "Expired";
            Logger.log("2FA verification code has expired. Please request a new code.", "warn");
        }
    }, 1000);
}

/* ==========================================================================
   4. COMPANY LINK SCREEN LOGIC
   ========================================================================== */
function bindCompanyLinkEvents() {
    const linkForm = document.getElementById("company-link-form");
    const linkFormInputs = linkForm.querySelector("button[type='submit']");
    const consoleLogs = document.getElementById("connector-console-logs");
    const loadingWrap = document.getElementById("connector-loading");

    linkForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const orgName = document.getElementById("company-name").value;
        const cloudProvider = document.querySelector("input[name='cloud-provider']:checked").value;
        const accountId = document.getElementById("cloud-account-id").value;
        const roleArn = document.getElementById("cloud-role-arn").value;

        AppState.updateUser({
            linkedCompany: orgName,
            cloudProvider,
            accountId,
            roleArn,
            loggedIn: true
        });

        // Hide form, show loading
        linkForm.style.display = "none";
        loadingWrap.classList.remove("hidden");

        // Simulate connection outputs
        const logs = [
            { text: `[SYSTEM] Contacting authorization gateway...`, delay: 500 },
            { text: `[STS] Requesting AssumeRole credentials on ${cloudProvider}...`, delay: 1200 },
            { text: `[IAM] Policy Check: Read-Only credentials validated successfully.`, delay: 2000 },
            { text: `[SCANNER] Performing Initial CloudWatch cost sweeps in us-east-1...`, delay: 2800 },
            { text: `[SUCCESS] Established secure read-only tunnel with ${orgName} accounts.`, delay: 3500 }
        ];

        logs.forEach(log => {
            setTimeout(() => {
                const line = document.createElement("div");
                line.textContent = log.text;
                consoleLogs.appendChild(line);
                consoleLogs.scrollTop = consoleLogs.scrollHeight;
            }, log.delay);
        });

        setTimeout(() => {
            transitionView("link-screen", "dashboard-screen");
            initializeDashboard();
        }, 4200);
    });
}

/* ==========================================================================
   5. DASHBOARD ORCHESTRATION & STATE LISTENERS
   ========================================================================== */
let selectedResourceId = "";
let selectedScriptLanguage = "terraform";

function initializeDashboard() {
    // 1. Initial render user info
    const user = AppState.state.user;
    document.getElementById("header-company-name").textContent = user.linkedCompany;
    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("header-user-role").textContent = user.role;
    document.getElementById("header-user-avatar").textContent = user.name.charAt(0);
    document.getElementById("header-region").textContent = user.cloudProvider === 'AWS' ? 'us-east-1' : 'us-central1';

    // 2. Initialize graphics
    initCharts();

    // 3. Register state listener to update UI elements
    AppState.subscribe((state) => {
        updateDashboardUI(state);
    });

    // 4. Force initial rendering
    AppState.notify();
    
    Logger.log(`System dashboard unlocked for provider: ${user.cloudProvider} (ID: ${user.accountId})`, "success");
    Logger.log("Cloud Waste Detective: Scanning active servers, clusters, and volumes...", "info");
}

function updateDashboardUI(state) {
    // Update Telemetry metric counts
    document.getElementById("metric-waste").textContent = `$${state.telemetry.wastedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("metric-savings").textContent = `$${state.telemetry.savedCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const effScore = state.telemetry.efficiencyScore;
    document.getElementById("metric-efficiency").textContent = `${effScore}%`;
    document.getElementById("efficiency-fill").style.width = `${effScore}%`;

    // Grade status
    let grade = "D- (Inefficient)";
    let gradeClass = "text-red";
    if (effScore > 60) { grade = "C (Average)"; gradeClass = "text-amber"; }
    if (effScore > 80) { grade = "B+ (Optimized)"; gradeClass = "text-indigo"; }
    if (effScore > 95) { grade = "A+ (Excellent)"; gradeClass = "text-green"; }
    
    const statusEl = document.getElementById("efficiency-status");
    statusEl.textContent = `Grade: ${grade}`;
    statusEl.className = `metric-trend font-mono ${gradeClass}`;

    // Update agent control button
    const agentBtn = document.getElementById("agent-toggle-btn");
    const statusDot = document.getElementById("agent-status-dot");
    const statusText = document.getElementById("agent-status-text");

    if (state.telemetry.isAgentActive) {
        agentBtn.classList.add("active");
        agentBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-text">🤖 AGENT RUNNING (AUTONOMOUS)</span>`;
        statusDot.className = "status-dot green-pulse";
        statusText.textContent = "AGENT: ACTIVE (AUTO)";
    } else {
        agentBtn.classList.remove("active");
        agentBtn.innerHTML = `<span class="btn-glow"></span><span class="btn-text">🤖 ACTIVATE AUTONOMOUS AGENT</span>`;
        statusDot.className = "status-dot orange-pulse";
        statusText.textContent = "AGENT: IDLE";
    }

    // Refresh Waste Table entries
    const tableBody = document.getElementById("waste-table-body");
    tableBody.innerHTML = "";

    state.resources.forEach(res => {
        const row = document.createElement("tr");
        if (res.id === selectedResourceId) {
            row.className = "selected";
        }
        
        let statusBadge = "";
        if (res.status === 'zombie') {
            statusBadge = `<span class="table-badge zombie">ZOMBIE</span>`;
        } else if (res.status === 'underutilized') {
            statusBadge = `<span class="table-badge underutilized">IDLE</span>`;
        } else {
            statusBadge = `<span class="table-badge optimized">OPTIMIZED</span>`;
        }

        row.innerHTML = `
            <td><strong>${res.name}</strong></td>
            <td class="font-mono" style="font-size: 11px;">${res.type}</td>
            <td class="font-mono">${res.metrics}</td>
            <td class="font-space"><strong>$${res.cost.toFixed(2)}/mo</strong></td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-secondary btn-xs remediate-row-btn" data-id="${res.id}" ${res.remediated ? 'disabled' : ''}>
                    ${res.remediated ? 'Optimized' : 'Remediate'}
                </button>
            </td>
        `;
        
        // Click row to show script code
        row.addEventListener("click", (e) => {
            // Ignore clicking the action button itself
            if (e.target.classList.contains("remediate-row-btn")) return;
            
            selectedResourceId = res.id;
            updateDashboardUI(AppState.state);
        });

        tableBody.appendChild(row);
    });

    // Update Script box view for selected resource
    const selectedResource = state.resources.find(r => r.id === selectedResourceId);
    const codeBlock = document.getElementById("script-code-block");
    const applyBtn = document.getElementById("remediate-item-btn");
    const testBtn = document.getElementById("test-script-btn");

    if (selectedResource) {
        codeBlock.textContent = WasteDetective.generateScript(selectedResource, selectedScriptLanguage);
        applyBtn.disabled = selectedResource.remediated;
        testBtn.disabled = selectedResource.remediated;
    } else {
        codeBlock.textContent = "// Select a zombie resource in the table above to view code details...";
        applyBtn.disabled = true;
        testBtn.disabled = true;
    }

    // Update charts data
    updateCharts(state.history);

    // Render support feedback feed
    renderFeedbackFeed(state);
}

function bindDashboardEvents() {
    const tabBtns = document.querySelectorAll(".panel-tab-btn");
    const panels = document.querySelectorAll(".panel-content");
    const agentToggleBtn = document.getElementById("agent-toggle-btn");
    const clearLogsBtn = document.getElementById("clear-logs-btn");
    
    // Script box controls
    const scriptLangBtns = document.querySelectorAll(".script-tab");
    const applyRemediationBtn = document.getElementById("remediate-item-btn");
    const testSandboxBtn = document.getElementById("test-script-btn");
    const copyScriptBtn = document.getElementById("copy-script-btn");

    // LLM routing cop elements
    const presetBtns = document.querySelectorAll(".preset-prompt-btn");
    const promptInput = document.getElementById("cop-prompt-input");
    const routePromptBtn = document.getElementById("route-prompt-btn");

    // Dashboard panel tab switcher (Waste vs LLM Router)
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(`panel-${btn.dataset.panel}`).classList.add("active");
            AppState.updateTelemetry({ activeTab: btn.dataset.panel });
        });
    });

    // Autonomous Mode switch
    agentToggleBtn.addEventListener("click", () => {
        Agent.toggle();
    });

    // Clear console shell log
    clearLogsBtn.addEventListener("click", () => {
        Logger.clear();
    });

    // Script tab switch (Terraform vs CLI)
    scriptLangBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            scriptLangBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedScriptLanguage = btn.dataset.lang;
            updateDashboardUI(AppState.state);
        });
    });

    // Copy script code
    copyScriptBtn.addEventListener("click", () => {
        const codeText = document.getElementById("script-code-block").textContent;
        navigator.clipboard.writeText(codeText).then(() => {
            const originalText = copyScriptBtn.textContent;
            copyScriptBtn.textContent = "Copied!";
            setTimeout(() => copyScriptBtn.textContent = originalText, 1500);
        });
    });

    // Test Sandbox execution
    testSandboxBtn.addEventListener("click", () => {
        const res = AppState.state.resources.find(r => r.id === selectedResourceId);
        if (res) {
            Logger.log(`[TEST-SANDBOX] Verifying syntax of generated ${selectedScriptLanguage} policy...`, "info");
            setTimeout(() => {
                Logger.log(`[TEST-SANDBOX] Syntax Check OK. Policy matches API targets for ${res.name}.`, "success");
            }, 800);
        }
    });

    // Apply specific remediation manually
    applyRemediationBtn.addEventListener("click", () => {
        const res = AppState.state.resources.find(r => r.id === selectedResourceId);
        if (res && !res.remediated) {
            Logger.log(`Manual Override: remediating resource ${res.name}`, "warn");
            Logger.log(`Executing: terraform apply -target=aws_instance.${res.id}`, "code");
            
            setTimeout(() => {
                const updated = AppState.remediateResource(res.id);
                if (updated) {
                    Logger.log(`Remediation Complete. Removed waste cost of $${updated.cost.toFixed(2)}/mo.`, "success");
                }
            }, 1000);
        }
    });

    // Hook inline table row remediation buttons
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("remediate-row-btn")) {
            const id = e.target.dataset.id;
            const res = AppState.state.resources.find(r => r.id === id);
            if (res) {
                Logger.log(`Targeted click remediation triggered for ${res.name}`, "info");
                AppState.remediateResource(id);
            }
        }
    });

    // LLM presets clicks
    presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            promptInput.value = btn.dataset.prompt;
        });
    });

    // Prompt Route trigger
    routePromptBtn.addEventListener("click", () => {
        const prompt = promptInput.value;
        if (!prompt || prompt.trim() === '') return;

        // Visual flow animation
        const flowInput = document.getElementById("flow-input");
        const flowDecision = document.getElementById("flow-decision");
        const flowOutput = document.getElementById("flow-output-model");

        flowInput.style.borderColor = "var(--accent-indigo)";
        flowInput.style.boxShadow = "0 0 10px rgba(99, 102, 241, 0.4)";

        setTimeout(() => {
            flowDecision.style.borderColor = "var(--accent-violet)";
            flowDecision.style.boxShadow = "0 0 10px rgba(139, 92, 246, 0.4)";
        }, 300);

        // Run classification
        const result = TrafficCop.route(prompt);

        setTimeout(() => {
            // Update routing display values
            document.getElementById("cop-complexity-index").textContent = `${result.complexityIndex} / 10`;
            document.getElementById("cop-input-tokens").textContent = `${result.inputTokens} tkn`;
            
            const targetEl = document.getElementById("cop-routed-target");
            targetEl.textContent = result.routedTarget;
            
            // Color grade route output
            const isPremium = result.routedTarget.includes("API");
            if (isPremium) {
                targetEl.className = "text-gradient font-space";
                flowOutput.style.borderColor = "var(--accent-indigo)";
                flowOutput.style.boxShadow = "0 0 10px rgba(99, 102, 241, 0.4)";
                flowOutput.textContent = "Claude API";
            } else {
                targetEl.className = "text-green font-space";
                flowOutput.style.borderColor = "var(--accent-emerald)";
                flowOutput.style.boxShadow = "0 0 10px rgba(16, 185, 129, 0.4)";
                flowOutput.textContent = "Llama-3 (Local)";
            }

            document.getElementById("cop-route-cost").textContent = `$${result.routedCost.toFixed(5)}`;
            document.getElementById("cop-premium-cost").textContent = `$${result.premiumCost.toFixed(5)}`;
            
            const savingsPercent = result.premiumCost > 0 ? Math.round((result.savings / result.premiumCost) * 100) : 0;
            document.getElementById("cop-cost-savings").textContent = `$${result.savings.toFixed(5)} (${savingsPercent}%)`;
            
            document.getElementById("routing-explanation").textContent = result.explanation;

            // Commit results in AppState
            AppState.recordRoutingEvent(isPremium, result.savings);

            // Log output
            Logger.log(`[ROUTING-BENCH] Evaluated text query. Length: ${prompt.length} chars.`, "info");
            Logger.log(`[ROUTING-BENCH] Selected Route: ${result.routedTarget} (Est savings: $${result.savings.toFixed(5)})`, "success");

            // Reset animation styles
            setTimeout(() => {
                flowInput.style.borderColor = "";
                flowInput.style.boxShadow = "";
                flowDecision.style.borderColor = "";
                flowDecision.style.boxShadow = "";
                flowOutput.style.borderColor = "";
                flowOutput.style.boxShadow = "";
            }, 1500);

        }, 800);
    });
}

/* ==========================================================================
   6. OPTIONS SIDE DRAWER LOGIC
   ========================================================================== */
function bindOptionsDrawerEvents() {
    const openBtn = document.getElementById("open-options-btn");
    const closeBtn = document.getElementById("close-options-btn");
    const drawer = document.getElementById("options-drawer");
    const overlay = document.getElementById("drawer-overlay");

    const tabBtns = document.querySelectorAll(".drawer-tab-btn");
    const contents = document.querySelectorAll(".drawer-tab-content");

    // Open drawer
    openBtn.addEventListener("click", () => {
        drawer.classList.add("active");
        Logger.log("Opening System Option Drawer Panel.", "info");
    });

    // Close drawer
    const closeDrawer = () => {
        drawer.classList.remove("active");
    };
    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);

    // Inner drawer tab selector
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            document.getElementById(`drawer-tab-${btn.dataset.drawerTab}`).classList.add("active");
        });
    });

    // Star rating handler
    const starBtns = document.querySelectorAll("#feedback-stars .star-btn");
    let currentRating = 0;

    starBtns.forEach(star => {
        // Hover effect
        star.addEventListener("mouseover", () => {
            const val = parseInt(star.dataset.value);
            starBtns.forEach(s => {
                if (parseInt(s.dataset.value) <= val) {
                    s.classList.add("hover");
                } else {
                    s.classList.remove("hover");
                }
            });
        });

        star.addEventListener("mouseout", () => {
            starBtns.forEach(s => s.classList.remove("hover"));
        });

        // Click to set rating
        star.addEventListener("click", () => {
            currentRating = parseInt(star.dataset.value);
            starBtns.forEach(s => {
                if (parseInt(s.dataset.value) <= currentRating) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
            Logger.log(`Feedback Rating selected: ${currentRating}/5 stars.`, "info");
        });
    });

    // Feedback form submission
    const feedbackForm = document.getElementById("feedback-form");
    const feedbackSuccess = document.getElementById("feedback-success-msg");

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const feedbackText = document.getElementById("feedback-text").value;

            if (currentRating === 0) {
                Logger.log("Feedback submission failed: Please select a star rating first.", "warn");
                return;
            }

            // Add feedback to the app state
            const currentUser = AppState.state.user;
            AppState.addFeedback(currentUser.name, currentUser.role, currentRating, feedbackText);

            Logger.log(`[USER-FEEDBACK] Received rating: ${currentRating}/5. Comments: "${feedbackText}"`, "success");
            
            // Hide form and show success
            feedbackForm.style.display = "none";
            feedbackSuccess.classList.remove("hidden");

            // Reset after a delay
            setTimeout(() => {
                feedbackForm.reset();
                currentRating = 0;
                starBtns.forEach(s => s.classList.remove("active"));
                feedbackForm.style.display = "flex";
                feedbackSuccess.classList.add("hidden");
            }, 8000);
        });
    }

    // AI Chat Support Event Listeners
    const chatInput = document.getElementById("support-chat-input");
    const chatSendBtn = document.getElementById("support-chat-send-btn");
    const chatLog = document.getElementById("support-chat-log");

    const lockedCard = document.getElementById("support-card-locked");
    const unlockedCard = document.getElementById("support-card-unlocked");
    const linkedinAutoMsg = document.getElementById("linkedin-auto-msg");
    const linkedinBtn = document.getElementById("linkedin-contact-btn");

    if (chatSendBtn && chatInput) {
        const sendChatMessage = () => {
            const query = chatInput.value.trim();
            if (query === "") return;

            // Clear input
            chatInput.value = "";

            // Append User message
            const userBubble = document.createElement("div");
            userBubble.className = "chat-bubble user";
            userBubble.innerHTML = `<strong>You:</strong> ${query}`;
            chatLog.appendChild(userBubble);
            chatLog.scrollTop = chatLog.scrollHeight;

            // Typing indicator
            const typingBubble = document.createElement("div");
            typingBubble.className = "chat-bubble ai typing";
            typingBubble.innerHTML = "<em>AI Assistant is thinking...</em>";
            chatLog.appendChild(typingBubble);
            chatLog.scrollTop = chatLog.scrollHeight;

            // Log query event in UNIX terminal
            Logger.log(`AI Support Chat query: "${query}"`, "info");

            // Process response
            setTimeout(() => {
                typingBubble.remove();
                
                const lowerQuery = query.toLowerCase();
                let response = "";

                if (lowerQuery.includes("terraform") || lowerQuery.includes("permission") || lowerQuery.includes("iam") || lowerQuery.includes("access") || lowerQuery.includes("deny")) {
                    response = "<strong>AI Assistant:</strong> Terraform Access Denied / Permission Error detected.<br><br><strong>Actionable Steps:</strong><br>1. Confirm your cloud role has <code>sts:AssumeRole</code> policy credentials attached.<br>2. Ensure Billing and CloudWatch ReadOnlyAccess configs are mapped.<br>3. Verify your local AWS config matches the Account ID.";
                } else if (lowerQuery.includes("rds") || lowerQuery.includes("database") || lowerQuery.includes("timeout") || lowerQuery.includes("db")) {
                    response = "<strong>AI Assistant:</strong> Database Connection/Waste anomaly detected.<br><br><strong>Actionable Steps:</strong><br>1. Check if <code>dev-analytics-db</code> database has active connections.<br>2. To remediate safely, create a final snapshot when deleting: <code>aws rds delete-db-instance --skip-final-snapshot</code>.<br>3. You can click 'Remediate' directly in the waste table.";
                } else if (lowerQuery.includes("agent") || lowerQuery.includes("autonomous") || lowerQuery.includes("auto") || lowerQuery.includes("run")) {
                    response = "<strong>AI Assistant:</strong> Autonomous Mode operational guidance.<br><br><strong>Actionable Steps:</strong><br>1. Toggle the big red control panel button in the hero area.<br>2. Keep the logs terminal open to watch live automation cycles.<br>3. Sweeps run every 4 seconds, and LLM routes run every 3 seconds.";
                } else {
                    response = "<strong>AI Assistant:</strong> Query evaluated.<br><br><strong>Actionable Steps:</strong><br>1. Ensure your linked organization credentials are correct.<br>2. Review the live metrics graphs on the dashboard.<br>3. If this did not resolve your issue, I have unlocked the LinkedIn contact card below so you can ask the lead developer directly.";
                }

                const aiBubble = document.createElement("div");
                aiBubble.className = "chat-bubble ai";
                aiBubble.innerHTML = response;
                chatLog.appendChild(aiBubble);
                chatLog.scrollTop = chatLog.scrollHeight;

                // Unlock LinkedIn contact desk
                if (lockedCard && unlockedCard) {
                    lockedCard.classList.add("hidden");
                    unlockedCard.classList.remove("hidden");
                }

                // Generate LinkedIn pre-filled message template
                if (linkedinAutoMsg) {
                    const company = AppState.state.user.linkedCompany;
                    const truncatedQuery = query.length > 40 ? query.substring(0, 37) + "..." : query;
                    linkedinAutoMsg.value = `Hello Sarikonda Manohar Raju, I am a user of the CloudOptima Engine (linked to company: ${company}). I tried resolving my query about "${truncatedQuery}" using the AI Chat Box suggestions but still need assistance. Let's connect!`;
                }

            }, 1000);
        };

        chatSendBtn.addEventListener("click", sendChatMessage);
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendChatMessage();
            }
        });
    }

    // LinkedIn copy welcome message and open profile handler
    if (linkedinBtn) {
        linkedinBtn.addEventListener("click", () => {
            if (linkedinAutoMsg) {
                const messageText = linkedinAutoMsg.value;
                navigator.clipboard.writeText(messageText).then(() => {
                    Logger.log("LinkedIn welcome message copied to clipboard. Redirecting to Creator profile...", "info");
                    
                    // Show custom toast notification
                    const hub = document.getElementById('notification-hub');
                    const toast = document.createElement('div');
                    toast.className = 'toast-notification';
                    toast.innerHTML = `
                        <div class="toast-icon-wrap" style="background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="height:18px; width:18px;"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div class="toast-content">
                            <div class="toast-title font-space">Message Copied!</div>
                            <div class="toast-message font-space">LinkedIn request message copied. Paste it directly when sending your connection invite!</div>
                        </div>
                    `;
                    hub.appendChild(toast);
                    
                    setTimeout(() => toast.remove(), 4000);

                    // Open LinkedIn in a new window
                    setTimeout(() => {
                        window.open("https://www.linkedin.com/in/sarikonda-manohar-raju-614bba27a", "_blank");
                    }, 500);
                });
            }
        });
    }
}

/* ==========================================================================
   ROUTING UTILITIES
   ========================================================================== */
function transitionView(fromScreenId, toScreenId) {
    const fromEl = document.getElementById(fromScreenId);
    const toEl = document.getElementById(toScreenId);

    if (fromEl && toEl) {
        fromEl.classList.remove("active");
        fromEl.classList.add("hidden");
        
        setTimeout(() => {
            toEl.classList.remove("hidden");
            toEl.classList.add("active");
        }, 300);
    }
}

/* ==========================================================================
   PUBLIC FEEDBACK FEED DRAWING UTILITY
   ========================================================================== */
function renderFeedbackFeed(state) {
    const feedContainer = document.getElementById("feedback-terminal-feed");
    const feedCountEl = document.getElementById("feedback-feed-count");
    if (!feedContainer) return;

    // Filter feedbacks by 30 days limit
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const filteredFeedbacks = state.feedbacks.filter(fb => {
        const fbTime = new Date(fb.timestamp).getTime();
        return fbTime >= thirtyDaysAgo;
    });

    feedCountEl.textContent = `${filteredFeedbacks.length} Feedbacks`;
    feedContainer.innerHTML = "";

    if (filteredFeedbacks.length === 0) {
        feedContainer.innerHTML = `<div class="text-center font-space" style="font-size: 12px; color: var(--text-muted); padding: 20px;">No public feedback posted in the last 30 days.</div>`;
        return;
    }

    // Check if current user is admin (Manohar Raju / Sarikonda)
    const isAdmin = state.user.name.toLowerCase().includes("manohar") || state.user.name.toLowerCase().includes("sarikonda");

    filteredFeedbacks.forEach(fb => {
        const item = document.createElement("div");
        item.className = "feedback-feed-item";

        const starsStr = "★".repeat(fb.rating) + "☆".repeat(5 - fb.rating);
        const fbDate = new Date(fb.timestamp);
        const dateStr = fbDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Add Delete Button if Admin
        let deleteBtnHtml = "";
        if (isAdmin) {
            deleteBtnHtml = `
                <button class="feedback-delete-btn" data-id="${fb.id}" title="Delete feedback (Admin only)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="height:12px; width:12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            `;
        }

        item.innerHTML = `
            <div class="feedback-item-header font-space">
                <div class="feedback-item-user">
                    <span class="feedback-user-name">${fb.name}</span>
                    <span class="feedback-user-role">${fb.role}</span>
                </div>
                <div class="feedback-item-meta">
                    <span class="feedback-item-stars">${starsStr}</span>
                    <span class="feedback-item-date font-mono">${dateStr}</span>
                </div>
            </div>
            <div class="feedback-item-text font-space">${fb.comment}</div>
            ${deleteBtnHtml}
        `;

        // Handle delete event
        const delBtn = item.querySelector(".feedback-delete-btn");
        if (delBtn) {
            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete this feedback from the public feed?`)) {
                    AppState.deleteFeedback(fb.id);
                    Logger.log(`Admin action: Deleted feedback entry ID ${fb.id}.`, "warn");
                }
            });
        }

        feedContainer.appendChild(item);
    });
}
