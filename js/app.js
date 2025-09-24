// Marketing SuperAgent v3 - Conversational AI Interface
class MarketingSuperAgentV3 {
    constructor() {
        this.currentAgents = [];
        this.messageHistory = [];
        this.agentPanel = document.getElementById('agent-panel');
        this.init();
    }

    init() {
        console.log('Marketing SuperAgent v3 initialized');
        this.setupEventListeners();
        this.setupSuggestedActions();
    }

    setupEventListeners() {
        // Chat input handling
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (message) {
                this.handleUserMessage(message);
                chatInput.value = '';
            }
        };

        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Tool items
        document.querySelectorAll('.tool-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.handleToolClick(tool);
            });
        });

        // AI suggestions
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const suggestion = e.currentTarget.dataset.suggestion;
                const content = e.currentTarget.querySelector('h4').textContent;
                this.handleSuggestionClick(suggestion, content);
            });
        });

        // Agent panel toggle
        const panelToggle = document.getElementById('panel-toggle');
        if (panelToggle) {
            panelToggle.addEventListener('click', () => {
                this.toggleAgentPanel();
            });
        }

        // Navigation items (removed - no sidebar)
    }

    setupSuggestedActions() {
        // Starter cards in new interface
        const starterCards = document.querySelectorAll('.starter-card');
        starterCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                this.handleUserMessage(prompt);
                this.hideStarterSuggestions();
            });
        });

        // Agent cards
        const agentCards = document.querySelectorAll('.agent-card');
        agentCards.forEach(card => {
            card.addEventListener('click', () => {
                const agent = card.dataset.agent;
                this.handleAgentClick(agent);
            });
        });

        // Quick action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleUserMessage(message) {
        // Add user message to chat
        this.addMessage(message, 'user');

        // Hide starter suggestions after first interaction
        this.hideStarterSuggestions();

        // Route message to appropriate agents
        setTimeout(() => {
            this.routeToAgents(message);
        }, 500);
    }

    addMessage(content, sender = 'agent', agentName = 'SuperAgent') {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${content}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="blueGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#6BA3F5;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#4285F4;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path d="M14 2L24 8L24 20L14 26L4 20L4 8L14 2Z" fill="url(#blueGradientSmall)" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
                        <path d="M14 7L19 10L19 18L14 21L9 18L9 10L14 7Z" fill="white" fill-opacity="0.9"/>
                        <path d="M14 11L16.5 12.5L16.5 15.5L14 17L11.5 15.5L11.5 12.5L14 11Z" fill="#4285F4"/>
                    </svg>
                </div>
                <div class="message-content">
                    <div class="message-text">${content}</div>
                </div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        this.messageHistory.push({ content, sender, agentName, timestamp: now });
    }

    routeToAgents(message) {
        const messageType = this.analyzeMessage(message);

        // Show routing indicator
        this.addMessage(
            `🔍 Analyzing your request and routing to specialist agents...`,
            'agent'
        );

        // Activate relevant agents
        setTimeout(() => {
            this.activateAgents(messageType);
            this.generateResponse(message, messageType);
        }, 1500);
    }

    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('brief') || lowerMessage.includes('campaign plan')) {
            return 'brief';
        }
        if (lowerMessage.includes('creative') || lowerMessage.includes('ad') || lowerMessage.includes('visual')) {
            return 'creative';
        }
        if (lowerMessage.includes('journey') || lowerMessage.includes('flow') || lowerMessage.includes('email')) {
            return 'journey';
        }
        if (lowerMessage.includes('performance') || lowerMessage.includes('analytics') || lowerMessage.includes('optimize')) {
            return 'performance';
        }
        if (lowerMessage.includes('audience') || lowerMessage.includes('segment') || lowerMessage.includes('target')) {
            return 'audience';
        }
        if (lowerMessage.includes('budget') || lowerMessage.includes('spend') || lowerMessage.includes('media')) {
            return 'paid-media';
        }

        return 'general';
    }

    activateAgents(messageType) {
        const agentConfigs = {
            brief: ['Deep Research', 'Performance', 'Audience'],
            creative: ['Creative', 'Deep Research'],
            journey: ['Journey', 'Audience'],
            performance: ['Performance', 'Deep Research'],
            audience: ['Audience', 'Deep Research'],
            'paid-media': ['Paid Media', 'Performance'],
            general: ['Deep Research']
        };

        const agents = agentConfigs[messageType] || agentConfigs.general;
        this.updateAgentStatus(agents);
    }

    updateAgentStatus(activeAgents) {
        // Update agent status indicators in the agent panel
        this.updateAgentIndicators(activeAgents);
    }

    updateAgentIndicators(activeAgents) {
        // Reset all agents to ready state
        const allAgentCards = document.querySelectorAll('.agent-card');
        allAgentCards.forEach(card => {
            const status = card.querySelector('.agent-status');
            if (status) status.textContent = 'Ready';
            status.className = 'agent-status ready';
        });

        // Update active agents to working state
        const agentMapping = {
            'Deep Research': 'research',
            'Creative': 'creative',
            'Journey': 'journey',
            'Performance': 'performance',
            'Audience': 'audience',
            'Paid Media': 'paid-media',
            'Historical': 'historical',
            'AI Decisioning': 'decisioning'
        };

        activeAgents.forEach(agentName => {
            const agentType = agentMapping[agentName];
            if (agentType) {
                const agentCard = document.querySelector(`[data-agent="${agentType}"]`);
                if (agentCard) {
                    const status = agentCard.querySelector('.agent-status');
                    if (status) {
                        status.textContent = 'Working';
                        status.className = 'agent-status working';
                    }
                }
            }
        });

        // Update status indicator in header
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusText && statusIndicator) {
            if (activeAgents.length > 0) {
                statusText.textContent = `${activeAgents.length} agents working`;
                statusIndicator.classList.add('active');
            } else {
                statusText.textContent = '8 agents ready';
                statusIndicator.classList.remove('active');
            }
        }
    }

    generateResponse(message, messageType) {
        const responses = {
            brief: {
                agent: 'Campaign Brief Generator',
                content: `I've activated our specialist agents to create a comprehensive campaign brief. The Deep Research Agent is analyzing market trends, the Performance Agent is reviewing historical data, and the Audience Agent is identifying target segments.

Based on your request, I'll generate a detailed brief including:
• Campaign objectives and strategy
• Target audience segments
• Channel recommendations
• Creative direction
• Budget allocation
• Success metrics

<div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
    <button class="btn btn-primary" onclick="app.showCampaignBrief()">
        <i class="fas fa-file-alt"></i> View Campaign Brief
    </button>
    <button class="btn btn-secondary" onclick="app.refineWithAI()">
        <i class="fas fa-magic"></i> Refine with AI
    </button>
</div>`
            },
            creative: {
                agent: 'Creative Generator',
                content: `The Creative Agent is now generating multiple asset variants for your campaign. I'm creating different concepts that will resonate with your target audience while maintaining brand consistency.

What I'm creating:
• Multiple creative concepts
• A/B testing variants
• Brand-compliant designs
• Performance predictions

<div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
    <button class="btn btn-primary" onclick="app.showCreativeAssets()">
        <i class="fas fa-images"></i> View Creative Assets
    </button>
    <button class="btn btn-secondary" onclick="app.generateMoreVariants()">
        <i class="fas fa-plus"></i> Generate More Variants
    </button>
</div>`
            },
            journey: {
                agent: 'Journey Designer',
                content: `The Journey Agent is mapping your customer touchpoints and designing an optimized flow. I'm analyzing the best sequence and timing for maximum engagement and conversion.

Your journey will include:
• Entry point optimization
• Email sequences
• SMS follow-ups
• Retargeting touchpoints
• Conversion optimization

<div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
    <button class="btn btn-primary" onclick="app.showJourneyMap()">
        <i class="fas fa-route"></i> View Journey Map
    </button>
    <button class="btn btn-secondary" onclick="app.optimizeJourney()">
        <i class="fas fa-cogs"></i> Optimize Journey
    </button>
</div>`
            },
            performance: {
                agent: 'Performance Analyst',
                content: `The Performance Agent is analyzing your campaign data and identifying optimization opportunities. I'm reviewing metrics across all channels to provide actionable insights.

Performance insights:
• Current ROAS: 2.3x (above benchmark)
• Top performing channels identified
• Underperforming segments flagged
• Budget reallocation recommendations
• A/B test results analyzed

<div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
    <button class="btn btn-primary" onclick="app.showPerformanceDashboard()">
        <i class="fas fa-chart-line"></i> View Performance Dashboard
    </button>
    <button class="btn btn-secondary" onclick="app.applyOptimizations()">
        <i class="fas fa-rocket"></i> Apply Optimizations
    </button>
</div>`
            },
            audience: {
                agent: 'Audience Specialist',
                content: `The Audience Agent has identified your highest-value customer segments and analyzed their behavior patterns. I'm creating detailed audience profiles for precise targeting.

Audience insights:
• 4 high-value segments identified
• Behavioral patterns analyzed
• Look-alike audiences created
• Cross-platform targeting setup
• Exclusion lists optimized

<div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
    <button class="btn btn-primary" onclick="app.showAudienceInsights()">
        <i class="fas fa-users"></i> View Audience Insights
    </button>
    <button class="btn btn-secondary" onclick="app.createLookalikes()">
        <i class="fas fa-copy"></i> Create Lookalike Audiences
    </button>
</div>`
            },
            'paid-media': {
                agent: 'Paid Media Optimizer',
                content: `The Paid Media Agent is optimizing your budget allocation across platforms. I'm analyzing performance data to recommend the best distribution for maximum ROI.

Budget optimization:
• Google Ads: $30K (40%) - Strong search performance
• Meta: $25K (33%) - High engagement rates
• TikTok: $15K (20%) - Growing younger demographic
• Other: $5K (7%) - Testing new channels

<div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
    <button class="btn btn-primary" onclick="app.showBudgetPlan()">
        <i class="fas fa-dollar-sign"></i> View Budget Plan
    </button>
    <button class="btn btn-secondary" onclick="app.reallocateBudget()">
        <i class="fas fa-exchange-alt"></i> Reallocate Budget
    </button>
</div>`
            },
            general: {
                agent: 'SuperAgent',
                content: `I'm here to help with all your marketing needs! I can assist with:

• **Campaign Briefs** - Strategic planning and objectives
• **Creative Generation** - Assets, copy, and visual concepts
• **Journey Design** - Customer flow optimization
• **Performance Analysis** - Data insights and optimization
• **Audience Targeting** - Segment identification and profiling
• **Paid Media** - Budget optimization and platform management

What would you like to work on next?`
            }
        };

        const response = responses[messageType] || responses.general;

        setTimeout(() => {
            this.addMessage(response.content, 'agent', response.agent);
            this.showSuggestedFollowUps(messageType);
        }, 2000);
    }

    showSuggestedFollowUps(messageType) {
        const followUps = {
            brief: [
                "Generate creative assets for this campaign",
                "Design the customer journey",
                "Set up audience targeting"
            ],
            creative: [
                "Create campaign brief for these assets",
                "Set up A/B testing",
                "Design customer journey"
            ],
            journey: [
                "Generate creative assets for touchpoints",
                "Analyze performance metrics",
                "Optimize budget allocation"
            ],
            performance: [
                "Apply recommended optimizations",
                "Generate new creative variants",
                "Reallocate budget to top performers"
            ],
            audience: [
                "Create campaign brief for these segments",
                "Generate targeted creative assets",
                "Set up journey flows"
            ],
            'paid-media': [
                "Generate creative assets for top channels",
                "Create audience segments",
                "Design conversion journeys"
            ]
        };

        const suggestions = followUps[messageType];
        if (suggestions && suggestions.length > 0) {
            setTimeout(() => {
                this.addFollowUpSuggestions(suggestions);
            }, 1000);
        }
    }

    addFollowUpSuggestions(suggestions) {
        const chatMessages = document.getElementById('chat-messages');
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'follow-up-suggestions';
        suggestionsDiv.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        `;

        suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.style.cssText = `
                background: var(--content-bg);
                border: 1px solid var(--border-color);
                border-radius: 20px;
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s ease;
            `;
            suggestionBtn.textContent = suggestion;
            suggestionBtn.addEventListener('click', () => {
                this.handleUserMessage(suggestion);
                suggestionsDiv.remove();
            });
            suggestionBtn.addEventListener('mouseenter', () => {
                suggestionBtn.style.background = 'var(--accent-blue)';
                suggestionBtn.style.color = 'white';
                suggestionBtn.style.borderColor = 'var(--accent-blue)';
            });
            suggestionBtn.addEventListener('mouseleave', () => {
                suggestionBtn.style.background = 'var(--content-bg)';
                suggestionBtn.style.color = 'var(--text-primary)';
                suggestionBtn.style.borderColor = 'var(--border-color)';
            });
            suggestionsDiv.appendChild(suggestionBtn);
        });

        chatMessages.appendChild(suggestionsDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideStarterSuggestions() {
        const suggestions = document.getElementById('starter-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    handleAgentClick(agent) {
        this.addMessage(`🤖 Activating ${agent} agent to help with specialized tasks...`, 'agent');

        // Show agent-specific capabilities
        const agentCapabilities = {
            'research': 'I can analyze market trends, competitor insights, and industry benchmarks.',
            'performance': 'I can review analytics, optimize campaigns, and provide performance insights.',
            'creative': 'I can generate ad concepts, creative assets, and A/B testing variants.',
            'audience': 'I can segment audiences, create personas, and optimize targeting.',
            'journey': 'I can map customer touchpoints and optimize conversion flows.',
            'paid-media': 'I can optimize budgets, allocate spend, and manage platform campaigns.',
            'historical': 'I can analyze past campaign learnings and apply best practices.',
            'decisioning': 'I can provide AI-powered optimization and strategic recommendations.'
        };

        const capability = agentCapabilities[agent] || 'I can help with specialized marketing tasks.';

        setTimeout(() => {
            this.addMessage(capability + ' What would you like me to focus on?', 'agent', `${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent`);
        }, 1000);
    }

    handleQuickAction(action) {
        const actionPrompts = {
            'brief': 'Create a comprehensive campaign brief',
            'creative': 'Generate creative assets for my campaign',
            'journey': 'Design a customer journey for my campaign',
            'optimize': 'Optimize my existing campaign performance'
        };

        const prompt = actionPrompts[action] || `Help me with ${action}`;
        this.handleUserMessage(prompt);
    }

    // Agent panel toggle removed - now always visible in new design

    // Navigation removed with sidebar

    // Placeholder methods for action buttons
    showCampaignBrief() {
        this.addMessage("🎯 **Campaign Brief Generated!** Here's your comprehensive brief with objectives, audience segments, and recommended strategies. Ready to proceed with creative generation or journey design?", 'agent', 'Campaign Brief Generator');
    }

    showCreativeAssets() {
        this.addMessage("🎨 **Creative Assets Ready!** I've generated 5 variants with predicted CTR scores. Variant A shows 23% higher engagement potential. Ready to set up A/B testing?", 'agent', 'Creative Generator');
    }

    showJourneyMap() {
        this.addMessage("🗺️ **Customer Journey Mapped!** Your optimized journey includes 5 touchpoints with 8.2% predicted conversion rate. Email → SMS → Retargeting sequence shows highest performance.", 'agent', 'Journey Designer');
    }

    showPerformanceDashboard() {
        this.addMessage("📊 **Performance Analysis Complete!** Current ROAS: 2.3x. TikTok overperforming by 40%. Recommend shifting 15% budget from Display to TikTok for +$12K additional revenue.", 'agent', 'Performance Analyst');
    }

    showAudienceInsights() {
        this.addMessage("👥 **Audience Analysis Ready!** Identified 4 segments: Core Shoppers (125K), Browse Abandoners (89K), VIP Lookalikes (200K), Competitor Shoppers (156K). Core Shoppers show highest LTV.", 'agent', 'Audience Specialist');
    }

    showBudgetPlan() {
        this.addMessage("💰 **Budget Plan Optimized!** Recommended allocation: Google 40% ($30K), Meta 33% ($25K), TikTok 20% ($15K), Testing 7% ($5K). Projected 2.8x ROAS improvement.", 'agent', 'Paid Media Optimizer');
    }

    refineWithAI() {
        this.addMessage("🔄 Refining recommendations with additional market data and competitor analysis...", 'agent');
    }

    generateMoreVariants() {
        this.addMessage("➕ Generating 3 additional creative variants with different messaging approaches...", 'agent');
    }

    optimizeJourney() {
        this.addMessage("⚡ Optimizing journey timing and touchpoint sequence based on behavioral data...", 'agent');
    }

    applyOptimizations() {
        this.addMessage("🚀 Applying performance optimizations: budget reallocation initiated, underperforming ads paused, winning creative scaled.", 'agent');
    }

    createLookalikes() {
        this.addMessage("👯 Creating lookalike audiences based on your top customer segments. Estimated reach: 2.3M potential customers.", 'agent');
    }

    reallocateBudget() {
        this.addMessage("🔄 Budget reallocation in progress: moving $8K from underperforming Display to high-performing TikTok campaigns.", 'agent');
    }

    // New Growth Studio Interface Handlers
    handleCampaignStart(message) {
        console.log('Starting campaign with message:', message);

        // Transition to campaign creation mode
        this.transitionToCampaignBuilder(message);

        // Activate relevant agents
        const messageType = this.analyzeMessage(message);
        this.activateAgents(messageType);

        // Show processing message
        this.showCampaignProcessing(message);
    }

    handleToolClick(tool) {
        console.log('Tool clicked:', tool);

        const toolActions = {
            templates: 'Opening Campaign Templates library...',
            audience: 'Launching Audience Builder with AI segmentation...',
            creative: 'Starting Creative Studio with brand asset integration...',
            budget: 'Opening Budget Planner with ROI optimization...',
            performance: 'Loading Performance Tracker with real-time analytics...',
            testing: 'Initializing A/B Testing framework...',
            research: 'Activating Market Research with competitor analysis...'
        };

        const action = toolActions[tool] || `Opening ${tool} tool...`;
        this.showToolActivation(tool, action);
    }

    handleSuggestionClick(suggestion, content) {
        console.log('Suggestion clicked:', suggestion, content);

        // Use the suggestion content as campaign input
        document.getElementById('campaign-input').value = content;

        // Start campaign with this suggestion
        this.handleCampaignStart(content);
    }

    transitionToCampaignBuilder(message) {
        // Hide the main creation center
        const creationCenter = document.querySelector('.campaign-creation-center');
        creationCenter.style.transition = 'all 0.5s ease';
        creationCenter.style.opacity = '0';
        creationCenter.style.transform = 'translateY(-20px)';

        setTimeout(() => {
            // Replace with campaign builder interface
            this.showCampaignBuilder(message);
        }, 500);
    }

    showCampaignBuilder(message) {
        const mainContent = document.querySelector('.main-content');

        // Create campaign builder interface
        const builderHTML = `
            <div class="campaign-builder-interface">
                <div class="builder-header">
                    <button class="back-btn" onclick="app.returnToCreation()">
                        <i class="fas fa-arrow-left"></i>
                        Back to Campaign Creation
                    </button>
                    <h2>Building Your Campaign</h2>
                </div>

                <div class="campaign-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 25%"></div>
                    </div>
                    <span class="progress-text">Analyzing campaign requirements...</span>
                </div>

                <div class="campaign-brief-section">
                    <h3>Campaign Brief</h3>
                    <div class="brief-content">
                        <p><strong>Original Request:</strong></p>
                        <p class="user-input">"${message}"</p>

                        <div class="ai-analysis">
                            <h4>🤖 AI Analysis</h4>
                            <div class="analysis-points">
                                <div class="analysis-point">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Target audience identified: Millennials</span>
                                </div>
                                <div class="analysis-point">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Budget allocation: $100,000</span>
                                </div>
                                <div class="analysis-point">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Campaign duration: Nov 1 - Dec 24</span>
                                </div>
                                <div class="analysis-point">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Theme: 80s pop culture</span>
                                </div>
                            </div>
                        </div>

                        <div class="next-steps">
                            <h4>Recommended Next Steps</h4>
                            <div class="steps-grid">
                                <button class="step-btn" onclick="app.openAudienceBuilder()">
                                    <i class="fas fa-users"></i>
                                    Define Target Audience
                                </button>
                                <button class="step-btn" onclick="app.openCreativeStudio()">
                                    <i class="fas fa-palette"></i>
                                    Generate Creative Assets
                                </button>
                                <button class="step-btn" onclick="app.openBudgetPlanner()">
                                    <i class="fas fa-dollar-sign"></i>
                                    Plan Budget Allocation
                                </button>
                                <button class="step-btn" onclick="app.openJourneyDesigner()">
                                    <i class="fas fa-route"></i>
                                    Design Customer Journey
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Replace content
        const creationCenter = document.querySelector('.campaign-creation-center');
        creationCenter.innerHTML = builderHTML;
        creationCenter.style.opacity = '1';
        creationCenter.style.transform = 'translateY(0)';

        // Show agent panel
        setTimeout(() => {
            if (this.agentPanel) {
                this.agentPanel.classList.add('open');
            }
        }, 1000);
    }

    showCampaignProcessing(message) {
        // Simulate progress updates
        setTimeout(() => {
            this.updateProgress(50, 'Generating campaign strategy...');
        }, 2000);

        setTimeout(() => {
            this.updateProgress(75, 'Identifying target segments...');
        }, 4000);

        setTimeout(() => {
            this.updateProgress(100, 'Campaign brief ready!');
        }, 6000);
    }

    updateProgress(percentage, text) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = text;
        }
    }

    showToolActivation(tool, action) {
        // Create a modal or overlay showing tool activation
        const modal = document.createElement('div');
        modal.className = 'tool-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Activating ${tool.charAt(0).toUpperCase() + tool.slice(1)} Tool</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="loading-animation">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <p>${action}</p>
                    <p class="tool-desc">This tool will be available in the full campaign builder interface.</p>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        document.body.appendChild(modal);

        // Auto-close after 3 seconds
        setTimeout(() => {
            modal.remove();
        }, 3000);
    }

    returnToCreation() {
        location.reload(); // Simple way to return to the original state
    }

    // Placeholder methods for campaign builder steps
    openAudienceBuilder() {
        this.showToolActivation('audience-builder', 'Opening advanced audience segmentation tools...');
    }

    openCreativeStudio() {
        this.showToolActivation('creative-studio', 'Launching AI-powered creative generation...');
    }

    openBudgetPlanner() {
        this.showToolActivation('budget-planner', 'Loading budget optimization algorithms...');
    }

    openJourneyDesigner() {
        this.showToolActivation('journey-designer', 'Initializing customer journey mapping...');
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MarketingSuperAgentV3();
    console.log('Marketing SuperAgent v3 loaded successfully');
});