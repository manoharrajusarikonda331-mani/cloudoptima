/* ==========================================================================
   CLOUDO-OPTIMA AUTONOMOUS AGENT ORCHESTRATOR
   Handles continuous background scanning, auto-scaling, and LLM simulation
   ========================================================================== */

import { AppState } from './state.js';
import { Logger } from './logger.js';
import { TrafficCop } from './trafficCop.js';

class AgentOrchestrator {
    constructor() {
        this.scanInterval = null;
        this.trafficInterval = null;
        this.simulatedPrompts = [
            "Translate 'Please review this expense report' to German",
            "What is 15% of $14,245?",
            "Write a Python script to check if an S3 bucket is public",
            "Correct spelling: 'The cloud bill are too high for this month'",
            "Explain VPC peering in AWS in one sentence",
            "Summarize the 200-page AWS Security Best Practices handbook and extract key identity rules",
            "Generate a Kubernetes manifest for a stateless web application with 3 replicas and custom SSL ingress policies",
            "Check my server log: 'Error 500: Database connection pool exhausted at us-east-1'",
            "Find the bugs in this 500-line java controller class: [File attachment: PaymentController.java]",
            "Draft a cloud migration cost report comparing AWS EC2 vs GCP Compute Engine for 500 instances over 3 years"
        ];
    }

    // Toggle Agent Mode
    toggle() {
        const currentStatus = AppState.state.telemetry.isAgentActive;
        const newStatus = !currentStatus;

        AppState.updateTelemetry({ isAgentActive: newStatus });

        if (newStatus) {
            this.start();
            AppState.addNotification("Agent Activated", "Autonomous FinOps Agent started background infrastructure scans.", "success");
        } else {
            this.stop();
            AppState.addNotification("Agent Suspended", "Autonomous loops halted. Switched to manual controls.", "warn");
        }
        
        return newStatus;
    }

    // Start background operations
    start() {
        Logger.log("Autonomous FinOps Agent activated.", "success");
        Logger.log("Policies loaded: AutoDownscaleZombie, UnattachedStoragePurge, LowComplexityOffloader.", "info");
        
        // Loop 1: Scanning and Auto-remediation (Runs every 4 seconds)
        this.scanInterval = setInterval(() => {
            this.performCloudScan();
        }, 4000);

        // Loop 2: Simulated LLM query traffic stream (Runs every 3 seconds)
        this.trafficInterval = setInterval(() => {
            this.simulateLLMTraffic();
        }, 3000);
    }

    // Stop background operations
    stop() {
        clearInterval(this.scanInterval);
        clearInterval(this.trafficInterval);
        this.scanInterval = null;
        this.trafficInterval = null;
        
        Logger.log("Autonomous FinOps Agent suspended. Reverting to manual monitoring.", "warn");
    }

    // Agent Action: Scan Cloud and apply Terraform scripts to waste
    performCloudScan() {
        const resources = AppState.state.resources;
        const target = resources.find(r => !r.remediated);

        if (target) {
            Logger.log(`Scanning infrastructure... Found ${target.status.toUpperCase()} resource: ${target.name}`, "warn");
            Logger.log(`Applying agent policy: ${target.recommendation}`, "info");
            
            // Simulating execution latency
            setTimeout(() => {
                const updated = AppState.remediateResource(target.id);
                if (updated) {
                    Logger.log(`Executing IaC deployment command:`, "info");
                    Logger.log(`terraform apply -auto-approve -target=aws_instance.${target.id.replace(/-/g, '_')}`, "code");
                    Logger.log(`Successfully remediated ${updated.name}! Secured $${updated.cost.toFixed(2)}/mo in savings.`, "success");
                    
                    // Add notification to state silently (increments header bell counter)
                    AppState.addNotification("Auto Remediated", `Successfully optimized ${updated.name}. Secured $${updated.cost.toFixed(2)}/mo.`, "success");
                }
            }, 1500);
        } else {
            Logger.log("Infrastructure sweep complete. All resources fully optimized. Waste Overhead: $0.00.", "success");
        }
    }

    // Agent Action: Simulate prompt requests and route them
    simulateLLMTraffic() {
        // Pick random prompt from database
        const randomIndex = Math.floor(Math.random() * this.simulatedPrompts.length);
        const prompt = this.simulatedPrompts[randomIndex];
        
        Logger.log(`Incoming Query: "${prompt.substring(0, 50)}..."`, "info");
        
        const result = TrafficCop.route(prompt, AppState.state.routingThreshold);
        
        setTimeout(() => {
            // Register details in AppState history
            const isPremium = result.routedTarget.includes("API");
            AppState.recordRoutingEvent(isPremium, result.savings);
            
            if (isPremium) {
                Logger.log(`[ROUTED] Complexity: ${result.complexityIndex}/10 -> ${result.routedTarget}. Cost: $${result.routedCost.toFixed(5)}`, "warn");
            } else {
                Logger.log(`[ROUTED] Complexity: ${result.complexityIndex}/10 -> Offloaded to ${result.routedTarget}. Saved: $${result.savings.toFixed(5)}`, "success");
            }
            AppState.addNotification("Traffic Cop Route", `Simulated query routed to ${isPremium ? 'Claude API' : 'Local Llama-3'}. Complexity: ${result.complexityIndex}/10. Saved: $${result.savings.toFixed(4)}`, isPremium ? "info" : "success");
        }, 800);
    }

    // Display a custom toast notification in the DOM
    showNotification(title, message) {
        const hub = document.getElementById('notification-hub');
        if (!hub) return;

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="height:18px; width:18px;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <div class="toast-content">
                <div class="toast-title font-space">${title}</div>
                <div class="toast-message font-space">${message}</div>
            </div>
        `;
        
        hub.appendChild(toast);
        
        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'toast-slide-in 0.4s reverse cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    }
}

export const Agent = new AgentOrchestrator();
