/**
 * CoFee App - Dashboard Component
 */

const Dashboard = {
    render() {
        const data = StorageService.getData();
        const alerts = ReminderService.getAlerts();
        
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="dashboard-header">
                <h2 class="view-title">Team 3 Overview</h2>
                <p class="view-subtitle">Monitor and manage reminders for classes, fees, and library books.</p>
            </div>

            <div class="dashboard-grid">
                <div class="stat-card clickable" onclick="switchView('students')" style="cursor: pointer;">
                    <div class="stat-icon"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <h3>Total Students</h3>
                        <p class="value">${data.students.length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i data-lucide="book"></i></div>
                    <div class="stat-info">
                        <h3>Books Borrowed</h3>
                        <p class="value">${data.library.length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="color: var(--accent-rose)"><i data-lucide="alert-circle"></i></div>
                    <div class="stat-info">
                        <h3>Pending Alerts</h3>
                        <p class="value">${alerts.length}</p>
                    </div>
                </div>
            </div>

            <section class="section">
                <div class="section-header">
                    <h3>Active Reminders</h3>
                    <button class="btn-ghost" onclick="Dashboard.refresh()">Refresh</button>
                </div>
                <div class="alerts-list">
                    ${alerts.length === 0 ? '<p class="empty-msg">No urgent alerts at the moment. All clear!</p>' : ''}
                    ${alerts.map(alert => `
                        <div class="alert-item ${alert.priority}">
                            <div class="alert-indicator"></div>
                            <div class="alert-content">
                                <p class="alert-msg">${alert.message}</p>
                                <span class="alert-type badge badge-${alert.priority === 'critical' ? 'rose' : (alert.priority === 'warning' ? 'amber' : 'emerald')}">${alert.type}</span>
                            </div>
                            <button class="icon-btn" onclick="NotificationSystem.toast('Dismissed', 'info')">
                                <i data-lucide="check"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;

        lucide.createIcons();
    },

    refresh() {
        NotificationSystem.toast('Checking for new alerts...', 'info');
        this.render();
    }
};

window.Dashboard = Dashboard;
