// UI Controller for Rundeskio Test Interface

document.addEventListener('DOMContentLoaded', function() {
    console.log('=================================');
    console.log('RUNDESKIO TEST INTERFACE v3.0');
    console.log('Bootstrap UI - API Integration');
    console.log('=================================');

    // Load saved configuration
    loadSavedConfig();

    // Setup config form
    document.getElementById('config-form').addEventListener('submit', handleConfigSubmit);

    // Test API connections on page load
    testConnections();
});

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
    const elementId = service === 'work' ? 'work-api-status' : 'comms-api-status';
    const element = document.getElementById(elementId);

    if (status === 'online') {
        element.innerHTML = `${service.toUpperCase()} API: <span class="text-success fw-bold">Online</span>`;
        console.log(`${service} API is online:`, data);
    } else {
        element.innerHTML = `${service.toUpperCase()} API: <span class="text-danger fw-bold">Offline</span>`;
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
    container.innerHTML = '<p>Loading...</p>';

    try {
        const workspaces = await api.listWorkspaces();

        if (!workspaces || workspaces.length === 0) {
            container.innerHTML = '<p>No workspaces found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Name</th><th>Type</th><th>Description</th><th>ID</th><th>Actions</th></tr></thead><tbody>';

        workspaces.forEach(ws => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(ws.name)}</strong></td>
                    <td><span class="badge bg-secondary">${escapeHtml(ws.type)}</span></td>
                    <td>${escapeHtml(ws.description || '-')}</td>
                    <td><code class="small">${ws.id}</code></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="copyToClipboard('${ws.id}')">Copy ID</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteWorkspace('${ws.id}', '${escapeHtml(ws.name)}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div></div>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading workspaces: ${error.message}</p>`;
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

    container.innerHTML = '<p>Loading...</p>';

    try {
        const tasks = await api.listTasks(workspaceId);

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<p>No tasks found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Title</th><th>Status</th><th>Due Date</th><th>ID</th><th>Actions</th></tr></thead><tbody>';

        tasks.forEach(task => {
            const statusBadge = task.status === 'completed' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : 'bg-secondary';
            html += `
                <tr>
                    <td><strong>${escapeHtml(task.title)}</strong><br><small class="text-muted">${escapeHtml(task.description || '')}</small></td>
                    <td><span class="badge ${statusBadge}">${escapeHtml(task.status)}</span></td>
                    <td>${task.due_date || '-'}</td>
                    <td><code class="small">${task.id}</code></td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${task.workspace_id}', '${task.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div></div>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading tasks: ${error.message}</p>`;
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
        container.innerHTML = '<p>Please enter a workspace ID</p>';
        return;
    }

    container.innerHTML = '<p>Loading...</p>';

    try {
        const goals = await api.listGoals(workspaceId);

        if (!goals || goals.length === 0) {
            container.innerHTML = '<p>No goals found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Title</th><th>Status</th><th>Target Date</th><th>Progress</th><th>Actions</th></tr></thead><tbody>';

        goals.forEach(goal => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(goal.title)}</strong><br><small>${escapeHtml(goal.description || '')}</small></td>
                    <td>${escapeHtml(goal.status)}</td>
                    <td>${goal.target_date || '-'}</td>
                    <td>${goal.progress_percentage || 0}%</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteGoal('${workspaceId}', '${goal.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `<p class="error">Error loading goals: ${error.message}</p>`;
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

    const workspaceId = document.getElementById('announcement-workspace-id-create').value;
    const data = {
        title: document.getElementById('announcement-title').value,
        content_html: document.getElementById('announcement-content').value,
        priority: document.getElementById('announcement-priority').value,
        expires_at: document.getElementById('announcement-expires').value || null
    };

    try {
        const announcement = await api.createAnnouncement(workspaceId, data);
        alert(`Announcement created: ${announcement.title}`);
        hideCreateAnnouncement();
        e.target.reset();
        loadAnnouncements();
    } catch (error) {
        alert(`Error creating announcement: ${error.message}`);
    }
}

async function loadAnnouncements() {
    const container = document.getElementById('announcements-list');
    const workspaceId = document.getElementById('announcement-workspace-id').value;

    if (!workspaceId) {
        container.innerHTML = '<p>Please enter a workspace ID</p>';
        return;
    }

    container.innerHTML = '<p>Loading...</p>';

    try {
        const announcements = await api.listAnnouncements(workspaceId);

        if (!announcements || announcements.length === 0) {
            container.innerHTML = '<p>No announcements found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Title</th><th>Priority</th><th>Content</th><th>Created</th><th>Actions</th></tr></thead><tbody>';

        announcements.forEach(item => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(item.title)}</strong></td>
                    <td>${escapeHtml(item.priority)}</td>
                    <td>${truncate(stripHtml(item.content_html), 100)}</td>
                    <td>${formatDate(item.created_at)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement('${item.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
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

    const data = {
        title: document.getElementById('memo-title').value,
        content_html: document.getElementById('memo-content').value,
        type: document.getElementById('memo-type').value,
        visibility: document.getElementById('memo-visibility').value,
        effective_date: document.getElementById('memo-effective-date').value || null
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
            container.innerHTML = '<p>No memos found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Title</th><th>Type</th><th>Visibility</th><th>Effective Date</th><th>Actions</th></tr></thead><tbody>';

        memos.forEach(memo => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(memo.title)}</strong></td>
                    <td>${escapeHtml(memo.type)}</td>
                    <td>${escapeHtml(memo.visibility)}</td>
                    <td>${memo.effective_date || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMemo('${memo.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
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

    const data = {
        title: document.getElementById('decision-title').value,
        context_html: document.getElementById('decision-context').value,
        decision_html: document.getElementById('decision-decision').value,
        consequences_html: document.getElementById('decision-consequences').value || null,
        alternatives_html: document.getElementById('decision-alternatives').value || null,
        status: document.getElementById('decision-status').value,
        decided_date: document.getElementById('decision-decided-date').value || null
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
            container.innerHTML = '<p>No decisions found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Title</th><th>Status</th><th>Decided Date</th><th>Context</th><th>Actions</th></tr></thead><tbody>';

        decisions.forEach(decision => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(decision.title)}</strong></td>
                    <td>${escapeHtml(decision.status)}</td>
                    <td>${decision.decided_date || '-'}</td>
                    <td>${truncate(stripHtml(decision.context_html), 100)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteDecision('${decision.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
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

    const data = {
        title: document.getElementById('celebration-title').value,
        message_html: document.getElementById('celebration-message').value,
        type: document.getElementById('celebration-type').value,
        celebrated_date: document.getElementById('celebration-celebrated-date').value || null
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
            container.innerHTML = '<p>No celebrations found.</p>';
            return;
        }

        let html = '<div class="table-responsive"><table class="table table-striped table-hover"><thead class="table-dark"><tr><th>Title</th><th>Type</th><th>Date</th><th>Message</th><th>Actions</th></tr></thead><tbody>';

        celebrations.forEach(celebration => {
            html += `
                <tr>
                    <td><strong>${escapeHtml(celebration.title)}</strong></td>
                    <td>${escapeHtml(celebration.type)}</td>
                    <td>${celebration.celebrated_date || '-'}</td>
                    <td>${truncate(stripHtml(celebration.message_html), 100)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCelebration('${celebration.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
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
