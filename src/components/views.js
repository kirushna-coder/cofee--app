/**
 * CoFee App - Modular View Components
 */

const LibraryView = {
    getStudentName(id) {
        const data = StorageService.getData();
        const student = data.students.find(s => s.id === id);
        return student ? student.name : `Student ${id}`;
    },

    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Library Management</h2>
                <p>Manage book returns, extensions, and swaps.</p>
            </div>
            <div class="section">
                <div class="alerts-list">
                    ${data.library.map(book => `
                        <div class="alert-item">
                            <div class="alert-indicator" style="background: ${new Date(book.dueDate) < new Date() ? 'var(--accent-rose)' : 'var(--accent-emerald)'}"></div>
                            <div class="alert-content">
                                <p class="alert-msg">"${book.title}" - ${this.getStudentName(book.studentId)}</p>
                                <p class="user-role">Due: ${book.dueDate}</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn-ghost" onclick="NotificationSystem.toast('Return recorded', 'success')">Return</button>
                                <button class="btn-ghost" onclick="NotificationSystem.toast('Extension granted (7 days)', 'success')">Extend</button>
                                <button class="btn-primary" onclick="NotificationSystem.simulateSend('Student ${book.studentId}', 'WhatsApp', 'Return Reminder')">Remind</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

const AdminView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Admin Master Panel</h2>
                <p>Send manual updates and broadcast notifications.</p>
            </div>
            
            <div class="dashboard-grid" style="margin-top: 24px;">
                <div class="stat-card" onclick="NotificationSystem.simulateSend('Parents Group', 'WhatsApp/Mail', 'Attendance Report')">
                    <div class="stat-icon"><i data-lucide="user-check"></i></div>
                    <div class="stat-info">
                        <h3>Daily Attendance</h3>
                        <p class="user-role">Send topics & presence</p>
                    </div>
                </div>
                <div class="stat-card" onclick="NotificationSystem.simulateSend('All Members', 'WhatsApp/Mail', 'New Arrivals')">
                    <div class="stat-icon"><i data-lucide="package"></i></div>
                    <div class="stat-info">
                        <h3>New Arrivals</h3>
                        <p class="user-role">Broadcast library books</p>
                    </div>
                </div>
                <div class="stat-card" onclick="NotificationSystem.simulateSend('Active Students', 'Mail', 'Newspapers Feed')">
                    <div class="stat-icon"><i data-lucide="mail"></i></div>
                    <div class="stat-info">
                        <h3>Send Newspapers</h3>
                        <p class="user-role">Dispatch today's news</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Attendance & Topics Management</h3>
                <div class="stat-card" style="margin-top: 16px;">
                    <div class="attendance-setup" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="student-select">
                            <p class="user-role" style="margin-bottom: 10px;">Mark Presence:</p>
                            <div class="student-presence-list" style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                                ${data.students.map(s => `
                                    <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer;">
                                        <input type="checkbox" checked> ${s.name}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="topic-setup">
                            <p class="user-role" style="margin-bottom: 10px;">Topics Covered Today:</p>
                            <textarea id="topics-covered" class="btn-ghost" style="width: 100%; height: 100px; padding: 12px; resize: none;" placeholder="e.g. Algebra - Page 45-50..."></textarea>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="NotificationSystem.simulateSend('Parents Group', 'WhatsApp', 'Detailed Attendance & Topics Update')">Send Detailed Report to Parents</button>
                </div>
            </div>

            <div class="section">
                <h3>Manual Broadcast</h3>
                <div class="stat-card" style="margin-top: 16px;">
                    <textarea class="btn-ghost" id="broadcast-msg" style="width: 100%; height: 100px; padding: 12px; margin-bottom: 12px; resize: none;" placeholder="Type message for worksheets/games..."></textarea>
                    <button class="btn-primary" onclick="NotificationSystem.toast('Broadcast sent to all students!', 'success')">Broadcast to All</button>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

const FeesView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Fee Status</h2>
            </div>
            <div class="section">
                <div class="alerts-list">
                    ${data.fees.map(f => `
                        <div class="alert-item">
                            <div class="alert-indicator" style="background: ${f.status === 'unpaid' ? 'var(--accent-rose)' : 'var(--accent-amber)'}"></div>
                            <div class="alert-content">
                                <p class="alert-msg">${f.month} - ₹${f.amount}</p>
                                <p class="user-role">Student: ${LibraryView.getStudentName(f.studentId)} | Status: ${f.status}</p>
                            </div>
                            <button class="btn-primary" onclick="NotificationSystem.simulateSend('Parent ${f.studentId}', 'WhatsApp', 'Fee Reminder')">Send Reminder</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

const WorksheetsView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
           <div class="view-header">
               <h2>Worksheets & Games</h2>
           </div>
           <div class="section">
               <div class="alerts-list">
                   ${data.worksheets.map(w => `
                       <div class="alert-item">
                           <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                           <div class="alert-content">
                               <p class="alert-msg">${w.title} (Launched: ${w.launched})</p>
                               <p class="user-role">Difficulty: ${w.difficulty}</p>
                           </div>
                           <button class="btn-ghost" onclick="NotificationSystem.simulateSend('Team 3 Members', 'WhatsApp', 'New Worksheet Alert')">Announce</button>
                       </div>
                   `).join('')}
               </div>
           </div>
        `;
        lucide.createIcons();
    }
};

const NewspapersView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
           <div class="view-header">
               <h2>Digital Newspapers</h2>
           </div>
           <div class="section">
               <div class="alerts-list">
                   ${data.newspapers.map(n => `
                       <div class="alert-item">
                           <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                           <div class="alert-content">
                               <p class="alert-msg">${n.title}</p>
                               <p class="user-role">Published: ${new Date(n.launched).toLocaleString()}</p>
                           </div>
                           <button class="btn-primary" onclick="NotificationSystem.simulateSend('Members', 'WhatsApp', 'Newspaper Link')">Dispatch to Group</button>
                       </div>
                   `).join('')}
               </div>
           </div>
        `;
        lucide.createIcons();
    }
};

const StudentsView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Student Roster</h2>
                <p>Full list of students enrolled in Team 3.</p>
            </div>
            <div class="section">
                <div class="alerts-list">
                    ${data.students.map(s => `
                        <div class="alert-item">
                            <div class="user-avatar" style="width: 40px; height: 40px; background: var(--glass-bg); display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid var(--border-color);">
                                ${s.name.charAt(0)}
                            </div>
                            <div class="alert-content">
                                <p class="alert-msg">${s.name}</p>
                                <p class="user-role">Parent: ${s.parentName} | ${s.parentPhone}</p>
                            </div>
                            <button class="btn-ghost" onclick="switchView('profile', ${s.id})">View Profile</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

const ProfileView = {
    render(studentId) {
        const data = StorageService.getData();
        const student = data.students.find(s => s.id === studentId);
        
        if (!student) {
            NotificationSystem.toast("Student not found", "error");
            switchView('students');
            return;
        }

        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header" style="display: flex; align-items: center; gap: 20px;">
                <button class="icon-btn" onclick="switchView('students')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2>Student Profile</h2>
                    <p>Detailed information for ${student.name}</p>
                </div>
            </div>

            <div class="section" style="max-width: 600px; margin: 40px 0;">
                <div class="stat-card" style="padding: 40px; text-align: center;">
                    <div class="user-avatar" style="width: 100px; height: 100px; font-size: 32px; background: var(--accent-blue); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 30px var(--accent-blue-glow);">
                        ${student.name.charAt(0)}
                    </div>
                    <h1 style="font-size: 28px; margin-bottom: 8px;">${student.name}</h1>
                    <p class="user-role" style="font-size: 16px; margin-bottom: 32px;">Student ID: #TS3-${student.id.toString().padStart(3, '0')}</p>
                    
                    <div style="text-align: left; background: var(--glass-bg); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <div style="margin-bottom: 20px;">
                            <p class="user-role" style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Parent / Guardian</p>
                            <p style="font-size: 18px; font-weight: 600;">${student.parentName}</p>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <p class="user-role" style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Contact Number</p>
                            <p style="font-size: 18px; font-weight: 600; color: var(--accent-blue);">${student.parentPhone}</p>
                        </div>
                        <div>
                            <p class="user-role" style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                            <p style="font-size: 18px; font-weight: 600;">${student.parentEmail}</p>
                        </div>
                    </div>

                    <div style="margin-top: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <button class="btn-primary" onclick="NotificationSystem.simulateSend('${student.name}', 'WhatsApp', 'Direct Message')">Message Student</button>
                        <button class="btn-ghost" onclick="NotificationSystem.simulateSend('${student.parentName}', 'WhatsApp', 'Call Invitation')">Call Parent</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

const BlueprintView = {
    render() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Campus Blueprint</h2>
                <p>Interactive architectural overview of Team 3 School Campus.</p>
            </div>

            <div class="section">
                <div class="blueprint-container stat-card">
                    <img src="assets/school_blueprint.png" alt="School Blueprint" class="blueprint-img">
                    
                    <!-- Labels / Pins -->
                    <div class="blueprint-label" style="top: 30%; left: 20%;">
                        <div class="pin"></div>
                        <span>Admin Office</span>
                    </div>
                    <div class="blueprint-label" style="top: 25%; left: 60%;">
                        <div class="pin active"></div>
                        <span>Team 3 Classroom</span>
                    </div>
                    <div class="blueprint-label" style="top: 60%; left: 40%;">
                        <div class="pin"></div>
                        <span>Central Library</span>
                    </div>
                    <div class="blueprint-label" style="top: 70%; left: 75%;">
                        <div class="pin"></div>
                        <span>Science Lab</span>
                    </div>
                    <div class="blueprint-label" style="top: 45%; left: 45%;">
                        <div class="pin"></div>
                        <span>Sports Plaza</span>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

window.LibraryView = LibraryView;
window.AdminView = AdminView;
window.FeesView = FeesView;
window.WorksheetsView = WorksheetsView;
window.NewspapersView = NewspapersView;
window.StudentsView = StudentsView;
window.ProfileView = ProfileView;
window.BlueprintView = BlueprintView;
