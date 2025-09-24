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
        this.initializeQuickLaunch();
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

        // Chat menu buttons
        const quickLaunchToggle = document.getElementById('quick-launch-toggle');
        const aiSuggestionsToggle = document.getElementById('ai-suggestions-toggle');
        const chipsClose = document.getElementById('chips-close');

        if (quickLaunchToggle) {
            quickLaunchToggle.addEventListener('click', () => {
                this.toggleQuickLaunch();
            });
        }

        if (aiSuggestionsToggle) {
            aiSuggestionsToggle.addEventListener('click', () => {
                this.toggleAISuggestions();
            });
        }

        if (chipsClose) {
            chipsClose.addEventListener('click', () => {
                this.hideQuickLaunch();
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

        // Quick action chips
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-chip')) {
                const chip = e.target.closest('.action-chip');
                const action = chip.dataset.action;
                this.handleQuickAction(action);
                this.hideQuickLaunch();
            }
        });

        // AI Campaign suggestion cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.suggestion-card')) {
                const card = e.target.closest('.suggestion-card');
                const prompt = card.dataset.prompt;
                this.handleUserMessage(prompt);
                this.hideAICampaignSuggestions();
            }
        });
    }

    handleUserMessage(message) {
        // Add user message to chat
        this.addMessage(message, 'user');

        // Hide starter suggestions and AI suggestions after first interaction
        this.hideStarterSuggestions();
        this.hideAICampaignSuggestions();

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
                    <i class="fas fa-robot"></i>
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

        // Show agent progress display
        setTimeout(() => {
            this.showAgentProgress(messageType);
            this.activateAgents(messageType);
        }, 1000);

        // Generate final response
        setTimeout(() => {
            this.generateResponse(message, messageType);
        }, 5000);
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

    showAgentProgress(messageType) {
        const agentConfigs = {
            brief: ['Deep Research', 'Performance', 'Audience'],
            creative: ['Creative', 'Deep Research'],
            journey: ['Journey', 'Audience'],
            performance: ['Performance', 'Deep Research'],
            audience: ['Audience', 'Deep Research'],
            'paid-media': ['Paid Media', 'Performance'],
            general: ['Deep Research']
        };

        const activeAgents = agentConfigs[messageType] || agentConfigs.general;
        const chatMessages = document.getElementById('chat-messages');

        // Create progress display container
        const progressDiv = document.createElement('div');
        progressDiv.className = 'agent-progress-display';
        progressDiv.id = `progress-${Date.now()}`;

        const agentDetails = {
            'Deep Research': { icon: 'fas fa-search', color: '#8b5cf6', task: 'Analyzing market trends and competitor data' },
            'Creative': { icon: 'fas fa-palette', color: '#ec4899', task: 'Generating creative concepts and assets' },
            'Journey': { icon: 'fas fa-route', color: '#f59e0b', task: 'Mapping customer touchpoints and flows' },
            'Performance': { icon: 'fas fa-chart-bar', color: '#3b82f6', task: 'Reviewing campaign performance data' },
            'Audience': { icon: 'fas fa-users', color: '#10b981', task: 'Identifying target segments' },
            'Paid Media': { icon: 'fas fa-dollar-sign', color: '#14b8a6', task: 'Optimizing budget allocation' },
            'Historical': { icon: 'fas fa-history', color: '#6366f1', task: 'Analyzing past campaign learnings' },
            'AI Decisioning': { icon: 'fas fa-brain', color: '#ef4444', task: 'Processing strategic recommendations' }
        };

        let progressHTML = `
            <div class="progress-header">
                <i class="fas fa-cog"></i>
                <span>Activating ${activeAgents.length} specialist agents</span>
            </div>
            <div class="agent-progress-list">
        `;

        const timestamp = Date.now();
        activeAgents.forEach((agentName, index) => {
            const agent = agentDetails[agentName];
            const itemId = `agent-${agentName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}`;
            progressHTML += `
                <div class="agent-progress-item" id="${itemId}">
                    <div class="agent-progress-icon" style="background: ${agent.color}">
                        <i class="${agent.icon}"></i>
                    </div>
                    <div class="agent-progress-content">
                        <div class="agent-progress-name">${agentName} Agent</div>
                        <div class="agent-progress-task">${agent.task}</div>
                    </div>
                    <div class="agent-status-indicator pending">
                        <span>•</span>
                    </div>
                </div>
            `;
        });

        progressHTML += '</div>';
        progressDiv.innerHTML = progressHTML;

        chatMessages.appendChild(progressDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate agent progress
        this.simulateAgentProgress(activeAgents, progressDiv.id);
    }

    simulateAgentProgress(agents, progressId) {
        const progressDiv = document.getElementById(progressId);
        if (!progressDiv) {
            console.error(`Progress div not found: ${progressId}`);
            return;
        }

        // Extract timestamp from progressId more reliably
        const timestamp = progressId.replace('progress-', '');
        console.log(`Starting simulation for ${agents.length} agents with timestamp: ${timestamp}`);

        agents.forEach((agentName, index) => {
            const itemId = `agent-${agentName.replace(/\s+/g, '-').toLowerCase()}-${timestamp}`;
            console.log(`Setting up progress for ${agentName} with ID: ${itemId}`);

            // Start working
            setTimeout(() => {
                const item = document.getElementById(itemId);
                if (item) {
                    item.classList.add('working');
                    const indicator = item.querySelector('.agent-status-indicator');
                    if (indicator) {
                        indicator.className = 'agent-status-indicator working';
                        indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    }
                }
            }, (index + 1) * 500);

            // Complete work
            setTimeout(() => {
                const item = document.getElementById(itemId);
                if (item) {
                    item.classList.remove('working');
                    item.classList.add('completed');
                    const indicator = item.querySelector('.agent-status-indicator');
                    if (indicator) {
                        indicator.className = 'agent-status-indicator completed';
                        indicator.innerHTML = '<i class="fas fa-check"></i>';
                        console.log(`Agent ${agentName} completed successfully`);
                    }

                    const taskDiv = item.querySelector('.agent-progress-task');
                    if (taskDiv) {
                        taskDiv.textContent = 'Analysis completed successfully';
                    }
                } else {
                    console.error(`Could not find item with ID: ${itemId}`);
                }
            }, (index + 1) * 1000 + 2000);
        });

        // Store thought process for later viewing
        this.storeThoughtProcess(agents, progressId);
    }

    storeThoughtProcess(agents, progressId) {
        const thoughtProcesses = {
            'Deep Research': [
                'Analyzed current market trends in the target demographic',
                'Reviewed competitor campaigns and identified gaps',
                'Gathered industry benchmarks and performance data',
                'Synthesized insights for strategic recommendations'
            ],
            'Creative': [
                'Reviewed brand guidelines and creative assets',
                'Generated multiple creative concepts and variations',
                'Evaluated concepts for brand alignment and impact',
                'Selected top performing creative directions'
            ],
            'Journey': [
                'Mapped current customer touchpoints and interactions',
                'Identified optimization opportunities in the funnel',
                'Designed improved customer flow and timing',
                'Validated journey against conversion benchmarks'
            ],
            'Performance': [
                'Analyzed historical campaign performance data',
                'Identified top and underperforming segments',
                'Calculated ROI and attribution metrics',
                'Developed optimization recommendations'
            ],
            'Audience': [
                'Segmented target audiences by behavior and demographics',
                'Created detailed audience personas and profiles',
                'Analyzed audience overlap and exclusion opportunities',
                'Validated segments against business objectives'
            ],
            'Paid Media': [
                'Evaluated current budget allocation across channels',
                'Analyzed channel performance and cost efficiency',
                'Identified reallocation opportunities for better ROI',
                'Calculated projected impact of budget changes'
            ]
        };

        // Store for later retrieval
        this.thoughtProcessData = this.thoughtProcessData || {};
        this.thoughtProcessData[progressId] = agents.map(agentName => ({
            agent: agentName,
            thoughts: thoughtProcesses[agentName] || ['Processed request and generated insights']
        }));
    }

    generateResponse(message, messageType) {
        const responses = {
            brief: {
                agent: 'Campaign Brief Generator',
                content: this.generateRichContent('brief')
            },
            creative: {
                agent: 'Creative Generator',
                content: this.generateRichContent('creative')
            },
            journey: {
                agent: 'Journey Designer',
                content: this.generateRichContent('journey')
            },
            performance: {
                agent: 'Performance Analyst',
                content: this.generateRichContent('performance')
            },
            audience: {
                agent: 'Audience Specialist',
                content: this.generateRichContent('audience')
            },
            'paid-media': {
                agent: 'Paid Media Optimizer',
                content: this.generateRichContent('paid-media')
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
            this.addThoughtProcessOption();
            this.showSuggestedFollowUps(messageType);
        }, 2000);
    }

    addThoughtProcessOption() {
        const chatMessages = document.getElementById('chat-messages');
        const thoughtContainer = document.createElement('div');
        thoughtContainer.className = 'thought-process-container';

        const thoughtId = `thoughts-${Date.now()}`;
        thoughtContainer.innerHTML = `
            <button class="view-thoughts-btn" onclick="app.toggleThoughtProcess('${thoughtId}')">
                <i class="fas fa-brain"></i>
                <span>View Agent Thought Process</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="thought-process-details" id="${thoughtId}">
                ${this.generateThoughtProcessHTML()}
            </div>
        `;

        chatMessages.appendChild(thoughtContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateThoughtProcessHTML() {
        if (!this.thoughtProcessData) return '<p>No thought process data available.</p>';

        const latestProgressId = Object.keys(this.thoughtProcessData).pop();
        const thoughtData = this.thoughtProcessData[latestProgressId];

        let html = '';
        thoughtData.forEach(agentData => {
            html += `
                <div class="thought-item">
                    <div class="thought-agent">${agentData.agent} Agent</div>
                    <div class="thought-content">
                        <ul>
                            ${agentData.thoughts.map(thought => `<li>${thought}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });

        return html;
    }

    toggleThoughtProcess(thoughtId) {
        const thoughtDetails = document.getElementById(thoughtId);
        const button = thoughtDetails.previousElementSibling;
        const chevron = button.querySelector('.fa-chevron-down, .fa-chevron-up');

        if (thoughtDetails.classList.contains('expanded')) {
            thoughtDetails.classList.remove('expanded');
            chevron.className = 'fas fa-chevron-down';
        } else {
            thoughtDetails.classList.add('expanded');
            chevron.className = 'fas fa-chevron-up';
        }
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
            gap: var(--space-xxs);
            margin-top: var(--space-xs);
        `;

        suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.style.cssText = `
                background: var(--content-bg);
                border: var(--border);
                border-radius: 20px;
                padding: var(--space-xs);
                font-size: var(--label);
                cursor: pointer;
                transition: all var(--transition-fast);
                height: 28px;
                display: flex;
                align-items: center;
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
            'templates': 'Show me campaign templates for different industries and goals',
            'audience': 'Help me build detailed audience segments for my campaign',
            'creative': 'Generate creative assets and A/B testing variants for my campaign',
            'budget': 'Create an optimized budget plan across all marketing channels',
            'performance': 'Analyze my current campaign performance and provide optimization recommendations',
            'testing': 'Set up A/B testing framework for my campaign elements',
            'research': 'Conduct market research and competitor analysis for my industry',
            'automation': 'Design marketing automation workflows and triggered campaigns',
            'analytics': 'Create advanced analytics dashboard with custom KPIs and attribution modeling',
            'personalization': 'Build personalized customer experiences and dynamic content strategies'
        };

        const prompt = actionPrompts[action] || `Help me with ${action}`;
        this.handleUserMessage(prompt);
    }

    generateRichContent(agentType) {
        const contentGenerators = {
            brief: () => this.generateBriefContent(),
            creative: () => this.generateCreativeContent(),
            journey: () => this.generateJourneyContent(),
            performance: () => this.generatePerformanceContent(),
            audience: () => this.generateAudienceContent(),
            'paid-media': () => this.generatePaidMediaContent()
        };

        return contentGenerators[agentType] ? contentGenerators[agentType]() : 'Analysis complete.';
    }

    generateBriefContent() {
        return `
            <p>I've activated our specialist agents to create a comprehensive campaign brief with data-driven insights and strategic recommendations.</p>

            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #3b82f6;">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <div class="section-title">Campaign Objectives & KPIs</div>
                    </div>

                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">$100K</div>
                            <div class="metric-label">Total Budget</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">2.8x</div>
                            <div class="metric-label">Target ROAS</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">45 Days</div>
                            <div class="metric-label">Campaign Duration</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">125K</div>
                            <div class="metric-label">Target Reach</div>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #10b981;">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="section-title">Target Audience Breakdown</div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Primary: Millennials (25-40)</span>
                            <span>65%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill blue" style="width: 65%;"></div>
                        </div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Secondary: Gen Z (18-28)</span>
                            <span>25%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill purple" style="width: 25%;"></div>
                        </div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Tertiary: Gen X (35-50)</span>
                            <span>10%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill orange" style="width: 10%;"></div>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #8b5cf6;">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="section-title">Channel Strategy & Budget Allocation</div>
                    </div>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Channel</th>
                                <th>Budget</th>
                                <th>Share</th>
                                <th>Expected ROAS</th>
                                <th>Primary Goal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Google Ads</td>
                                <td>$40,000</td>
                                <td>40%</td>
                                <td>3.2x</td>
                                <td>Conversions</td>
                            </tr>
                            <tr>
                                <td>Meta (FB/IG)</td>
                                <td>$35,000</td>
                                <td>35%</td>
                                <td>2.8x</td>
                                <td>Awareness</td>
                            </tr>
                            <tr>
                                <td>TikTok</td>
                                <td>$15,000</td>
                                <td>15%</td>
                                <td>2.4x</td>
                                <td>Engagement</td>
                            </tr>
                            <tr>
                                <td>LinkedIn</td>
                                <td>$10,000</td>
                                <td>10%</td>
                                <td>2.6x</td>
                                <td>B2B Leads</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.showCampaignBrief()">
                    <i class="fas fa-file-alt"></i> View Full Brief
                </button>
                <button class="btn btn-secondary" onclick="app.refineWithAI()">
                    <i class="fas fa-magic"></i> Refine Strategy
                </button>
            </div>
        `;
    }

    generateCreativeContent() {
        return `
            <p>The Creative Agent has generated multiple high-performing asset variants with A/B testing recommendations and performance predictions.</p>

            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #ec4899;">
                            <i class="fas fa-palette"></i>
                        </div>
                        <div class="section-title">Sample Creative Assets Generated</div>
                    </div>

                    <div class="asset-gallery">
                        <div class="asset-preview" onclick="app.viewAssetDetails('holiday-magic')">
                            <div class="asset-image">
                                <div class="asset-mockup holiday-magic">
                                    <div class="mockup-header">🎄 Holiday Magic</div>
                                    <div class="mockup-subtext">Transform your holidays with exclusive deals that sparkle with savings</div>
                                    <div class="mockup-cta">Shop Now - 40% Off</div>
                                </div>
                                <div class="asset-overlay">Carousel</div>
                            </div>
                            <div class="asset-details">
                                <div class="asset-title">Concept A: "Holiday Magic"</div>
                                <div class="asset-metrics">
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">3.2%</div>
                                        <div class="asset-metric-label">Pred. CTR</div>
                                    </div>
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">92</div>
                                        <div class="asset-metric-label">Eng. Score</div>
                                    </div>
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">15.2%</div>
                                        <div class="asset-metric-label">Conv. Rate</div>
                                    </div>
                                </div>
                                <div class="asset-tags">
                                    <span class="asset-tag format">Carousel</span>
                                    <span class="asset-tag platform">Instagram</span>
                                    <span class="asset-tag platform">Facebook</span>
                                    <span class="asset-tag size">1080x1080</span>
                                </div>
                            </div>
                        </div>

                        <div class="asset-preview" onclick="app.viewAssetDetails('limited-time')">
                            <div class="asset-image">
                                <div class="asset-mockup limited-time">
                                    <div class="mockup-header">⏰ Limited Time</div>
                                    <div class="mockup-subtext">Don't miss out! Exclusive offers ending soon. Act fast before it's gone!</div>
                                    <div class="mockup-cta">Claim Offer - 24hrs Left</div>
                                </div>
                                <div class="asset-overlay">Video</div>
                            </div>
                            <div class="asset-details">
                                <div class="asset-title">Concept B: "Limited Time"</div>
                                <div class="asset-metrics">
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">2.8%</div>
                                        <div class="asset-metric-label">Pred. CTR</div>
                                    </div>
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">87</div>
                                        <div class="asset-metric-label">Eng. Score</div>
                                    </div>
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">12.8%</div>
                                        <div class="asset-metric-label">Conv. Rate</div>
                                    </div>
                                </div>
                                <div class="asset-tags">
                                    <span class="asset-tag format">Video</span>
                                    <span class="asset-tag platform">TikTok</span>
                                    <span class="asset-tag platform">Instagram Stories</span>
                                    <span class="asset-tag size">9:16 Vertical</span>
                                </div>
                            </div>
                        </div>

                        <div class="asset-preview" onclick="app.viewAssetDetails('customer-love')">
                            <div class="asset-image">
                                <div class="asset-mockup customer-love">
                                    <div class="mockup-header">💝 Customer Love</div>
                                    <div class="mockup-subtext">Join thousands of happy customers who trust us for quality and value</div>
                                    <div class="mockup-cta">See Reviews & Shop</div>
                                </div>
                                <div class="asset-overlay">Collection</div>
                            </div>
                            <div class="asset-details">
                                <div class="asset-title">Concept C: "Customer Love"</div>
                                <div class="asset-metrics">
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">2.5%</div>
                                        <div class="asset-metric-label">Pred. CTR</div>
                                    </div>
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">84</div>
                                        <div class="asset-metric-label">Eng. Score</div>
                                    </div>
                                    <div class="asset-metric">
                                        <div class="asset-metric-value">11.5%</div>
                                        <div class="asset-metric-label">Conv. Rate</div>
                                    </div>
                                </div>
                                <div class="asset-tags">
                                    <span class="asset-tag format">Collection</span>
                                    <span class="asset-tag platform">Facebook</span>
                                    <span class="asset-tag platform">Google Ads</span>
                                    <span class="asset-tag size">Multiple</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #3b82f6;">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="section-title">Concept Performance Comparison</div>
                    </div>

                    <div class="performance-chart">
                        <div class="chart-title">Predicted Click-Through Rate by Concept</div>
                        <div class="performance-bars">
                            <div class="perf-bar concept-a" style="height: 85%;">
                                <span>3.2%</span>
                                <div class="perf-bar-label">Holiday Magic</div>
                            </div>
                            <div class="perf-bar concept-b" style="height: 70%;">
                                <span>2.8%</span>
                                <div class="perf-bar-label">Limited Time</div>
                            </div>
                            <div class="perf-bar concept-c" style="height: 65%;">
                                <span>2.5%</span>
                                <div class="perf-bar-label">Customer Love</div>
                            </div>
                        </div>
                    </div>

                    <div class="format-showcase">
                        <div class="format-example">
                            <div class="format-icon" style="background: #22c55e;">
                                <i class="fas fa-images"></i>
                            </div>
                            <div class="format-name">Carousel Ads</div>
                            <div class="format-specs">
                                1080x1080px<br>
                                2-10 cards<br>
                                Best for product showcase
                            </div>
                        </div>
                        <div class="format-example">
                            <div class="format-icon" style="background: #ec4899;">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="format-name">Video Ads</div>
                            <div class="format-specs">
                                9:16 vertical<br>
                                15-30 seconds<br>
                                High engagement format
                            </div>
                        </div>
                        <div class="format-example">
                            <div class="format-icon" style="background: #f59e0b;">
                                <i class="fas fa-th-large"></i>
                            </div>
                            <div class="format-name">Collection Ads</div>
                            <div class="format-specs">
                                Multiple sizes<br>
                                Product catalog<br>
                                Shopping focused
                            </div>
                        </div>
                    </div>

                    <div class="tag-list">
                        <span class="tag primary">A/B Test Ready</span>
                        <span class="tag success">Brand Compliant</span>
                        <span class="tag success">Mobile Optimized</span>
                        <span class="tag warning">Review Recommended</span>
                    </div>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.showCreativeAssets()">
                    <i class="fas fa-images"></i> View All Assets
                </button>
                <button class="btn btn-secondary" onclick="app.generateMoreVariants()">
                    <i class="fas fa-plus"></i> Generate More
                </button>
            </div>
        `;
    }

    generatePerformanceContent() {
        return `
            <p>The Performance Agent has analyzed your campaign data and identified key optimization opportunities across all channels.</p>

            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #3b82f6;">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="section-title">Current Performance Metrics</div>
                    </div>

                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">2.3x</div>
                            <div class="metric-label">Current ROAS</div>
                            <div class="metric-change positive">↑ 15% vs target</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$125K</div>
                            <div class="metric-label">Revenue Generated</div>
                            <div class="metric-change positive">↑ 23% vs last month</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">3.2%</div>
                            <div class="metric-label">Average CTR</div>
                            <div class="metric-change positive">↑ 0.8% vs benchmark</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">12.5%</div>
                            <div class="metric-label">Conversion Rate</div>
                            <div class="metric-change negative">↓ 2.1% vs target</div>
                        </div>
                    </div>
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #10b981;">
                            <i class="fas fa-trending-up"></i>
                        </div>
                        <div class="section-title">Top Performing Segments</div>
                    </div>

                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Segment</th>
                                <th>ROAS</th>
                                <th>Conv. Rate</th>
                                <th>Spend</th>
                                <th>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Millennials Mobile</td>
                                <td style="color: #22c55e; font-weight: 600;">4.2x</td>
                                <td>18.5%</td>
                                <td>$15,200</td>
                                <td>Scale up 40%</td>
                            </tr>
                            <tr>
                                <td>Retargeting - Cart</td>
                                <td style="color: #22c55e; font-weight: 600;">3.8x</td>
                                <td>15.2%</td>
                                <td>$8,900</td>
                                <td>Increase budget</td>
                            </tr>
                            <tr>
                                <td>Lookalike - Top 1%</td>
                                <td style="color: #f59e0b; font-weight: 600;">2.1x</td>
                                <td>8.7%</td>
                                <td>$12,400</td>
                                <td>Optimize creative</td>
                            </tr>
                            <tr>
                                <td>Cold Audience</td>
                                <td style="color: #ef4444; font-weight: 600;">1.4x</td>
                                <td>4.2%</td>
                                <td>$18,600</td>
                                <td>Pause & review</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.showPerformanceDashboard()">
                    <i class="fas fa-chart-line"></i> Full Dashboard
                </button>
                <button class="btn btn-secondary" onclick="app.applyOptimizations()">
                    <i class="fas fa-rocket"></i> Apply Optimizations
                </button>
            </div>
        `;
    }

    // Additional content generators for other agents...
    generateAudienceContent() {
        return `
            <p>The Audience Agent has identified 4 high-value customer segments with detailed behavioral analysis and targeting recommendations.</p>

            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #10b981;">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="section-title">Audience Segments Identified</div>
                    </div>

                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-icon" style="background: #3b82f6;">
                                <i class="fas fa-crown"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">VIP Customers (125K)</div>
                                <div class="status-desc">High LTV, frequent purchasers, brand advocates</div>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon" style="background: #22c55e;">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">Cart Abandoners (89K)</div>
                                <div class="status-desc">Added to cart but didn't purchase, high intent</div>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon" style="background: #f59e0b;">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">Browsers (200K)</div>
                                <div class="status-desc">Visited product pages, need nurturing</div>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon" style="background: #8b5cf6;">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="status-content">
                                <div class="status-title">New Prospects (156K)</div>
                                <div class="status-desc">Competitor customers, expansion opportunity</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.showAudienceInsights()">
                    <i class="fas fa-users"></i> Detailed Insights
                </button>
                <button class="btn btn-secondary" onclick="app.createLookalikes()">
                    <i class="fas fa-copy"></i> Create Lookalikes
                </button>
            </div>
        `;
    }

    generateJourneyContent() {
        return `
            <p>The Journey Agent has mapped your optimal customer flow with 5 touchpoints and an 8.2% predicted conversion rate.</p>

            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #f59e0b;">
                            <i class="fas fa-route"></i>
                        </div>
                        <div class="section-title">Optimized Customer Journey</div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Awareness (Email + Social)</span>
                            <span>Day 1-3</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill blue" style="width: 20%;"></div>
                        </div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Consideration (Retargeting)</span>
                            <span>Day 4-7</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill purple" style="width: 40%;"></div>
                        </div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Intent (SMS + Push)</span>
                            <span>Day 8-10</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill orange" style="width: 60%;"></div>
                        </div>
                    </div>

                    <div class="progress-item">
                        <div class="progress-label">
                            <span>Conversion (Cart Recovery)</span>
                            <span>Day 11-14</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill green" style="width: 80%;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.showJourneyMap()">
                    <i class="fas fa-route"></i> View Journey Map
                </button>
                <button class="btn btn-secondary" onclick="app.optimizeJourney()">
                    <i class="fas fa-cogs"></i> Optimize Flow
                </button>
            </div>
        `;
    }

    generatePaidMediaContent() {
        return `
            <p>The Paid Media Agent has optimized your $100K budget allocation with projected 2.8x ROAS improvement across all channels.</p>

            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #14b8a6;">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="section-title">Optimized Budget Allocation</div>
                    </div>

                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">$40K</div>
                            <div class="metric-label">Google Ads (40%)</div>
                            <div class="metric-change positive">Strong search performance</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$33K</div>
                            <div class="metric-label">Meta (33%)</div>
                            <div class="metric-change positive">High engagement rates</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$20K</div>
                            <div class="metric-label">TikTok (20%)</div>
                            <div class="metric-change positive">Growing younger demo</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$7K</div>
                            <div class="metric-label">Testing (7%)</div>
                            <div class="metric-change">New channel exploration</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.showBudgetPlan()">
                    <i class="fas fa-dollar-sign"></i> Detailed Budget Plan
                </button>
                <button class="btn btn-secondary" onclick="app.reallocateBudget()">
                    <i class="fas fa-exchange-alt"></i> Reallocate Funds
                </button>
            </div>
        `;
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

    viewAssetDetails(assetId) {
        const assetDetails = {
            'holiday-magic': {
                title: 'Holiday Magic Concept',
                description: 'Festive holiday-themed creative focusing on seasonal emotion and gift-giving',
                copy: {
                    headline: '🎄 Transform Your Holidays with Magic',
                    subtext: 'Discover exclusive deals that sparkle with savings this holiday season',
                    cta: 'Shop Now - 40% Off Everything'
                },
                performance: {
                    ctr: '3.2%',
                    engagement: '92',
                    conversion: '15.2%',
                    sentiment: 'Positive (94%)'
                },
                formats: ['Carousel (1080x1080)', 'Story (1080x1920)', 'Feed Post (1200x628)'],
                platforms: ['Instagram', 'Facebook', 'Pinterest'],
                targeting: 'Millennials interested in home decor, families with children'
            },
            'limited-time': {
                title: 'Limited Time Urgency',
                description: 'Time-sensitive messaging creating urgency and fear of missing out',
                copy: {
                    headline: '⏰ Only 24 Hours Left!',
                    subtext: 'Don\'t miss out on exclusive offers ending soon. Act fast!',
                    cta: 'Claim Offer Before It\'s Gone'
                },
                performance: {
                    ctr: '2.8%',
                    engagement: '87',
                    conversion: '12.8%',
                    sentiment: 'Urgent (91%)'
                },
                formats: ['Video (9:16)', 'Story Ad (1080x1920)', 'Reel (1080x1920)'],
                platforms: ['TikTok', 'Instagram Stories', 'Snapchat'],
                targeting: 'Gen Z and Millennials, deal-seekers, impulse buyers'
            },
            'customer-love': {
                title: 'Customer Love & Trust',
                description: 'Social proof and customer testimonial-focused messaging',
                copy: {
                    headline: '💝 Loved by 50,000+ Customers',
                    subtext: 'Join thousands who trust us for quality, value, and service',
                    cta: 'See Reviews & Shop Now'
                },
                performance: {
                    ctr: '2.5%',
                    engagement: '84',
                    conversion: '11.5%',
                    sentiment: 'Trustworthy (96%)'
                },
                formats: ['Collection Ad', 'Catalog Showcase', 'Product Grid'],
                platforms: ['Facebook', 'Google Ads', 'Amazon DSP'],
                targeting: 'Previous customers, lookalike audiences, review readers'
            }
        };

        const asset = assetDetails[assetId];
        if (!asset) return;

        this.addMessage(`
            <div class="rich-content">
                <div class="content-section">
                    <div class="section-header">
                        <div class="section-icon" style="background: #ec4899;">
                            <i class="fas fa-image"></i>
                        </div>
                        <div class="section-title">${asset.title} - Detailed View</div>
                    </div>

                    <p><strong>Concept:</strong> ${asset.description}</p>

                    <div style="background: var(--content-bg); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Creative Copy:</h4>
                        <p><strong>Headline:</strong> ${asset.copy.headline}</p>
                        <p><strong>Subtext:</strong> ${asset.copy.subtext}</p>
                        <p><strong>CTA:</strong> ${asset.copy.cta}</p>
                    </div>

                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${asset.performance.ctr}</div>
                            <div class="metric-label">Predicted CTR</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${asset.performance.engagement}</div>
                            <div class="metric-label">Engagement Score</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${asset.performance.conversion}</div>
                            <div class="metric-label">Conversion Rate</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${asset.performance.sentiment}</div>
                            <div class="metric-label">Sentiment</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Available Formats:</h4>
                            <ul style="margin-left: 1rem;">
                                ${asset.formats.map(format => `<li>${format}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Recommended Platforms:</h4>
                            <ul style="margin-left: 1rem;">
                                ${asset.platforms.map(platform => `<li>${platform}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div style="background: var(--content-bg); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Target Audience:</h4>
                        <p>${asset.targeting}</p>
                    </div>
                </div>
            </div>

            <div class="response-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-primary" onclick="app.downloadAsset('${assetId}')">
                    <i class="fas fa-download"></i> Download Assets
                </button>
                <button class="btn btn-secondary" onclick="app.scheduleAsset('${assetId}')">
                    <i class="fas fa-calendar"></i> Schedule Campaign
                </button>
            </div>
        `, 'agent', 'Creative Asset Manager');
    }

    downloadAsset(assetId) {
        this.addMessage(`📦 Preparing download package for ${assetId} concept... Assets will include all formats, sizes, and platform-specific variations. Download link will be available in your dashboard.`, 'agent');
    }

    scheduleAsset(assetId) {
        this.addMessage(`📅 Opening campaign scheduler for ${assetId} concept... You can set launch dates, budget allocation, and A/B testing parameters in the campaign manager.`, 'agent');
    }

    toggleQuickLaunch() {
        const quickLaunchChips = document.getElementById('quick-launch-chips');
        const quickLaunchToggle = document.getElementById('quick-launch-toggle');

        if (quickLaunchChips.style.display === 'none' || quickLaunchChips.style.display === '') {
            this.showQuickLaunch();
        } else {
            this.hideQuickLaunch();
        }
    }

    showQuickLaunch() {
        const quickLaunchChips = document.getElementById('quick-launch-chips');
        const quickLaunchToggle = document.getElementById('quick-launch-toggle');

        quickLaunchChips.style.display = 'block';
        quickLaunchToggle.classList.add('active');
    }

    hideQuickLaunch() {
        const quickLaunchChips = document.getElementById('quick-launch-chips');
        const quickLaunchToggle = document.getElementById('quick-launch-toggle');

        quickLaunchChips.style.display = 'none';
        quickLaunchToggle.classList.remove('active');
    }

    initializeQuickLaunch() {
        // Set the quick launch toggle to active state since chips are showing by default
        // AI suggestions are hidden by default, so their toggle remains inactive
        const quickLaunchToggle = document.getElementById('quick-launch-toggle');

        if (quickLaunchToggle) {
            quickLaunchToggle.classList.add('active');
        }
    }

    hideAICampaignSuggestions() {
        const suggestions = document.getElementById('ai-campaign-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    toggleAISuggestions() {
        const suggestions = document.getElementById('ai-campaign-suggestions');
        const aiSuggestionsToggle = document.getElementById('ai-suggestions-toggle');

        if (suggestions.style.display === 'none' || suggestions.style.display === '') {
            this.showAISuggestions();
        } else {
            this.hideAICampaignSuggestions();
            aiSuggestionsToggle.classList.remove('active');
        }
    }

    showAISuggestions() {
        const suggestions = document.getElementById('ai-campaign-suggestions');
        const aiSuggestionsToggle = document.getElementById('ai-suggestions-toggle');

        suggestions.style.display = 'block';
        aiSuggestionsToggle.classList.add('active');
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MarketingSuperAgentV3();
    console.log('Marketing SuperAgent v3 loaded successfully');
});