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
    activeProcesses: [],

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

    // --- Real-Time Process Hub Methods ---
    
    startProcess(name, totalSteps) {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        const process = {
            id,
            name,
            totalSteps,
            currentStep: 0,
            status: 'Initializing...',
            percentage: 0
        };
        
        this.activeProcesses.push(process);
        this.renderProcessHub();
        return id;
    },

    updateProcess(id, step, statusText = null) {
        const process = this.activeProcesses.find(p => p.id === id);
        if (!process) return;

        process.currentStep = step;
        process.percentage = Math.round((step / process.totalSteps) * 100);
        if (statusText) process.status = statusText;

        this.renderProcessHub();
    },

    finishProcess(id, statusText = 'Completed') {
        const process = this.activeProcesses.find(p => p.id === id);
        if (!process) return;

        process.currentStep = process.totalSteps;
        process.percentage = 100;
        process.status = statusText;
        this.renderProcessHub();

        // Remove from UI after delay
        setTimeout(() => {
            this.activeProcesses = this.activeProcesses.filter(p => p.id !== id);
            this.renderProcessHub();
        }, 5000);
    },

    renderProcessHub() {
        const hub = document.getElementById('process-hub');
        const list = document.getElementById('process-list');
        if (!hub || !list) return;

        if (this.activeProcesses.length === 0) {
            hub.classList.remove('active');
            return;
        }

        hub.classList.add('active');
        list.innerHTML = this.activeProcesses.map(p => `
            <div class="process-item">
                <div class="process-info">
                    <span class="process-name">${p.name}</span>
                    <span class="process-percentage">${p.percentage}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${p.percentage}%"></div>
                </div>
                <div class="process-status-text">${p.status}</div>
            </div>
        `).join('');
        
        lucide.createIcons();
    },

    // --- Notification Methods ---

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

    async sendDirectMessage(phoneNumber, message) {
        if (!phoneNumber) {
            this.toast('Phone number missing', 'error');
            return;
        }

        const config = WhatsappApiService.getConfig();
        if (config.enabled && config.phoneNumberId && config.accessToken) {
            this.toast(`Sending automatic message...`, 'info');
            const result = await WhatsappApiService.sendMessage(phoneNumber, message);
            if (result.success) {
                this.toast(`Message sent successfully!`, 'success');
            } else {
                this.toast(`API Error: ${result.error}`, 'error');
                // Fallback to manual if API fails
                if (confirm(`Automatic send failed: ${result.error}. Open manual WhatsApp instead?`)) {
                    this.openManualWhatsApp(phoneNumber, message);
                }
            }
        } else {
            this.openManualWhatsApp(phoneNumber, message);
        }
    },

    openManualWhatsApp(phoneNumber, message) {
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

        const processId = this.startProcess(`Sending ${type} to ${target}`, 10);
        
        return new Promise(resolve => {
            let step = 0;
            const interval = setInterval(() => {
                step++;
                this.updateProcess(processId, step, `Channel: ${channel} | Step ${step}/10`);
                if (step >= 10) {
                    clearInterval(interval);
                    this.finishProcess(processId, 'Sent Successfully');
                    this.toast(`${type} sent successfully via ${channel}!`, 'success');
                    resolve();
                }
            }, 200);
        });
    },

    async broadcastToAll(message) {
        const data = StorageService.getData();
        const students = data.students || [];
        const studentsWithPhones = students.filter(s => s.parentPhone);

        if (studentsWithPhones.length === 0) {
            this.toast('No student phone numbers found for broadcast', 'warning');
            return;
        }

        const config = WhatsappApiService.getConfig();
        if (config.enabled && config.phoneNumberId && config.accessToken) {
            if (confirm(`Send automatic broadcast to ${studentsWithPhones.length} students via WhatsApp API?`)) {
                const processId = this.startProcess('WhatsApp API Broadcast', studentsWithPhones.length);
                
                let successCount = 0;
                for (let i = 0; i < studentsWithPhones.length; i++) {
                    const student = studentsWithPhones[i];
                    this.updateProcess(processId, i + 1, `Sending to ${student.name}...`);
                    
                    const result = await WhatsappApiService.sendMessage(student.parentPhone, message);
                    if (result.success) successCount++;
                    
                    // Small delay to simulate real-time processing and avoid rate limiting
                    await new Promise(r => setTimeout(r, 500));
                }
                
                this.finishProcess(processId, `Broadcast Finished (${successCount}/${studentsWithPhones.length} sent)`);
                this.toast(`${successCount}/${studentsWithPhones.length} messages sent!`, 'success');
            }
        } else {
            if (confirm(`Send manual broadcast to ${studentsWithPhones.length} students/parents? (Will open multiple tabs)`)) {
                const processId = this.startProcess('Manual WhatsApp Broadcast', studentsWithPhones.length);
                
                studentsWithPhones.forEach((student, index) => {
                    setTimeout(() => {
                        this.openManualWhatsApp(student.parentPhone, message);
                        this.updateProcess(processId, index + 1, `Opening tab for ${student.name}...`);
                        
                        if (index === studentsWithPhones.length - 1) {
                            this.finishProcess(processId, 'All tabs opened');
                        }
                    }, index * 1000); 
                });
                this.toast(`Opening ${studentsWithPhones.length} WhatsApp tabs...`, 'info');
            }
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
