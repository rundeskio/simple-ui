// API Client for Rundeskio Services

class RundeskioAPI {
    constructor() {
        this.workApiUrl = '';
        this.commsApiUrl = '';
        this.orgId = '';
        this.userId = '';
        this.loadConfig();
    }

    loadConfig() {
        this.workApiUrl = localStorage.getItem('work-api-url') || 'http://localhost:8001/api/v1';
        this.commsApiUrl = localStorage.getItem('comms-api-url') || 'http://localhost:8002/api/v1';
        this.orgId = localStorage.getItem('org-id') || '1';
        this.userId = localStorage.getItem('user-id') || '1';
    }

    saveConfig(workUrl, commsUrl, orgId, userId) {
        this.workApiUrl = workUrl;
        this.commsApiUrl = commsUrl;
        this.orgId = orgId;
        this.userId = userId;

        localStorage.setItem('work-api-url', workUrl);
        localStorage.setItem('comms-api-url', commsUrl);
        localStorage.setItem('org-id', orgId);
        localStorage.setItem('user-id', userId);
    }

    async request(service, endpoint, options = {}) {
        const baseUrl = service === 'work' ? this.workApiUrl : this.commsApiUrl;
        const url = `${baseUrl}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Org-Id': this.orgId,
            'X-User-Id': this.userId
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        console.log(`[API] ${options.method || 'GET'} ${url}`, config.body ? JSON.parse(config.body) : '');

        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                console.error(`[API Error] ${response.status}`, data);
                throw new Error(data?.detail || data?.message || `Request failed: ${response.status}`);
            }

            console.log('[API Response]', data);
            return data;
        } catch (error) {
            console.error('[API Exception]', error);
            throw error;
        }
    }

    // Health Checks
    async checkWorkHealth() {
        return this.request('work', '/health');
    }

    async checkCommsHealth() {
        return this.request('comms', '/health');
    }

    // ==================== WORK SERVICE ====================

    // Workspaces
    async listWorkspaces(skip = 0, limit = 50) {
        return this.request('work', `/workspaces?skip=${skip}&limit=${limit}`);
    }

    async createWorkspace(data) {
        return this.request('work', '/workspaces', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getWorkspace(workspaceId) {
        return this.request('work', `/workspaces/${workspaceId}`);
    }

    async updateWorkspace(workspaceId, data) {
        return this.request('work', `/workspaces/${workspaceId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteWorkspace(workspaceId) {
        return this.request('work', `/workspaces/${workspaceId}`, {
            method: 'DELETE'
        });
    }

    // Tasks
    async listTasks(workspaceId, filters = {}) {
        const params = new URLSearchParams();
        if (filters.taskListId) params.append('task_list_id', filters.taskListId);
        if (filters.milestoneId) params.append('milestone_id', filters.milestoneId);
        if (filters.assigneeId) params.append('assignee_id', filters.assigneeId);
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);

        const queryString = params.toString();
        const endpoint = workspaceId
            ? `/workspaces/${workspaceId}/tasks?${queryString}`
            : `/tasks?${queryString}`;

        return this.request('work', endpoint);
    }

    async createTask(workspaceId, data) {
        return this.request('work', `/workspaces/${workspaceId}/tasks`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getTask(workspaceId, taskId) {
        return this.request('work', `/workspaces/${workspaceId}/tasks/${taskId}`);
    }

    async updateTask(workspaceId, taskId, data) {
        return this.request('work', `/workspaces/${workspaceId}/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTask(workspaceId, taskId) {
        return this.request('work', `/workspaces/${workspaceId}/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }

    // Goals
    async listGoals(workspaceId, filters = {}) {
        const params = new URLSearchParams();
        if (filters.assigneeId) params.append('assignee_id', filters.assigneeId);
        if (filters.status) params.append('status', filters.status);
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);

        return this.request('work', `/workspaces/${workspaceId}/goals?${params.toString()}`);
    }

    async createGoal(workspaceId, data) {
        return this.request('work', `/workspaces/${workspaceId}/goals`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getGoal(workspaceId, goalId) {
        return this.request('work', `/workspaces/${workspaceId}/goals/${goalId}`);
    }

    async updateGoal(workspaceId, goalId, data) {
        return this.request('work', `/workspaces/${workspaceId}/goals/${goalId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteGoal(workspaceId, goalId) {
        return this.request('work', `/workspaces/${workspaceId}/goals/${goalId}`, {
            method: 'DELETE'
        });
    }

    // Bookmarks
    async listBookmarks(workspaceId, filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);

        return this.request('work', `/workspaces/${workspaceId}/bookmarks?${params.toString()}`);
    }

    async createBookmark(workspaceId, data) {
        return this.request('work', `/workspaces/${workspaceId}/bookmarks`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteBookmark(workspaceId, bookmarkId) {
        return this.request('work', `/workspaces/${workspaceId}/bookmarks/${bookmarkId}`, {
            method: 'DELETE'
        });
    }

    // ==================== COMMS SERVICE ====================

    // Announcements
    async listAnnouncements(workspaceId, filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);
        if (filters.priority) params.append('priority', filters.priority);

        return this.request('comms', `/workspaces/${workspaceId}/announcements?${params.toString()}`);
    }

    async createAnnouncement(workspaceId, data) {
        return this.request('comms', `/workspaces/${workspaceId}/announcements`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getAnnouncement(announcementId) {
        return this.request('comms', `/announcements/${announcementId}`);
    }

    async updateAnnouncement(announcementId, data) {
        return this.request('comms', `/announcements/${announcementId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deleteAnnouncement(announcementId) {
        return this.request('comms', `/announcements/${announcementId}`, {
            method: 'DELETE'
        });
    }

    // Memos
    async listMemos(filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);
        if (filters.type) params.append('type', filters.type);
        if (filters.visibility) params.append('visibility', filters.visibility);

        return this.request('comms', `/orgs/${this.orgId}/memos?${params.toString()}`);
    }

    async createMemo(data) {
        return this.request('comms', `/orgs/${this.orgId}/memos`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getMemo(memoId) {
        return this.request('comms', `/memos/${memoId}`);
    }

    async updateMemo(memoId, data) {
        return this.request('comms', `/memos/${memoId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deleteMemo(memoId) {
        return this.request('comms', `/memos/${memoId}`, {
            method: 'DELETE'
        });
    }

    // Decision Records
    async listDecisions(filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);
        if (filters.status) params.append('status', filters.status);

        return this.request('comms', `/orgs/${this.orgId}/decisions?${params.toString()}`);
    }

    async createDecision(data) {
        return this.request('comms', `/orgs/${this.orgId}/decisions`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getDecision(decisionId) {
        return this.request('comms', `/decisions/${decisionId}`);
    }

    async updateDecision(decisionId, data) {
        return this.request('comms', `/decisions/${decisionId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deleteDecision(decisionId) {
        return this.request('comms', `/decisions/${decisionId}`, {
            method: 'DELETE'
        });
    }

    // Celebrations
    async listCelebrations(filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);
        if (filters.type) params.append('type', filters.type);

        return this.request('comms', `/orgs/${this.orgId}/celebrations?${params.toString()}`);
    }

    async createCelebration(data) {
        return this.request('comms', `/orgs/${this.orgId}/celebrations`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getCelebration(celebrationId) {
        return this.request('comms', `/celebrations/${celebrationId}`);
    }

    async updateCelebration(celebrationId, data) {
        return this.request('comms', `/celebrations/${celebrationId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deleteCelebration(celebrationId) {
        return this.request('comms', `/celebrations/${celebrationId}`, {
            method: 'DELETE'
        });
    }

    // Newsletters
    async listNewsletters(filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);
        if (filters.status) params.append('status', filters.status);

        return this.request('comms', `/orgs/${this.orgId}/newsletters?${params.toString()}`);
    }

    async createNewsletter(data) {
        return this.request('comms', `/orgs/${this.orgId}/newsletters`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getNewsletter(newsletterId) {
        return this.request('comms', `/newsletters/${newsletterId}`);
    }

    async updateNewsletter(newsletterId, data) {
        return this.request('comms', `/newsletters/${newsletterId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deleteNewsletter(newsletterId) {
        return this.request('comms', `/newsletters/${newsletterId}`, {
            method: 'DELETE'
        });
    }

    // Shares
    async listShares(filters = {}) {
        const params = new URLSearchParams();
        params.append('skip', filters.skip || 0);
        params.append('limit', filters.limit || 50);
        if (filters.category) params.append('category', filters.category);

        return this.request('comms', `/orgs/${this.orgId}/shares?${params.toString()}`);
    }

    async createShare(data) {
        return this.request('comms', `/orgs/${this.orgId}/shares`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getShare(shareId) {
        return this.request('comms', `/shares/${shareId}`);
    }

    async updateShare(shareId, data) {
        return this.request('comms', `/shares/${shareId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async deleteShare(shareId) {
        return this.request('comms', `/shares/${shareId}`, {
            method: 'DELETE'
        });
    }
}

// Global API instance
const api = new RundeskioAPI();
