/* ==========================================================================
   CLOUDO-OPTIMA SMART LLM TRAFFIC COP
   Classifies prompt complexity and routes traffic to minimize API costs
   ========================================================================== */

export const TrafficCop = {
    // Analyze input prompt and return routing decision metrics
    route(prompt) {
        if (!prompt || prompt.trim() === '') {
            return {
                complexityIndex: 0.0,
                inputTokens: 0,
                outputTokens: 0,
                routedTarget: "-",
                routedCost: 0.00,
                premiumCost: 0.00,
                savings: 0.00,
                savingsPercent: 0,
                explanation: "Please input a query prompt to evaluate the routing heuristics."
            };
        }

        const cleanPrompt = prompt.toLowerCase().trim();
        const wordCount = cleanPrompt.split(/\s+/).length;
        const charCount = cleanPrompt.length;
        
        // Step 1: Compute Complexity Index (out of 10)
        let complexityIndex = 1.0;
        
        // Base complexity on length
        if (wordCount > 15) complexityIndex += 1.5;
        if (wordCount > 50) complexityIndex += 2.5;
        if (charCount > 500) complexityIndex += 2.0;

        // Keywords analysis
        const highComplexityKeywords = [
            'terraform', 'kubernetes', 'eks', 'k8s', 'architecture', 'architect', 
            'optimize', 'highly available', 'multi-region', 'summary', 'summarize', 
            'audit', 'legislation', 'pdf', 'document', '100-page', 'tax', 
            'analyze', 'analysis', 'aggregate', 'report', 'code base', 'refactor'
        ];

        let keywordMatches = 0;
        highComplexityKeywords.forEach(keyword => {
            if (cleanPrompt.includes(keyword)) {
                complexityIndex += 1.8;
                keywordMatches++;
            }
        });

        // Cap complexity at 10.0
        complexityIndex = Math.min(10.0, Math.round(complexityIndex * 10) / 10);

        // Step 2: Route decision threshold
        // If complexity index is >= 5.0, route to Premium. Otherwise, route Local.
        const isPremiumRoute = complexityIndex >= 5.0;
        
        // Step 3: Compute Tokens (rough heuristic: 1 token = 4 characters)
        const inputTokens = Math.max(4, Math.round(charCount / 4));
        
        // Simulated output token length based on prompt size/complexity
        let outputTokens = 50;
        if (complexityIndex > 3) outputTokens = 150;
        if (complexityIndex > 5) outputTokens = 400;
        if (complexityIndex > 8) outputTokens = 1200;

        // Step 4: Cost structures
        // Premium API rates: Input: $15.00 / M tokens ($0.000015/tkn), Output: $75.00 / M tokens ($0.000075/tkn) (Claude-3.5-Sonnet class)
        const premiumInputCost = inputTokens * 0.000015;
        const premiumOutputCost = outputTokens * 0.000075;
        const premiumTotalCost = Math.round((premiumInputCost + premiumOutputCost) * 100000) / 100000;

        // Local model cost is 0.00 (Self-hosted client hardware / local sandbox node)
        const localCost = 0.00;

        const routedTarget = isPremiumRoute ? "Claude 3.5 Sonnet (API)" : "Local: Llama-3-8B (Free)";
        const routedCost = isPremiumRoute ? premiumTotalCost : localCost;
        
        const savings = isPremiumRoute ? 0.00 : premiumTotalCost;
        const savingsPercent = isPremiumRoute ? 0 : 100;

        let explanation = "";
        if (isPremiumRoute) {
            explanation = `High complexity task detected (Index: ${complexityIndex}/10) with key architectural terms: ${keywordMatches} matches. Query requires deep contextual modeling. Escalated to Premium commercial model to prevent generation failure.`;
        } else {
            explanation = `Low complexity task (Index: ${complexityIndex}/10). Offloaded query to self-hosted local model, avoiding commercial API charges and securing 100% savings.`;
        }

        return {
            complexityIndex,
            inputTokens,
            outputTokens,
            routedTarget,
            routedCost,
            premiumCost: premiumTotalCost,
            savings,
            savingsPercent,
            explanation
        };
    }
};
