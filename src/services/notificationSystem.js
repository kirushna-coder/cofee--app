/**
 * CoFee App - Reminder Service
 * Scans data for deadlines and status changes.
 */

const ReminderService = {
    getAlerts() {
        const data = StorageService.getData();
        const alerts = [];
        const now = new Date();

        const getStudentName = (id) => {
            const student = data.students.find(s => s.id === id);
            return student ? student.name : `Student ${id}`;
        };

        // 1. Class Reminders
        data.classes.forEach(c => {
            const classTime = new Date(c.time);
            const diffMin = (classTime - now) / (1000 * 60);
            if (diffMin > 0 && diffMin < 60) {
                alerts.push({ type: 'class', message: `Upcoming class: ${c.title} starts in ${Math.round(diffMin)} mins!`, priority: 'high' });
            }
        });

        // 2. Fee Reminders
        data.fees.forEach(f => {
            if (f.status !== 'paid') {
                const dueDate = new Date(f.dueDate);
                if (dueDate < now) {
                    alerts.push({ type: 'fee', message: `Overdue! ${f.month} fee for ${getStudentName(f.studentId)} is pending.`, priority: 'critical' });
                }
            }
        });

        // 3. Library Reminders
        data.library.forEach(b => {
            const dueDate = new Date(b.dueDate);
            const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24);
            const studentName = getStudentName(b.studentId);
            if (diffDays < 0) {
                alerts.push({ type: 'library', message: `Book Overdue: "${b.title}" (${studentName}) needs attention.`, priority: 'critical' });
            } else if (diffDays < 3) {
                alerts.push({ type: 'library', message: `Book due soon: "${b.title}" (${studentName}) due in ${Math.ceil(diffDays)} days.`, priority: 'warning' });
            }
        });

        return alerts;
    }
};

/**
 * CoFee App - Notification System
 * Handles UI toasts and simulated external notifications.
 */

const NotificationSystem = {
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'warning') icon = 'alert-triangle';
        if (type === 'error') icon = 'x-octagon';

        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    updateBadge() {
        const badge = document.getElementById('notif-badge');
        if (badge) {
            const alerts = ReminderService.getAlerts();
            badge.innerText = alerts.length;
            badge.style.display = alerts.length > 0 ? 'flex' : 'none';
        }
    },

    refreshDropdown() {
        const container = document.getElementById('notif-items');
        if (!container) return;

        const alerts = ReminderService.getAlerts();
        if (alerts.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 13px;">No new notifications</p>';
            return;
        }

        container.innerHTML = alerts.map(alert => `
            <div class="notif-dropdown-item">
                <div class="icon" style="background: rgba(59,130,246,0.1); color: var(--accent-blue)">
                    <i data-lucide="bell" style="width: 16px; height: 16px;"></i>
                </div>
                <div class="notif-text">
                    <p>${alert.message}</p>
                    <span>${alert.type.toUpperCase()} • Just now</span>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
    },

    clearAll() {
        this.toast('Notifications cleared', 'success');
        const container = document.getElementById('notif-items');
        if (container) container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 13px;">No new notifications</p>';
        const badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
    },

    simulateSend(target, channel, type, phoneNumber = null) {
        const msgText = `Hello ${target}, regarding: ${type}.`;
        
        if (channel === 'WhatsApp' && phoneNumber) {
            let cleanNumber = phoneNumber.replace(/\D/g, '');
            if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
            
            const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msgText)}`;
            window.open(url, '_blank');
            this.toast(`Opening WhatsApp chat with ${target}...`, 'info');
            return Promise.resolve();
        }

        this.toast(`Simulating ${channel} to ${target}...`, 'info');
        return new Promise(resolve => {
            setTimeout(() => {
                this.toast(`${type} sent successfully via ${channel}!`, 'success');
                resolve();
            }, 2000);
        });
    }
};

window.ReminderService = ReminderService;
window.NotificationSystem = NotificationSystem;
