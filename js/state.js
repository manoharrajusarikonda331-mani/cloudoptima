/* ==========================================================================
   CLOUDO-OPTIMA STATE ENGINE
   Centralized telemetry model and application store
   ========================================================================== */

class StateManager {
    constructor() {
        this.state = {
            // User & Organization Profile
            user: {
                name: "Guest Sandbox User",
                email: "sandbox@cloudoptima.internal",
                role: "FinOps Engineer",
                phone: "+91 99999 88888",
                loggedIn: false,
                twoFactorVerified: false,
                linkedCompany: "CloudOptima Corp",
                cloudProvider: "AWS",
                accountId: "123456789012",
                roleArn: "arn:aws:iam::123456789012:role/FinOps"
            },
            
            // Financial & Resource Telemetry
            telemetry: {
                wastedCost: 14245.80,    // Starts high
                savedCost: 0.00,        // Starts zero
                efficiencyScore: 42,    // Starts at 42%
                isAgentActive: false,   // Autonomous mode flag
                activeTab: "waste"      // Current panel tab
            },

            // Heuristics & Metrics History (for Chart drawings)
            history: {
                labels: ["09:00", "09:10", "09:20", "09:30", "09:40", "09:50"],
                cloudSpend: [420, 420, 420, 420, 420, 420],
                llmSpend: [85, 92, 110, 95, 125, 118],
                routingDistribution: {
                    local: 0,
                    premium: 0
                }
            },

            // Resources database (Cloud Waste Detective)
            resources: [
                {
                    id: "res-ec2-01",
                    name: "Staging-Testing-Environment",
                    type: "EC2 Instance (m5.4xlarge)",
                    metrics: "Avg CPU: 1.8% • RAM: 4%",
                    cost: 480.00,
                    status: "zombie", // zombie, underutilized, optimized
                    provider: "AWS",
                    recommendation: "Downscale to t3.medium or Terminate",
                    remediated: false,
                    details: {
                        instanceId: "i-09f02931bc109f",
                        region: "us-east-1",
                        unusedDays: 24,
                        policyCode: "Downscale"
                    }
                },
                {
                    id: "res-rds-02",
                    name: "dev-analytics-db",
                    type: "RDS Postgres (db.r5.2xlarge)",
                    metrics: "Active Conns: 0 • CPU: 0.5%",
                    cost: 650.00,
                    status: "zombie",
                    provider: "AWS",
                    recommendation: "Terminate instance & take final snapshot",
                    remediated: false,
                    details: {
                        dbId: "rds-analytics-dev-01",
                        region: "us-east-1",
                        unusedDays: 45,
                        policyCode: "Terminate"
                    }
                },
                {
                    id: "res-ebs-03",
                    name: "orphaned-backup-vol-2025",
                    type: "EBS Storage Volume (gp3 2TB)",
                    metrics: "Status: Unattached (Detached)",
                    cost: 160.00,
                    status: "underutilized",
                    provider: "AWS",
                    recommendation: "Snapshot & Delete detached volume",
                    remediated: false,
                    details: {
                        volumeId: "vol-0a8b9c10d2e3f",
                        region: "us-east-1",
                        unusedDays: 90,
                        policyCode: "Delete"
                    }
                },
                {
                    id: "res-ec2-04",
                    name: "prod-log-parser-heavy",
                    type: "EC2 Instance (c6i.2xlarge)",
                    metrics: "Avg CPU: 8.5% • RAM: 18%",
                    cost: 320.00,
                    status: "underutilized",
                    provider: "AWS",
                    recommendation: "Downscale to c6i.large",
                    remediated: false,
                    details: {
                        instanceId: "i-0b2a3c4d5e6f7g",
                        region: "us-east-1",
                        unusedDays: 14,
                        policyCode: "Downscale"
                    }
                },
                {
                    id: "res-gcs-05",
                    name: "temp-migration-bucket",
                    type: "S3 Standard Storage (5TB)",
                    metrics: "Last Access: 120 days ago",
                    cost: 115.00,
                    status: "underutilized",
                    provider: "AWS",
                    recommendation: "Move to Glacier Deep Archive",
                    remediated: false,
                    details: {
                        bucketName: "cloudoptima-temp-migration-data",
                        region: "us-east-1",
                        unusedDays: 120,
                        policyCode: "LifecyclePolicy"
                    }
                }
            ],
            
            // Log History (saved session logs)
            logs: [],

            // Feedbacks list
            feedbacks: JSON.parse(localStorage.getItem('cloudoptima_feedbacks')) || [
                {
                    id: "fb-1",
                    name: "Alex Carter",
                    role: "DevOps Engineer",
                    rating: 5,
                    comment: "The Terraform repair script generator is a life-saver! Saved us hours of manual server audits.",
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: "fb-2",
                    name: "Sofia Rodriguez",
                    role: "CFO / Finance Director",
                    rating: 4,
                    comment: "Decent cost Offloader. Offloading simple queries to local models reduced our API bill by 35% this week.",
                    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: "fb-3",
                    name: "Rajesh Kumar",
                    role: "Solutions Architect",
                    rating: 5,
                    comment: "Autonomous mode runs flawlessly. Swept our staging zone and resized instances instantly. Very robust dashboard.",
                    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],

            // Notifications List
            notifications: [
                {
                    id: "notif-1",
                    title: "System Online",
                    message: "CloudOptima connection tunnel established successfully.",
                    type: "success",
                    timestamp: new Date().toISOString(),
                    read: false
                }
            ],
            
            // LLM Cop sensitivity threshold
            routingThreshold: 5
        };
        
        // Listeners for telemetry or state changes
        this.listeners = [];
    }

    // Add new system notification
    addNotification(title, message, type = "info") {
        const notif = {
            id: "notif-" + Math.random().toString(36).substring(2, 9),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };
        this.state.notifications.unshift(notif);
        
        // Keep only last 25 notifications to save memory
        if (this.state.notifications.length > 25) {
            this.state.notifications.pop();
        }
        
        this.notify();
        return notif;
    }

    // Mark all as read
    markNotificationsAsRead() {
        this.state.notifications.forEach(n => n.read = true);
        this.notify();
    }

    // Clear notifications
    clearNotifications() {
        this.state.notifications = [];
        this.notify();
    }

    // Update routing threshold
    updateRoutingThreshold(val) {
        this.state.routingThreshold = parseInt(val);
        this.notify();
    }

    // Save feedbacks array to LocalStorage
    saveFeedbacks() {
        localStorage.setItem('cloudoptima_feedbacks', JSON.stringify(this.state.feedbacks));
    }

    // Add a new user feedback item
    addFeedback(name, role, rating, comment) {
        const newFb = {
            id: 'fb-' + Math.random().toString(36).substring(2, 9),
            name: name || "Anonymous User",
            role: role || "Cloud Operator",
            rating: parseInt(rating),
            comment: comment,
            timestamp: new Date().toISOString()
        };
        this.state.feedbacks.unshift(newFb);
        this.saveFeedbacks();
        this.notify();
        return newFb;
    }

    // Delete feedback (Admin function)
    deleteFeedback(id) {
        this.state.feedbacks = this.state.feedbacks.filter(f => f.id !== id);
        this.saveFeedbacks();
        this.notify();
    }

    // Get feedbacks within 30 days limit
    getFilteredFeedbacks() {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return this.state.feedbacks.filter(fb => {
            const fbTime = new Date(fb.timestamp).getTime();
            return fbTime >= thirtyDaysAgo;
        });
    }

    // Subscribe to state updates
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all subscribers of state changes
    notify() {
        this.listeners.forEach(callback => callback(this.state));
    }

    // Update specific telemetry values
    updateTelemetry(updates) {
        this.state.telemetry = { ...this.state.telemetry, ...updates };
        this.notify();
    }

    // Update user profile details
    updateUser(updates) {
        this.state.user = { ...this.state.user, ...updates };
        this.notify();
    }

    // Add a routed query event details to history logs
    recordRoutingEvent(isPremium, savings) {
        if (isPremium) {
            this.state.history.routingDistribution.premium += 1;
        } else {
            this.state.history.routingDistribution.local += 1;
        }
        
        // Secure savings immediately
        const newSavings = this.state.telemetry.savedCost + savings;
        this.updateTelemetry({ savedCost: newSavings });
        
        this.notify();
    }

    // Remediate a specific cloud resource
    remediateResource(id) {
        const res = this.state.resources.find(r => r.id === id);
        if (res && !res.remediated) {
            res.remediated = true;
            res.status = "optimized";
            
            // Adjust totals
            const itemWaste = res.cost;
            const newWasted = Math.max(0, this.state.telemetry.wastedCost - itemWaste);
            const newSaved = this.state.telemetry.savedCost + itemWaste;
            
            // Scale efficiency score up
            const activeCount = this.state.resources.filter(r => !r.remediated).length;
            const totalCount = this.state.resources.length;
            const newEfficiency = Math.round(42 + ((totalCount - activeCount) / totalCount) * 56);
            
            // Update spend histories
            const latestCloudSpend = this.state.history.cloudSpend[this.state.history.cloudSpend.length - 1];
            this.state.history.cloudSpend.push(Math.max(100, latestCloudSpend - itemWaste));
            this.state.history.llmSpend.push(this.state.history.llmSpend[this.state.history.llmSpend.length - 1]);
            
            // Add label
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            this.state.history.labels.push(timeStr);
            
            if (this.state.history.labels.length > 8) {
                this.state.history.labels.shift();
                this.state.history.cloudSpend.shift();
                this.state.history.llmSpend.shift();
            }

            this.updateTelemetry({
                wastedCost: newWasted,
                savedCost: newSaved,
                efficiencyScore: newEfficiency
            });
            
            return res;
        }
        return null;
    }
}

// Single instance exports
export const AppState = new StateManager();
