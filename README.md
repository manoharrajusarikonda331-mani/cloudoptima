# CloudOptima: Agentic FinOps Engine for Cloud Infrastructure & LLM Cost Engineering

CloudOptima is an AI-powered financial operations (FinOps) autonomous assistant designed to detect cloud infrastructure waste and dynamically route LLM traffic. By automating resource sizing and prompt offloading, CloudOptima helps organizations reduce their technical operational overheads by **up to 40%**.

Built as a lightweight, zero-build-step **Single Page Application (SPA)**, this dashboard can be deployed instantly to **GitHub Pages** for hackathons and live evaluations.

---

## 💡 The Core Concept: The "Smart Auto-Saves" Brain

Modern enterprises leak massive financial capital on their tech stacks in two primary areas:
1. **Orphaned and Over-provisioned Servers:** Large cloud virtual machines (e.g. EC2 instances or database nodes) running 24/7 with under 2% utilization.
2. **Heavy LLM API Pricing:** Sending trivial tasks (like simple translations or spelling checks) to premium commercial models (like Claude 3.5 Sonnet or GPT-4o) when a tiny, local model can do it for free.

CloudOptima works autonomously as a FinOps controller to scan your infrastructure, generate downscaling scripts, evaluate incoming prompt complexity, and route requests to the most cost-efficient models.

---

## 🛠️ Key Product Features

### 1. Cloud Waste Detective (Infrastructure Scanner)
- **Zombie Instance Mapping:** Scans tables of virtual servers and database nodes to calculate idle costs.
- **Dynamic Infrastructure-as-Code (IaC) Generation:** Compiles syntactically-valid Terraform templates and AWS CLI shell scripts tailored to downscale or decommission marked resources.
- **Remediation Sandbox:** Supports sandbox tests to verify syntax before code execution.

### 2. Smart AI Traffic Cop (LLM Cost Router)
- **Prompt Complexity Analysis:** Measures query string lengths, token weights, and structural terms (e.g., requests for heavy database shards vs. simple greetings).
- **Target Routing:** Automatically routes low-complexity queries to a free/local instance (e.g., Llama-3-8B) and escalates complex queries to premium models.
- **Cost Savings Benchmarking:** Compares execution costs, token sizes, and latencies, updating charts in real-time.

### 3. Autonomous Agent Mode
- **Continuous Scans & Repair:** Toggles a state-driven automated clock cycle where the agent scans, generates scripts, triggers simulated deployments, and dynamically manages LLM request routing metrics.
- **Live Agent Terminal Shell:** Displays real-time UNIX terminal logging, compiling deployment telemetry in a readable format.

---

## ⚙️ Architecture & Tech Stack

- **Core Structure:** Semantic HTML5, Vanilla CSS3 (custom variables, keyframe animations, glassmorphic layout).
- **Visual Telemetry:** Interactive graphs rendering dynamic datasets using **Chart.js** via CDN.
- **Icons:** Custom SVG drawings and Lucide representations.
- **Routing Engine:** ES6 JavaScript Modules managing modular state changes.
- **Zero-Dependency Hosting:** Native support for static file servers and browser runtime files.

---

## 🚀 How to Run Locally

Since the application runs completely in-browser without complex server setups, you can run it with any local static files web server:

### Option A: Using Python (Recommended)
1. Navigate to the project root directory:
   ```bash
   cd cloudoptima
   ```
2. Launch Python's built-in HTTP server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

### Option B: VS Code Live Server extension
- Open the folder in VS Code, right-click `index.html`, and select **Open with Live Server**.

---

## 🌎 Deploying to GitHub Pages (Live GitHub Site Link)

You can host this project on your GitHub repository and make it live for the hackathon judges using **GitHub Pages** in under 60 seconds:

1. **Create a GitHub Repository:**
   - Create a new public repository on GitHub named `cloudoptima`.
2. **Push the Code:**
   - Initialize git, commit your files, and push them to your repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit of CloudOptima FinOps Dashboard"
     git branch -M main
     git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cloudoptima.git
     git push -u origin main
     ```
3. **Enable GitHub Pages:**
   - Navigate to your repository page on GitHub.
   - Go to **Settings** (top tabs) -> **Pages** (left menu).
   - Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
4. **Access the Site:**
   - Wait 30 seconds. Your live website link will be displayed at the top of the Pages section:
     `https://YOUR_GITHUB_USERNAME.github.io/cloudoptima/`

---

## 👨‍💻 Creator Information

* **Creator Name:** **SARIKONDA MANOHAR RAJU**
* **Creator Role:** Web Developer | Full-Stack Development | Cloud-Native Solutions | Independent Developer

### Connect with the Creator:
- **LinkedIn:** [sarikonda-manohar-raju-614bba27a](https://www.linkedin.com/in/sarikonda-manohar-raju-614bba27a)
- **GitHub:** [manoharrajusarikonda331-mani](https://github.com/manoharrajusarikonda331-mani)
- **Instagram:** [@manohar_raju_officiall_331](https://www.instagram.com/manohar_raju_officiall_331)
- **YouTube:** [@manohar_raju_officiall_331](https://youtube.com/@manohar_raju_officiall_331)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
