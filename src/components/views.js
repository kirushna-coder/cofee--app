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
        const isAdmin = AuthService.isAdmin();
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
                                ${isAdmin ? `
                                    <button class="btn-ghost" onclick="NotificationSystem.toast('Return recorded', 'success')">Return</button>
                                    <button class="btn-ghost" onclick="NotificationSystem.toast('Extension granted (7 days)', 'success')">Extend</button>
                                    <button class="icon-btn" onclick="LibraryView.deleteItem(${book.id})" title="Delete Book"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-primary" onclick="NotificationSystem.simulateSend('Student ${book.studentId}', 'WhatsApp', 'Return Reminder')">Remind</button>
                                ` : `
                                    <button class="btn-ghost" disabled title="Admin Only">View Only</button>
                                `}
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

        this.showLoginForm();
    },

    showLoginForm() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="login-wrapper">
                <div class="login-card stat-card">
                    <div class="logo-section" style="margin-bottom: 24px; justify-content: center;">
                        <div class="logo-icon">☕</div>
                        <h1>CoFee<span>App</span></h1>
                    </div>
                    <h2>Welcome Back</h2>
                    <p class="user-role" style="margin-bottom: 24px;">Please sign in to continue.</p>
                    
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
                        <button class="btn-primary" style="margin-top: 8px; padding: 14px;" onclick="LoginView.handleLogin()">Sign In</button>
                        <p style="text-align: center; font-size: 14px; margin-top: 8px;">Don't have an account? <a href="#" onclick="LoginView.showRegisterForm()" style="color: var(--accent-blue); font-weight: 600;">Sign Up</a></p>

                    </div>
                </div>
            </div>
        `;
    },

    showRegisterForm() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="login-wrapper">
                <div class="login-card stat-card">
                    <div class="logo-section" style="margin-bottom: 24px; justify-content: center;">
                        <div class="logo-icon">☕</div>
                        <h1>CoFee<span>App</span></h1>
                    </div>
                    <h2>Create Account</h2>
                    <p class="user-role" style="margin-bottom: 24px;">Sign up for Team 3 Management.</p>
                    
                    <div id="register-error" class="badge badge-rose" style="display: none; width: 100%; margin-bottom: 20px; text-transform: none;"></div>
                    
                    <div style="display: flex; flex-direction: column; gap: 16px; text-align: left;">
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Full Name</p>
                            <input type="text" id="reg-name" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="John Doe">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Username</p>
                            <input type="text" id="reg-username" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="johndoe">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Password</p>
                            <input type="password" id="reg-password" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="••••••••">
                        </div>
                        <button class="btn-primary" style="margin-top: 8px; padding: 14px;" onclick="LoginView.handleRegister()">Register</button>
                        <p style="text-align: center; font-size: 14px; margin-top: 8px;">Already have an account? <a href="#" onclick="LoginView.showLoginForm()" style="color: var(--accent-blue); font-weight: 600;">Login</a></p>
                    </div>
                </div>
            </div>
        `;
    },

    handleRegister() {
        const name = document.getElementById('reg-name').value.trim();
        const user = document.getElementById('reg-username').value.trim().toLowerCase();
        const pass = document.getElementById('reg-password').value;
        const errorEl = document.getElementById('register-error');

        if (!name || !user || !pass) {
            errorEl.textContent = "All fields are required";
            errorEl.style.display = 'block';
            return;
        }

        const result = AuthService.register(name, user, pass);
        if (result.success) {
            NotificationSystem.toast(result.message, 'success');
            this.showLoginForm();
            document.getElementById('username').value = user;
        } else {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
        }
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
        if (!AuthService.isAdmin()) {
            this.renderAccessDenied();
            return;
        }
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
                    <div class="attendance-setup grid-responsive" style="gap: 20px;">
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
                            <textarea id="topics-covered" class="btn-ghost" style="width: 100%; height: 160px; padding: 12px; resize: vertical;" placeholder="e.g. Algebra - Page 45-50..."></textarea>
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
    },

    renderAccessDenied() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header" style="text-align: center; padding-top: 60px;">
                <div class="stat-icon" style="margin: 0 auto 24px; width: 80px; height: 80px; font-size: 40px; background: rgba(244, 63, 94, 0.1); color: var(--accent-rose);">
                    <i data-lucide="shield-alert"></i>
                </div>
                <h2>Access Denied</h2>
                <p>Only administrators can enter this panel.</p>
                <button class="btn-primary" onclick="switchView('dashboard')" style="max-width: 200px; margin: 32px auto 0;">Return to Dashboard</button>
            </div>
        `;
        lucide.createIcons();
    }
};

const AdminStudentsView = {
    render() {
        if (!AuthService.isAdmin()) {
            AdminView.renderAccessDenied();
            return;
        }
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
                <div class="grid-responsive" style="gap: 32px;">
                    <div class="stat-card">
                        <h3>Register New Student</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
                            <input type="text" id="new-name" class="btn-ghost" style="padding: 12px;" placeholder="Full Name">
                            <input type="text" id="new-parent" class="btn-ghost" style="padding: 12px;" placeholder="Parent Name">
                            <input type="email" id="new-email" class="btn-ghost" style="padding: 12px;" placeholder="Parent Email">
                            <input type="tel" id="new-phone" class="btn-ghost" style="padding: 12px;" placeholder="Parent Phone">
                            <button class="btn-primary" onclick="AdminStudentsView.addStudent()">Register Student</button>
                        </div>
                    </div>

                    <div class="stat-card">
                        <h3>Registered Students</h3>
                        <div class="alerts-list" style="margin-top: 24px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
                            ${data.students.map(s => `
                                <div class="alert-item" style="padding: 12px; gap: 12px;">
                                    <div class="alert-content">
                                        <p class="alert-msg" style="font-size: 14px;">${s.name}</p>
                                    </div>
                                    <button class="icon-btn" onclick="AdminStudentsView.deleteStudent(${s.id})" title="Delete Student">
                                        <i data-lucide="trash-2" style="color: var(--accent-rose);"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    deleteStudent(id) {
        if (confirm("Are you sure you want to delete this student and all their records?")) {
            StorageService.removeFromCollection('students', id);
            NotificationSystem.toast("Student removed from system", "success");
            this.render();
        }
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
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Fee Status</h2>
                <p>Monitor pending and unpaid school fees.</p>
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
                            <div style="display: flex; gap: 8px;">
                                ${isAdmin ? `
                                    <button class="icon-btn" onclick="FeesView.deleteItem(${f.id})" title="Delete Record"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-primary" onclick="NotificationSystem.simulateSend('Parent ${f.studentId}', 'WhatsApp', 'Fee Reminder')">Send Reminder</button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    deleteItem(id) {
        if (confirm("Are you sure you want to delete this fee record?")) {
            StorageService.removeFromCollection('fees', id);
            NotificationSystem.toast("Fee record deleted", "success");
            this.render();
        }
    }
};

const WorksheetsView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');
        container.innerHTML = `
           <div class="view-header">
               <h2>Worksheets & Games</h2>
               <p>Access and announce new educational resources.</p>
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
                            <div style="display: flex; gap: 8px;">
                                ${isAdmin ? `
                                    <button class="icon-btn" onclick="WorksheetsView.deleteItem(${w.id})" title="Delete Worksheet"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-ghost" onclick="NotificationSystem.simulateSend('Team 3 Members', 'WhatsApp', 'New Worksheet Alert')">Announce</button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    deleteItem(id) {
        if (confirm("Are you sure you want to delete this worksheet?")) {
            StorageService.removeFromCollection('worksheets', id);
            NotificationSystem.toast("Worksheet deleted", "success");
            this.render();
        }
    }
};

const NewspapersView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
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
                            <div style="display: flex; gap: 8px;">
                                ${isAdmin ? `
                                    <button class="icon-btn" onclick="NewspapersView.deleteItem(${n.id})" title="Delete Newspaper"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-primary" onclick="NotificationSystem.simulateSend('Members', 'WhatsApp', 'Newspaper Link')">Dispatch to Group</button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    deleteItem(id) {
        if (confirm("Are you sure you want to delete this newspaper entry?")) {
            StorageService.removeFromCollection('newspapers', id);
            NotificationSystem.toast("Newspaper entry deleted", "success");
            this.render();
        }
    }
};

const StudentsView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
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
                            <div class="user-avatar" style="width: 42px; height: 42px; background: var(--accent-blue); flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: 700; font-size: 18px;">
                                ${s.name.charAt(0)}
                            </div>
                            <div class="alert-content">
                                <p class="alert-msg">${s.name}</p>
                                ${isAdmin
                                    ? `<p class="user-role">Parent: ${s.parentName} | ${s.parentPhone}</p>`
                                    : `<p class="user-role" style="font-size: 12px;">Student ID: #TS3-${s.id.toString().padStart(3,'0')}</p>`
                                }
                            </div>
                            ${isAdmin
                                ? `<button class="btn-ghost" onclick="switchView('profile', ${s.id})">View Profile</button>`
                                : `<span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 10px; display: flex; align-items: center; gap: 4px; white-space: nowrap;"><i data-lucide="lock" style="width:10px;height:10px;"></i> Profile: Admin Only</span>`
                            }
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
        if (!AuthService.isAdmin()) {
            AdminView.renderAccessDenied();
            return;
        }

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

            <div class="profile-layout">
                <div class="profile-sidebar">
                    <div class="stat-card profile-card" style="text-align: center;">
                        <div class="user-avatar profile-avatar">
                            ${student.name.charAt(0)}
                        </div>
                        <h1 class="profile-name">${student.name}</h1>
                        <p class="user-role profile-id">Student ID: #TS3-${student.id.toString().padStart(3, '0')}</p>
                        
                        <div class="parent-info-card">
                            <div style="margin-bottom: 24px;">
                                <p class="user-role font-xs">Parent / Guardian</p>
                                <p class="parent-name">${student.parentName}</p>
                            </div>
                            <div style="margin-bottom: 24px;">
                                <p class="user-role font-xs">Contact</p>
                                <p class="parent-phone">${student.parentPhone}</p>
                            </div>
                            <div>
                                <p class="user-role font-xs">Email</p>
                                <p class="parent-email">${student.parentEmail}</p>
                            </div>
                        </div>

                        <div class="profile-actions">
                            ${AuthService.isAdmin() ? `
                                <button class="btn-primary" onclick="NotificationSystem.simulateSend('${student.name}', 'WhatsApp', 'Direct Message')">Message Student</button>
                                <button class="btn-ghost" onclick="NotificationSystem.simulateSend('${student.parentName}', 'WhatsApp', 'Call Invitation')">Call Parent</button>
                            ` : `
                                <button class="btn-ghost" disabled>Messages Restricted to Admin</button>
                            `}
                        </div>
                    </div>
                </div>

                <div class="profile-stats">
                    <div style="margin-top: 0;">
                        <h3 class="section-title">Attendance Summary</h3>
                        <div class="stat-card attendance-card">
                            <div class="circular-progress" style="--percent: ${attendanceRate}">
                                <span class="value">${attendanceRate}%</span>
                            </div>
                            <div class="stat-info">
                                <p class="user-role font-sm">Presence rate for April 2026</p>
                                <p class="stat-detail">Target: 95% | Current: ${attendanceRate}%</p>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 40px;">
                        <h3 class="section-title">Subject Performance</h3>
                        <div class="stat-card">
                            <div class="grades-list" style="display: flex; flex-direction: column; gap: 24px;">
                                ${grades.map(g => `
                                    <div class="grade-item" style="padding: 0;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                            <span class="subject-name">${g.subject}</span>
                                            <span class="subject-score">${g.score}/${g.max}</span>
                                        </div>
                                        <div class="progress-container" style="height: 10px;">
                                            <div class="progress-bar" style="width: ${g.score}%; background: ${g.score > 80 ? 'var(--accent-emerald)' : 'var(--accent-blue)'}; box-shadow: 0 0 10px ${g.score > 80 ? 'rgba(16,185,129,0.3)' : 'var(--accent-blue-glow)'}"></div>
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
