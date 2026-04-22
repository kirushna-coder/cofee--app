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

        // 3. Library Reminders (7, 12, 14, 20 day schedule)
        data.library.forEach(b => {
            const borrowedDate = new Date(b.borrowedDate);
            const diffDays = Math.floor((now - borrowedDate) / (1000 * 60 * 60 * 24));
            const studentName = getStudentName(b.studentId);
            
            if (diffDays === 7 || diffDays === 12 || diffDays === 14) {
                alerts.push({ type: 'library', message: `Library Reminder: Day ${diffDays} for "${b.title}" (${studentName})`, priority: 'warning' });
            } else if (diffDays === 20) {
                alerts.push({ type: 'library', message: `ACTION REQUIRED: Day 20! Renew/Swap/Warning for "${b.title}" (${studentName})`, priority: 'critical' });
            } else if (diffDays > 20) {
                alerts.push({ type: 'library', message: `OVERDUE: Day ${diffDays} for "${b.title}" (${studentName}). Immediate return needed.`, priority: 'critical' });
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

    sendDirectMessage(phoneNumber, message) {
        if (!phoneNumber) {
            this.toast('Phone number missing', 'error');
            return;
        }
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
        
        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        this.toast(`Opening WhatsApp...`, 'info');
    },

    initiateCall(phoneNumber) {
        if (!phoneNumber) {
            this.toast('Phone number missing', 'error');
            return;
        }
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
        
        window.location.href = `tel:+${cleanNumber}`;
        this.toast(`Initiating call...`, 'info');
    },

    simulateSend(target, channel, type, phoneNumber = null, autoTitle = '') {
        const msgText = autoTitle ? `Book Buddy Update: ${autoTitle}` : `Hello ${target}, regarding: ${type}.`;
        
        if (channel === 'WhatsApp') {
            if (phoneNumber) {
                this.sendDirectMessage(phoneNumber, msgText);
            } else if (target === 'All Members' || target === 'Parents Group') {
                this.broadcastToAll(msgText);
            } else {
                // Generic WhatsApp sharing
                const url = `https://wa.me/?text=${encodeURIComponent(msgText)}`;
                window.open(url, '_blank');
                this.toast(`Opening WhatsApp...`, 'info');
            }
            return Promise.resolve();
        }

        this.toast(`Simulating ${channel} to ${target}...`, 'info');
        return new Promise(resolve => {
            setTimeout(() => {
                this.toast(`${type} sent successfully via ${channel}!`, 'success');
                resolve();
            }, 2000);
        });
    },

    broadcastToAll(message) {
        const data = StorageService.getData();
        const students = data.students || [];
        const studentsWithPhones = students.filter(s => s.parentPhone);

        if (studentsWithPhones.length === 0) {
            this.toast('No student phone numbers found for broadcast', 'warning');
            return;
        }

        if (confirm(`Send broadcast to ${studentsWithPhones.length} students/parents individually?`)) {
            // Using a slight delay to avoid browser blocking multiple popups
            studentsWithPhones.forEach((student, index) => {
                setTimeout(() => {
                    this.sendDirectMessage(student.parentPhone, message);
                }, index * 1000); 
            });
            this.toast(`Initiating ${studentsWithPhones.length} messages...`, 'success');
        }
    },

    triggerUpdateBroadcast(type, itemTitle) {
        const msg = `Greetings from Book Buddy! A new ${type} ("${itemTitle}") has been added. Check it out in the app!`;
        this.broadcastToAll(msg);
    },

    checkScheduledMessages() {
        const data = StorageService.getData();
        const now = new Date();
        let changed = false;

        if (!data.scheduledMessages) return;

        data.scheduledMessages.forEach(msg => {
            if (msg.status === 'pending' && new Date(msg.time) <= now) {
                this.toast(`Scheduled broadcast ready: ${msg.message.substring(0, 20)}...`, 'info');
                this.broadcastToAll(msg.message);
                msg.status = 'sent';
                msg.sentAt = now.toISOString();
                changed = true;
            }
        });

        if (changed) {
            StorageService.saveData(data);
            // Refresh view if admin panel is open
            if (typeof AdminView !== 'undefined' && document.getElementById('scheduled-list')) {
                AdminView.renderScheduledTasks();
            }
        }
    }
};

window.ReminderService = ReminderService;
window.NotificationSystem = NotificationSystem;
