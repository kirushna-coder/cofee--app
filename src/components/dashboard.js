/**
 * CoFee App - Dashboard Component
 */

const Dashboard = {
    render() {
        const data = StorageService.getData();
        const alerts = ReminderService.getAlerts();
        const user = AuthService.getUser();
        
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                    <div>
                        <h2 style="font-size: 32px; letter-spacing: -0.5px;">Welcome back, ${user.name.split(' ')[0]}!</h2>
                        <p style="font-size: 16px; margin-top: 4px;">Here's what's happening at Book Buddy today.</p>
                    </div>
                    <div class="system-status desktop-only" style="margin-bottom: 8px;">
                        <span class="status-dot"></span>
                        <span class="status-text">System Live</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-grid slide-up" style="animation-delay: 0.1s;">
                <div class="stat-card clickable" onclick="switchView('students')">
                    <div class="stat-icon-wrapper blue">
                        <i data-lucide="users"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Total Students</h3>
                        <p class="value">${data.students.length}</p>
                        <span class="stat-trend positive">Active Roster</span>
                    </div>
                </div>
                <div class="stat-card clickable" onclick="switchView('events')">
                    <div class="stat-icon-wrapper amber">
                        <i data-lucide="calendar"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Upcoming Events</h3>
                        <p class="value">${data.events.length}</p>
                        <span class="stat-trend warning">Next 7 days</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper rose">
                        <i data-lucide="alert-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3>Pending Alerts</h3>
                        <p class="value">${alerts.length}</p>
                        <span class="stat-trend negative">Requires Action</span>
                    </div>
                </div>
            </div>

            <div class="grid-responsive slide-up" style="gap: 32px; margin-top: 32px; animation-delay: 0.2s;">
                <section class="section">
                    <div class="section-header" style="margin-bottom: 24px;">
                        <h3 style="font-size: 20px; font-weight: 700;">Active Reminders</h3>
                        <button class="btn-ghost btn-sm" onclick="Dashboard.refresh()">
                            <i data-lucide="rotate-cw" style="width: 14px; height: 14px;"></i> Refresh
                        </button>
                    </div>
                    <div class="alerts-list">
                        ${alerts.length === 0 ? `
                            <div class="empty-state">
                                <div class="empty-icon"><i data-lucide="check-circle-2"></i></div>
                                <p>All caught up! No urgent alerts.</p>
                            </div>
                        ` : ''}
                        ${alerts.map(alert => `
                            <div class="alert-item ${alert.priority}">
                                <div class="alert-indicator"></div>
                                <div class="alert-content">
                                    <p class="alert-msg">${alert.message}</p>
                                    <div style="display: flex; gap: 8px; margin-top: 6px;">
                                        <span class="badge badge-${alert.priority === 'critical' ? 'rose' : (alert.priority === 'warning' ? 'amber' : 'emerald')}">${alert.type}</span>
                                        <span class="user-role" style="font-size: 10px; opacity: 0.6;">Just now</span>
                                    </div>
                                </div>
                                <button class="icon-btn" onclick="NotificationSystem.toast('Alert dismissed', 'success')">
                                    <i data-lucide="check"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </section>

                <section class="section">
                    <div class="section-header" style="margin-bottom: 24px;">
                        <h3 style="font-size: 20px; font-weight: 700;">Latest News & Arrivals</h3>
                        <button class="btn-ghost btn-sm" onclick="switchView('library')">Library Hub</button>
                    </div>
                    <div class="alerts-list">
                        ${data.arrivals.slice(0, 3).map(a => `
                            <div class="alert-item premium">
                                <div class="alert-icon-circle"><i data-lucide="package"></i></div>
                                <div class="alert-content">
                                    <p class="alert-msg">${a.title}</p>
                                    <p class="user-role">${a.type} • Added on ${a.date}</p>
                                </div>
                                <button class="icon-btn" onclick="NotificationSystem.triggerUpdateBroadcast('New arrival', '${a.title}')" title="Broadcast">
                                    <i data-lucide="share-2"></i>
                                </button>
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
