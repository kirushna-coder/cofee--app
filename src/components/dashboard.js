/**
 * CoFee App - Dashboard Component
 */

const Dashboard = {
    render() {
        const data = StorageService.getData();
        const alerts = ReminderService.getAlerts();
        
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Book Buddy Overview</h2>
                <p>Monitor school events, library arrivals, and pending reminders.</p>
            </div>

            <div class="dashboard-grid">
                <div class="stat-card clickable" onclick="switchView('students')" style="cursor: pointer;">
                    <div class="stat-icon"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <h3>Total Students</h3>
                        <p class="value">${data.students.length}</p>
                    </div>
                </div>
                <div class="stat-card clickable" onclick="switchView('events')" style="cursor: pointer;">
                    <div class="stat-icon" style="color: var(--accent-amber)"><i data-lucide="calendar"></i></div>
                    <div class="stat-info">
                        <h3>Upcoming Events</h3>
                        <p class="value">${data.events.length}</p>
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

            <div class="grid-responsive" style="gap: 32px; margin-top: 32px;">
                <section class="section">
                    <div class="section-header">
                        <h3>Active Reminders</h3>
                        <button class="btn-ghost" onclick="Dashboard.refresh()">Refresh</button>
                    </div>
                    <div class="alerts-list">
                        ${alerts.length === 0 ? '<p class="empty-msg">No urgent alerts at the moment.</p>' : ''}
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

                <section class="section">
                    <div class="section-header">
                        <h3>Latest News & Arrivals</h3>
                        <button class="btn-ghost" onclick="switchView('library')">View Library</button>
                    </div>
                    <div class="alerts-list">
                        ${data.arrivals.slice(0, 3).map(a => `
                            <div class="alert-item" style="border: 1px solid var(--border-color);">
                                <div class="alert-icon-square"><i data-lucide="package"></i></div>
                                <div class="alert-content">
                                    <p class="alert-msg">${a.title}</p>
                                    <p class="user-role">${a.type} | Added: ${a.date}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        `;

        lucide.createIcons();
    },

    refresh() {
        NotificationSystem.toast('Checking for new alerts...', 'info');
        this.render();
    }
};

window.Dashboard = Dashboard;
