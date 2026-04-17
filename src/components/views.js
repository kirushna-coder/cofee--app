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

const LoginView = {
    render() {
        const container = document.getElementById('view-container');
        // Hide top nav while on login page
        const topNav = document.querySelector('.top-nav');
        if (topNav) topNav.style.display = 'none';
        document.body.classList.add('login-page');

        container.innerHTML = `
            <div class="login-wrapper">
                <div class="login-card stat-card">
                    <div class="logo-section" style="margin-bottom: 32px; justify-content: center;">
                        <div class="logo-icon">☕</div>
                        <h1>CoFee<span>App</span></h1>
                    </div>
                    <h2>Welcome Back</h2>
                    <p class="user-role" style="margin-bottom: 32px;">Please sign in to continue to Team 3 Dashboard.</p>
                    
                    <div id="login-error" class="badge badge-rose" style="display: none; width: 100%; margin-bottom: 20px; text-transform: none;"></div>
                    
                    <div style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Username</p>
                            <input type="text" id="username" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="admin">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Password</p>
                            <input type="password" id="password" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="••••••••">
                        </div>
                        <button class="btn-primary" style="margin-top: 16px; padding: 14px;" onclick="LoginView.handleLogin()">Sign In</button>
                        <button class="btn-ghost" style="padding: 12px; border: 1px dashed var(--accent-blue);" onclick="LoginView.autoLogin()">Quick Admin Entry</button>
                    </div>
                    
                    <div style="margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 24px;">
                        <p class="user-role" style="font-size: 12px; margin-bottom: 8px;">Default Credentials:</p>
                        <p class="user-role" style="font-size: 12px;">Admin: <strong>admin</strong> / Pass: <strong>p</strong></p>
                        <button class="btn-ghost" style="margin-top: 20px; font-size: 10px; opacity: 0.5;" onclick="LoginView.resetSystem()">Force System Reset</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    resetSystem() {
        if (confirm("This will clear all saved data and reset the app. Continue?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    },

    autoLogin() {
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'p';
        this.handleLogin();
    },

    handleLogin() {
        const user = document.getElementById('username').value.trim().toLowerCase();
        const pass = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        
        const result = AuthService.login(user, pass);
        if (result.success) {
            // Restore UI
            const topNav = document.querySelector('.top-nav');
            if (topNav) topNav.style.display = 'flex';
            document.body.classList.remove('login-page');
            
            // Redirect to dashboard
            window.location.reload(); 
        } else {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
            NotificationSystem.toast(result.message, 'error');
        }
    }
};

const AdminView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Admin Master Panel</h2>
                <p>Manage students, attendance, and broadcasting.</p>
            </div>
            
            <div class="dashboard-grid" style="margin-top: 24px;">
                <div class="stat-card" onclick="switchView('admin-students')">
                    <div class="stat-icon"><i data-lucide="user-plus"></i></div>
                    <div class="stat-info">
                        <h3>Student Management</h3>
                        <p class="user-role">Add or edit students</p>
                    </div>
                </div>
                <div class="stat-card" onclick="NotificationSystem.simulateSend('All Members', 'WhatsApp/Mail', 'New Arrivals')">
                    <div class="stat-icon"><i data-lucide="package"></i></div>
                    <div class="stat-info">
                        <h3>New Arrivals</h3>
                        <p class="user-role">Broadcast library books</p>
                    </div>
                </div>
                <div class="stat-card" onclick="AuthService.logout()">
                    <div class="stat-icon"><i data-lucide="log-out"></i></div>
                    <div class="stat-info">
                        <h3>Logout</h3>
                        <p class="user-role">Securely sign out</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Attendance Summary (Manual Entry)</h3>
                <div class="stat-card" style="margin-top: 16px;">
                    <div class="attendance-setup" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="student-select">
                            <p class="user-role" style="margin-bottom: 10px;">Select Date: <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}" class="btn-ghost" style="padding: 4px 8px; font-size: 12px;"></p>
                            <div class="student-presence-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                                ${data.students.map(s => `
                                    <label style="display: flex; align-items: center; justify-content: space-between; font-size: 14px; cursor: pointer; padding: 8px; background: var(--glass-bg); border-radius: 8px;">
                                        <span>${s.name}</span>
                                        <div style="display: flex; gap: 8px;">
                                            <input type="radio" name="att-${s.id}" value="present" checked> P
                                            <input type="radio" name="att-${s.id}" value="absent"> A
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="topic-setup">
                            <p class="user-role" style="margin-bottom: 10px;">Topics Covered Today:</p>
                            <textarea id="topics-covered" class="btn-ghost" style="width: 100%; height: 160px; padding: 12px; resize: none;" placeholder="e.g. Algebra - Page 45-50..."></textarea>
                            <button class="btn-primary" style="margin-top: 12px; width: 100%;" onclick="AdminView.saveAttendance()">Save & Notify Parents</button>
                        </div>
                    </div>
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
    },

    saveAttendance() {
        const date = document.getElementById('attendance-date').value;
        const data = StorageService.getData();
        const newRecords = [];

        data.students.forEach(s => {
            const status = document.querySelector(`input[name="att-${s.id}"]:checked`).value;
            newRecords.push({ date, studentId: s.id, status });
        });

        // Add to records
        data.attendanceRecords = [...(data.attendanceRecords || []), ...newRecords];
        StorageService.saveData(data);

        NotificationSystem.toast(`Attendance for ${date} saved and parents notified!`, 'success');
        NotificationSystem.simulateSend('Parents Group', 'WhatsApp', `Daily Update: ${document.getElementById('topics-covered').value}`);
    }
};

const AdminStudentsView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header" style="display: flex; align-items: center; gap: 20px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2>Student Management</h2>
                    <p>Add new students to the Team 3 roster.</p>
                </div>
            </div>

            <div class="section">
                <div class="stat-card" style="max-width: 600px;">
                    <h3>Register New Student</h3>
                    <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
                        <input type="text" id="new-name" class="btn-ghost" style="padding: 12px;" placeholder="Full Name">
                        <input type="text" id="new-parent" class="btn-ghost" style="padding: 12px;" placeholder="Parent Name">
                        <input type="email" id="new-email" class="btn-ghost" style="padding: 12px;" placeholder="Parent Email">
                        <input type="tel" id="new-phone" class="btn-ghost" style="padding: 12px;" placeholder="Parent Phone">
                        <button class="btn-primary" onclick="AdminStudentsView.addStudent()">Register Student</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    addStudent() {
        const name = document.getElementById('new-name').value;
        const parentName = document.getElementById('new-parent').value;
        const parentEmail = document.getElementById('new-email').value;
        const parentPhone = document.getElementById('new-phone').value;

        if (!name || !parentName) {
            NotificationSystem.toast("Name and Parent Name are required", "error");
            return;
        }

        const data = StorageService.getData();
        const newId = data.students.length > 0 ? Math.max(...data.students.map(s => s.id)) + 1 : 1;
        
        const newStudent = { id: newId, name, parentName, parentEmail, parentPhone };
        data.students.push(newStudent);
        StorageService.saveData(data);

        NotificationSystem.toast(`${name} registered successfully!`, "success");
        switchView('students');
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
        
        // Calculate attendance
        const attendanceRecords = data.attendanceRecords || [];
        const attendance = attendanceRecords.filter(r => r.studentId === student.id);
        const presentCount = attendance.filter(r => r.status === 'present').length;
        const totalDays = attendance.length || 1;
        const attendanceRate = Math.round((presentCount / totalDays) * 100);

        // Get grades
        const performanceMetrics = data.performanceMetrics || [];
        const grades = performanceMetrics.filter(m => m.studentId === student.id);

        container.innerHTML = `
            <div class="view-header" style="display: flex; align-items: center; gap: 20px;">
                <button class="icon-btn" onclick="switchView('students')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2>Student Profile</h2>
                    <p>Detailed information for ${student.name}</p>
                </div>
            </div>

            <div class="profile-layout" style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; margin-top: 32px;">
                <div class="profile-sidebar">
                    <div class="stat-card" style="padding: 40px; text-align: center;">
                        <div class="user-avatar" style="width: 100px; height: 100px; font-size: 32px; background: var(--accent-blue); margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 30px var(--accent-blue-glow);">
                            ${student.name.charAt(0)}
                        </div>
                        <h1 style="font-size: 28px; margin-bottom: 8px;">${student.name}</h1>
                        <p class="user-role" style="font-size: 16px; margin-bottom: 32px;">Student ID: #TS3-${student.id.toString().padStart(3, '0')}</p>
                        
                        <div style="text-align: left; background: var(--glass-bg); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <div style="margin-bottom: 20px;">
                                <p class="user-role" style="font-size: 10px; text-transform: uppercase;">Parent / Guardian</p>
                                <p style="font-size: 16px; font-weight: 600;">${student.parentName}</p>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <p class="user-role" style="font-size: 10px; text-transform: uppercase;">Contact</p>
                                <p style="font-size: 16px; font-weight: 600;">${student.parentPhone}</p>
                            </div>
                            <div>
                                <p class="user-role" style="font-size: 10px; text-transform: uppercase;">Email</p>
                                <p style="font-size: 16px; font-weight: 600; word-break: break-all;">${student.parentEmail}</p>
                            </div>
                        </div>

                        <div style="margin-top: 32px; display: grid; grid-template-columns: 1fr; gap: 12px;">
                            <button class="btn-primary" onclick="NotificationSystem.simulateSend('${student.name}', 'WhatsApp', 'Direct Message')">Message Student</button>
                            <button class="btn-ghost" onclick="NotificationSystem.simulateSend('${student.parentName}', 'WhatsApp', 'Call Invitation')">Call Parent</button>
                        </div>
                    </div>
                </div>

                <div class="profile-stats">
                    <div class="section" style="margin-top: 0;">
                        <h3>Attendance Summary</h3>
                        <div class="stat-card" style="margin-top: 16px; display: flex; align-items: center; gap: 32px;">
                            <div class="circular-progress" style="--percent: ${attendanceRate}">
                                <span class="value">${attendanceRate}%</span>
                            </div>
                            <div class="stat-info">
                                <p class="user-role">Presence rate for April 2026</p>
                                <p style="font-size: 14px; margin-top: 8px;">Target: 95% | Current: ${attendanceRate}%</p>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Subject Performance</h3>
                        <div class="stat-card" style="margin-top: 16px;">
                            <div class="grades-list" style="display: flex; flex-direction: column; gap: 20px;">
                                ${grades.map(g => `
                                    <div class="grade-item">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                            <span style="font-size: 14px; font-weight: 600;">${g.subject}</span>
                                            <span style="font-size: 14px; color: var(--accent-blue);">${g.score}/${g.max}</span>
                                        </div>
                                        <div class="progress-container">
                                            <div class="progress-bar" style="width: ${g.score}%; background: ${g.score > 80 ? 'var(--accent-emerald)' : 'var(--accent-blue)'}"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
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

const PerformanceView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        
        // Calculate class averages
        const performanceMetrics = data.performanceMetrics || [];
        const subjects = ["Mathematics", "English", "Science"];
        const averages = subjects.map(sub => {
            const scores = performanceMetrics.filter(m => m.subject === sub);
            const avg = scores.length > 0 ? (scores.reduce((sum, m) => sum + m.score, 0) / scores.length) : 0;
            return { subject: sub, average: Math.round(avg) };
        });

        container.innerHTML = `
            <div class="view-header">
                <h2>Performance Analytics</h2>
                <p>Class-wide academic performance and subject benchmarks.</p>
            </div>

            <div class="section">
                <h3>Subject Averages</h3>
                <div class="dashboard-grid" style="margin-top: 24px;">
                    ${averages.map(avg => `
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${avg.subject} Average</h3>
                                <p class="value">${avg.average}%</p>
                                <div class="progress-container">
                                    <div class="progress-bar" style="width: ${avg.average}%; background: var(--accent-blue)"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h3>Top Performers</h3>
                <div class="alerts-list">
                    ${data.students.slice(0, 3).map(s => `
                        <div class="alert-item">
                            <div class="user-avatar" style="background: var(--accent-emerald)">${s.name.charAt(0)}</div>
                            <div class="alert-content">
                                <p class="alert-msg">${s.name}</p>
                                <p class="user-role">Consistently High Performance</p>
                            </div>
                            <div class="badge badge-emerald">Rank #${data.students.indexOf(s) + 1}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

window.LibraryView = LibraryView;
window.LoginView = LoginView;
window.AdminView = AdminView;
window.AdminStudentsView = AdminStudentsView;
window.FeesView = FeesView;
window.WorksheetsView = WorksheetsView;
window.NewspapersView = NewspapersView;
window.StudentsView = StudentsView;
window.ProfileView = ProfileView;
window.BlueprintView = BlueprintView;
window.PerformanceView = PerformanceView;
