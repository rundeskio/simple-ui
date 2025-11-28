// UI Controller for Rundeskio Test Interface - Monday.com Style

document.addEventListener('DOMContentLoaded', function() {
    console.log('=================================');
    console.log('RUNDESKIO TEST INTERFACE v4.0');
    console.log('Monday.com-inspired UI');
    console.log('=================================');

    // Setup tab navigation
    setupTabs();

    // Load saved configuration
    loadSavedConfig();

    // Setup config form
    document.getElementById('config-form').addEventListener('submit', handleConfigSubmit);

    // Test API connections on page load
    testConnections();
});

// ==================== TAB NAVIGATION ====================

function setupTabs() {
    const navItems = document.querySelectorAll('.monday-nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Hide all tabs
    const allTabs = document.querySelectorAll('.tab-pane');
    allTabs.forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    // Remove active from all nav items
    const allNavItems = document.querySelectorAll('.monday-nav-item');
    allNavItems.forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
    }

    // Activate selected nav item
    const selectedNavItem = document.querySelector(`.monday-nav-item[data-tab="${tabName}"]`);
    if (selectedNavItem) {
        selectedNavItem.classList.add('active');
    }
}

// ==================== CONFIGURATION ====================

function loadSavedConfig() {
    const workUrl = localStorage.getItem('work-api-url');
    const commsUrl = localStorage.getItem('comms-api-url');
    const orgId = localStorage.getItem('org-id');
    const userId = localStorage.getItem('user-id');

    if (workUrl) document.getElementById('work-api-url').value = workUrl;
    if (commsUrl) document.getElementById('comms-api-url').value = commsUrl;
    if (orgId) document.getElementById('org-id').value = orgId;
    if (userId) document.getElementById('user-id').value = userId;
}

function handleConfigSubmit(e) {
    e.preventDefault();

    const workUrl = document.getElementById('work-api-url').value;
    const commsUrl = document.getElementById('comms-api-url').value;
    const orgId = document.getElementById('org-id').value;
    const userId = document.getElementById('user-id').value;

    api.saveConfig(workUrl, commsUrl, orgId, userId);

    alert('Configuration saved successfully!');
    console.log('Configuration updated:', { workUrl, commsUrl, orgId, userId });
}

async function testConnections() {
    console.log('Testing API connections...');

    // Test Work API
    try {
        const workHealth = await api.checkWorkHealth();
        updateApiStatus('work', 'online', workHealth);
    } catch (error) {
        updateApiStatus('work', 'offline', error.message);
    }

    // Test Comms API
    try {
        const commsHealth = await api.checkCommsHealth();
        updateApiStatus('comms', 'online', commsHealth);
    } catch (error) {
        updateApiStatus('comms', 'offline', error.message);
    }
}

function updateApiStatus(service, status, data) {
    const statusElementId = service === 'work' ? 'work-api-status' : 'comms-api-status';
    const dotElementId = service === 'work' ? 'work-status-dot' : 'comms-status-dot';

    const statusElement = document.getElementById(statusElementId);
    const dotElement = document.getElementById(dotElementId);

    if (status === 'online') {
        statusElement.textContent = `${service.charAt(0).toUpperCase() + service.slice(1)} API: Online`;
        dotElement.classList.add('online');
        dotElement.classList.remove('offline');
        console.log(`${service} API is online:`, data);
    } else {
        statusElement.textContent = `${service.charAt(0).toUpperCase() + service.slice(1)} API: Offline`;
        dotElement.classList.add('offline');
        dotElement.classList.remove('online');
        console.error(`${service} API is offline:`, data);
    }
}

// ==================== WORKSPACES ====================

function showCreateWorkspace() {
    document.getElementById('create-workspace-form').style.display = 'block';
}

function hideCreateWorkspace() {
    document.getElementById('create-workspace-form').style.display = 'none';
}

async function createWorkspace(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('ws-name').value,
        type: document.getElementById('ws-type').value,
        description: document.getElementById('ws-description').value || null
    };

    try {
        const workspace = await api.createWorkspace(data);
        alert(`Workspace created: ${workspace.name} (ID: ${workspace.id})`);
        hideCreateWorkspace();
        e.target.reset();
        loadWorkspaces();
    } catch (error) {
        alert(`Error creating workspace: ${error.message}`);
    }
}

async function loadWorkspaces() {
    const container = document.getElementById('workspaces-list');
    container.innerHTML = '<div class="monday-loading"><i class="bi bi-arrow-repeat"></i> Loading...</div>';

    try {
        const workspaces = await api.listWorkspaces();

        if (!workspaces || workspaces.length === 0) {
            container.innerHTML = `
                <div class="monday-empty-state">
                    <i class="bi bi-folder"></i>
                    <div class="monday-empty-state-title">No workspaces yet</div>
                    <div class="monday-empty-state-text">Create your first workspace to get started</div>
                </div>
            `;
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Name</th><th>Type</th><th>Description</th><th>ID</th><th>Actions</th></tr></thead><tbody>';

        workspaces.forEach(ws => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(ws.name)}</strong></td>
                    <td><span class="monday-status monday-status-info">${escapeHtml(ws.type)}</span></td>
                    <td>${escapeHtml(ws.description || '-')}</td>
                    <td><span class="monday-code">${ws.id}</span></td>
                    <td>
                        <div class="monday-table-actions">
                            <button class="monday-btn monday-btn-sm monday-btn-icon" onclick="copyToClipboard('${ws.id}')">
                                <i class="bi bi-clipboard"></i>
                            </button>
                            <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteWorkspace('${ws.id}', '${escapeHtml(ws.name)}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="monday-alert monday-alert-danger"><i class="bi bi-exclamation-triangle"></i><div>Error loading workspaces: ${error.message}</div></div>`;
    }
}

async function deleteWorkspace(id, name) {
    if (!confirm(`Delete workspace "${name}"?`)) return;

    try {
        await api.deleteWorkspace(id);
        alert('Workspace deleted successfully');
        loadWorkspaces();
    } catch (error) {
        alert(`Error deleting workspace: ${error.message}`);
    }
}

// ==================== TASKS ====================

function showCreateTask() {
    document.getElementById('create-task-form').style.display = 'block';
}

function hideCreateTask() {
    document.getElementById('create-task-form').style.display = 'none';
}

async function createTask(e) {
    e.preventDefault();

    const workspaceId = document.getElementById('task-workspace-id-create').value;
    const data = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value || null,
        status: document.getElementById('task-status').value,
        due_date: document.getElementById('task-due-date').value || null
    };

    try {
        const task = await api.createTask(workspaceId, data);
        alert(`Task created: ${task.title}`);
        hideCreateTask();
        e.target.reset();
        loadTasks();
    } catch (error) {
        alert(`Error creating task: ${error.message}`);
    }
}

async function loadTasks() {
    const container = document.getElementById('tasks-list');
    const workspaceId = document.getElementById('task-workspace-id').value || null;

    container.innerHTML = '<div class="monday-loading"><i class="bi bi-arrow-repeat"></i> Loading...</div>';

    try {
        const tasks = await api.listTasks(workspaceId);

        if (!tasks || tasks.length === 0) {
            container.innerHTML = `
                <div class="monday-empty-state">
                    <i class="bi bi-check-square"></i>
                    <div class="monday-empty-state-title">No tasks found</div>
                    <div class="monday-empty-state-text">Create a task to get started</div>
                </div>
            `;
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Title</th><th>Status</th><th>Due Date</th><th>ID</th><th>Actions</th></tr></thead><tbody>';

        tasks.forEach(task => {
            const statusClass = task.status === 'completed' ? 'monday-status-success' :
                              task.status === 'in_progress' ? 'monday-status-warning' :
                              'monday-status-secondary';
            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(task.title)}</strong>
                        ${task.description ? `<br><small style="color: var(--text-secondary);">${escapeHtml(task.description)}</small>` : ''}
                    </td>
                    <td><span class="monday-status ${statusClass}">${escapeHtml(task.status.replace('_', ' '))}</span></td>
                    <td>${task.due_date || '-'}</td>
                    <td><span class="monday-code">${task.id}</span></td>
                    <td>
                        <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteTask('${task.workspace_id}', '${task.id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="monday-alert monday-alert-danger"><i class="bi bi-exclamation-triangle"></i><div>Error loading tasks: ${error.message}</div></div>`;
    }
}

async function deleteTask(workspaceId, taskId) {
    if (!confirm('Delete this task?')) return;

    try {
        await api.deleteTask(workspaceId, taskId);
        alert('Task deleted successfully');
        loadTasks();
    } catch (error) {
        alert(`Error deleting task: ${error.message}`);
    }
}

// ==================== GOALS ====================

function showCreateGoal() {
    document.getElementById('create-goal-form').style.display = 'block';
}

function hideCreateGoal() {
    document.getElementById('create-goal-form').style.display = 'none';
}

async function createGoal(e) {
    e.preventDefault();

    const workspaceId = document.getElementById('goal-workspace-id-create').value;
    const data = {
        title: document.getElementById('goal-title').value,
        description: document.getElementById('goal-description').value || null,
        status: document.getElementById('goal-status').value,
        target_date: document.getElementById('goal-target-date').value || null
    };

    try {
        const goal = await api.createGoal(workspaceId, data);
        alert(`Goal created: ${goal.title}`);
        hideCreateGoal();
        e.target.reset();
        loadGoals();
    } catch (error) {
        alert(`Error creating goal: ${error.message}`);
    }
}

async function loadGoals() {
    const container = document.getElementById('goals-list');
    const workspaceId = document.getElementById('goal-workspace-id').value;

    if (!workspaceId) {
        container.innerHTML = '<div class="monday-alert monday-alert-warning"><i class="bi bi-exclamation-circle"></i><div>Please enter a workspace ID</div></div>';
        return;
    }

    container.innerHTML = '<div class="monday-loading"><i class="bi bi-arrow-repeat"></i> Loading...</div>';

    try {
        const goals = await api.listGoals(workspaceId);

        if (!goals || goals.length === 0) {
            container.innerHTML = `
                <div class="monday-empty-state">
                    <i class="bi bi-bullseye"></i>
                    <div class="monday-empty-state-title">No goals found</div>
                    <div class="monday-empty-state-text">Set your first goal to track progress</div>
                </div>
            `;
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Title</th><th>Status</th><th>Target Date</th><th>Progress</th><th>Actions</th></tr></thead><tbody>';

        goals.forEach(goal => {
            const statusClass = goal.status === 'completed' ? 'monday-status-success' :
                              goal.status === 'in_progress' ? 'monday-status-warning' :
                              goal.status === 'on_hold' ? 'monday-status-danger' :
                              'monday-status-secondary';
            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(goal.title)}</strong>
                        ${goal.description ? `<br><small style="color: var(--text-secondary);">${escapeHtml(goal.description)}</small>` : ''}
                    </td>
                    <td><span class="monday-status ${statusClass}">${escapeHtml(goal.status.replace('_', ' '))}</span></td>
                    <td>${goal.target_date || '-'}</td>
                    <td><span class="monday-status monday-status-info">${goal.progress_percentage || 0}%</span></td>
                    <td>
                        <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteGoal('${workspaceId}', '${goal.id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<div class="monday-alert monday-alert-danger"><i class="bi bi-exclamation-triangle"></i><div>Error loading goals: ${error.message}</div></div>`;
    }
}

async function deleteGoal(workspaceId, goalId) {
    if (!confirm('Delete this goal?')) return;

    try {
        await api.deleteGoal(workspaceId, goalId);
        alert('Goal deleted successfully');
        loadGoals();
    } catch (error) {
        alert(`Error deleting goal: ${error.message}`);
    }
}

// ==================== ANNOUNCEMENTS ====================

function showCreateAnnouncement() {
    document.getElementById('create-announcement-form').style.display = 'block';
}

function hideCreateAnnouncement() {
    document.getElementById('create-announcement-form').style.display = 'none';
}

async function createAnnouncement(e) {
    e.preventDefault();

    try {
        // Get all form elements with null checks
        const titleEl = document.getElementById('announcement-title');
        const contentEl = document.getElementById('announcement-content');
        const priorityEl = document.getElementById('announcement-priority');
        const visibilityEl = document.getElementById('announcement-visibility');
        const workspaceIdEl = document.getElementById('announcement-workspace-id-create');

        if (!titleEl || !contentEl || !priorityEl || !visibilityEl || !workspaceIdEl) {
            console.error('Missing form elements:', {
                title: !!titleEl,
                content: !!contentEl,
                priority: !!priorityEl,
                visibility: !!visibilityEl,
                workspaceId: !!workspaceIdEl
            });
            alert('Form elements not found. Please refresh the page.');
            return;
        }

        const workspaceId = workspaceIdEl.value;
        const contentText = contentEl.value;

        // Convert text to ProseMirror JSON format
        const content = {
            type: 'doc',
            content: [{
                type: 'paragraph',
                content: [{
                    type: 'text',
                    text: contentText
                }]
            }]
        };

        const data = {
            title: titleEl.value,
            content: content,
            priority: priorityEl.value,
            visibility: visibilityEl.value,
            workspace_id: workspaceId || null
        };

        const announcement = await api.createAnnouncement(data);
        alert(`Announcement created: ${announcement.title}`);
        hideCreateAnnouncement();
        e.target.reset();
        loadAnnouncements();
    } catch (error) {
        console.error('Error creating announcement:', error);
        alert(`Error creating announcement: ${error.message}`);
    }
}

async function loadAnnouncements() {
    const container = document.getElementById('announcements-list');
    const workspaceId = document.getElementById('announcement-workspace-id').value;

    container.innerHTML = '<p>Loading...</p>';

    try {
        const filters = workspaceId ? { workspace_id: workspaceId } : {};
        const announcements = await api.listAnnouncements(filters);

        if (!announcements || announcements.length === 0) {
            container.innerHTML = '<div class="monday-empty-state"><p>No announcements found.</p></div>';
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Title</th><th>Priority</th><th>Status</th><th>Visibility</th><th>Published</th><th>Actions</th></tr></thead><tbody>';

        announcements.forEach(item => {
            const priorityClass = item.priority === 'urgent' ? 'danger' : item.priority === 'high' ? 'warning' : 'info';
            const statusClass = item.status === 'published' ? 'success' : item.status === 'draft' ? 'warning' : 'info';
            html += `
                <tr>
                    <td><strong>${escapeHtml(item.title)}</strong></td>
                    <td><span class="monday-status monday-status-${priorityClass}">${escapeHtml(item.priority)}</span></td>
                    <td><span class="monday-status monday-status-${statusClass}">${escapeHtml(item.status)}</span></td>
                    <td>${escapeHtml(item.visibility)}</td>
                    <td>${item.published_at ? formatDate(item.published_at) : 'Not published'}</td>
                    <td>
                        <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteAnnouncement('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading announcements: ${error.message}</p>`;
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;

    try {
        await api.deleteAnnouncement(id);
        alert('Announcement deleted successfully');
        loadAnnouncements();
    } catch (error) {
        alert(`Error deleting announcement: ${error.message}`);
    }
}

// ==================== MEMOS ====================

function showCreateMemo() {
    document.getElementById('create-memo-form').style.display = 'block';
}

function hideCreateMemo() {
    document.getElementById('create-memo-form').style.display = 'none';
}

async function createMemo(e) {
    e.preventDefault();

    const contentText = document.getElementById('memo-content').value;

    // Convert text to ProseMirror JSON format
    const content = {
        type: 'doc',
        content: [{
            type: 'paragraph',
            content: [{
                type: 'text',
                text: contentText
            }]
        }]
    };

    const data = {
        title: document.getElementById('memo-title').value,
        content: content,
        memo_type: document.getElementById('memo-type').value,
        visibility: document.getElementById('memo-visibility').value
    };

    try {
        const memo = await api.createMemo(data);
        alert(`Memo created: ${memo.title}`);
        hideCreateMemo();
        e.target.reset();
        loadMemos();
    } catch (error) {
        alert(`Error creating memo: ${error.message}`);
    }
}

async function loadMemos() {
    const container = document.getElementById('memos-list');
    container.innerHTML = '<p>Loading...</p>';

    try {
        const memos = await api.listMemos();

        if (!memos || memos.length === 0) {
            container.innerHTML = '<div class="monday-empty-state"><p>No memos found.</p></div>';
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Visibility</th><th>Published</th><th>Actions</th></tr></thead><tbody>';

        memos.forEach(memo => {
            const statusClass = memo.status === 'published' ? 'success' : memo.status === 'draft' ? 'warning' : 'info';
            html += `
                <tr>
                    <td><strong>${escapeHtml(memo.title)}</strong></td>
                    <td><span class="monday-status monday-status-info">${escapeHtml(memo.memo_type)}</span></td>
                    <td><span class="monday-status monday-status-${statusClass}">${escapeHtml(memo.status)}</span></td>
                    <td>${escapeHtml(memo.visibility)}</td>
                    <td>${memo.published_at ? formatDate(memo.published_at) : 'Not published'}</td>
                    <td>
                        <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteMemo('${memo.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading memos: ${error.message}</p>`;
    }
}

async function deleteMemo(id) {
    if (!confirm('Delete this memo?')) return;

    try {
        await api.deleteMemo(id);
        alert('Memo deleted successfully');
        loadMemos();
    } catch (error) {
        alert(`Error deleting memo: ${error.message}`);
    }
}

// ==================== DECISIONS ====================

function showCreateDecision() {
    document.getElementById('create-decision-form').style.display = 'block';
}

function hideCreateDecision() {
    document.getElementById('create-decision-form').style.display = 'none';
}

async function createDecision(e) {
    e.preventDefault();

    // Helper to convert text to ProseMirror JSON
    const textToProseMirror = (text) => ({
        type: 'doc',
        content: [{
            type: 'paragraph',
            content: text ? [{
                type: 'text',
                text: text
            }] : []
        }]
    });

    const contextText = document.getElementById('decision-context').value;
    const decisionText = document.getElementById('decision-decision').value;
    const consequencesText = document.getElementById('decision-consequences').value;
    const alternativesText = document.getElementById('decision-alternatives').value;

    const data = {
        title: document.getElementById('decision-title').value,
        context: textToProseMirror(contextText),
        decision: textToProseMirror(decisionText),
        consequences: consequencesText ? textToProseMirror(consequencesText) : null,
        alternatives: alternativesText ? textToProseMirror(alternativesText) : null,
        status: document.getElementById('decision-status').value,
        visibility: document.getElementById('decision-visibility').value
    };

    try {
        const decision = await api.createDecision(data);
        alert(`Decision created: ${decision.title}`);
        hideCreateDecision();
        e.target.reset();
        loadDecisions();
    } catch (error) {
        alert(`Error creating decision: ${error.message}`);
    }
}

async function loadDecisions() {
    const container = document.getElementById('decisions-list');
    container.innerHTML = '<p>Loading...</p>';

    try {
        const decisions = await api.listDecisions();

        if (!decisions || decisions.length === 0) {
            container.innerHTML = '<div class="monday-empty-state"><p>No decisions found.</p></div>';
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Title</th><th>Status</th><th>Visibility</th><th>Published</th><th>Actions</th></tr></thead><tbody>';

        decisions.forEach(decision => {
            const statusClass = decision.status === 'accepted' ? 'success' :
                              decision.status === 'rejected' ? 'danger' :
                              decision.status === 'proposed' ? 'warning' : 'info';
            html += `
                <tr>
                    <td><strong>${escapeHtml(decision.title)}</strong></td>
                    <td><span class="monday-status monday-status-${statusClass}">${escapeHtml(decision.status)}</span></td>
                    <td>${escapeHtml(decision.visibility)}</td>
                    <td>${decision.published_at ? formatDate(decision.published_at) : 'Not published'}</td>
                    <td>
                        <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteDecision('${decision.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading decisions: ${error.message}</p>`;
    }
}

async function deleteDecision(id) {
    if (!confirm('Delete this decision?')) return;

    try {
        await api.deleteDecision(id);
        alert('Decision deleted successfully');
        loadDecisions();
    } catch (error) {
        alert(`Error deleting decision: ${error.message}`);
    }
}

// ==================== CELEBRATIONS ====================

function showCreateCelebration() {
    document.getElementById('create-celebration-form').style.display = 'block';
}

function hideCreateCelebration() {
    document.getElementById('create-celebration-form').style.display = 'none';
}

async function createCelebration(e) {
    e.preventDefault();

    const contentText = document.getElementById('celebration-content').value;

    // Convert text to ProseMirror JSON format
    const content = {
        type: 'doc',
        content: [{
            type: 'paragraph',
            content: [{
                type: 'text',
                text: contentText
            }]
        }]
    };

    const data = {
        title: document.getElementById('celebration-title').value,
        message: content,
        celebration_type: document.getElementById('celebration-type').value,
        visibility: document.getElementById('celebration-visibility').value
    };

    try {
        const celebration = await api.createCelebration(data);
        alert(`Celebration created: ${celebration.title}`);
        hideCreateCelebration();
        e.target.reset();
        loadCelebrations();
    } catch (error) {
        alert(`Error creating celebration: ${error.message}`);
    }
}

async function loadCelebrations() {
    const container = document.getElementById('celebrations-list');
    container.innerHTML = '<p>Loading...</p>';

    try {
        const celebrations = await api.listCelebrations();

        if (!celebrations || celebrations.length === 0) {
            container.innerHTML = '<div class="monday-empty-state"><p>No celebrations found.</p></div>';
            return;
        }

        let html = '<table class="monday-table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Visibility</th><th>Published</th><th>Actions</th></tr></thead><tbody>';

        celebrations.forEach(celebration => {
            const statusClass = celebration.status === 'published' ? 'success' : celebration.status === 'draft' ? 'warning' : 'info';
            html += `
                <tr>
                    <td><strong>${escapeHtml(celebration.title)}</strong></td>
                    <td><span class="monday-status monday-status-info">${escapeHtml(celebration.celebration_type)}</span></td>
                    <td><span class="monday-status monday-status-${statusClass}">${escapeHtml(celebration.status)}</span></td>
                    <td>${escapeHtml(celebration.visibility)}</td>
                    <td>${celebration.published_at ? formatDate(celebration.published_at) : 'Not published'}</td>
                    <td>
                        <button class="monday-btn monday-btn-sm monday-btn-danger" onclick="deleteCelebration('${celebration.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading celebrations: ${error.message}</p>`;
    }
}

async function deleteCelebration(id) {
    if (!confirm('Delete this celebration?')) return;

    try {
        await api.deleteCelebration(id);
        alert('Celebration deleted successfully');
        loadCelebrations();
    } catch (error) {
        alert(`Error deleting celebration: ${error.message}`);
    }
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function truncate(text, length) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard: ' + text);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
