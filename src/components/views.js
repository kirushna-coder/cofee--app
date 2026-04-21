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
                                ${isAdmin ? (() => {
                                    const s = data.students.find(st => st.id === book.studentId);
                                    const phone = s ? s.parentPhone : '';
                                    const sName = s ? s.name : `Student ${book.studentId}`;
                                    return `
                                        <button class="btn-ghost" onclick="NotificationSystem.toast('Return recorded', 'success')">Return</button>
                                        <button class="btn-ghost" onclick="NotificationSystem.simulateSend('${sName}', 'WhatsApp', 'Book Renewal', '${phone}', 'I would like to RENEW the book: ${book.title}')">Renew</button>
                                        <button class="btn-ghost" onclick="NotificationSystem.simulateSend('${sName}', 'WhatsApp', 'Book Swap', '${phone}', 'I would like to SWAP the book: ${book.title}')">Swap</button>
                                        <button class="icon-btn" onclick="LibraryView.deleteItem(${book.id})" title="Delete Book"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                        <button class="btn-primary" onclick="NotificationSystem.simulateSend('${sName}', 'WhatsApp', 'Return Reminder', '${phone}')">Remind</button>
                                    `;
                                })() : `
                                    <button class="btn-ghost" disabled title="Admin Only">View Only</button>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        lucide.createIcons();
        this.renderArrivals();
    },

    deleteItem(id) {
        if (confirm("Delete this book record?")) {
            StorageService.removeFromCollection('library', id);
            NotificationSystem.toast("Book record deleted", "success");
            this.render();
        }
    },

    renderArrivals() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');
        
        container.insertAdjacentHTML('beforeend', `
            <div class="section" style="margin-top: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>New Arrivals (Library)</h3>
                    ${isAdmin ? `
                        <button class="btn-primary" onclick="LibraryView.showAddArrivalModal()">
                            <i data-lucide="plus-circle" style="width: 14px; height: 14px; margin-right: 8px;"></i> Log New Arrival
                        </button>
                    ` : ''}
                </div>
                <div class="alerts-list">
                    ${data.arrivals.map(a => `
                        <div class="alert-item">
                            <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                            <div class="alert-content">
                                <p class="alert-msg">${a.title}</p>
                                <p class="user-role">${a.type} | Added: ${a.date}</p>
                            </div>
                            ${isAdmin ? `
                                <div style="display: flex; gap: 8px;">
                                    <button class="icon-btn" onclick="LibraryView.deleteArrival(${a.id})"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-ghost" onclick="NotificationSystem.triggerUpdateBroadcast('New arrival', '${a.title}')">Announce</button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="arrival-modal-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 400px; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3>Log New Arrival</h3>
                        <button class="icon-btn" onclick="document.getElementById('arrival-modal-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <input type="text" id="arrival-title" class="btn-ghost" style="padding: 12px;" placeholder="Title / Name">
                        <select id="arrival-type" class="btn-ghost" style="padding: 12px;">
                            <option>Book</option>
                            <option>Game</option>
                            <option>Kit</option>
                        </select>
                        <button class="btn-primary" onclick="LibraryView.addArrival()">Add to Collection</button>
                    </div>
                </div>
            </div>
        `);
        lucide.createIcons();
    },

    showAddArrivalModal() {
        document.getElementById('arrival-modal-overlay').style.display = 'flex';
    },

    addArrival() {
        const title = document.getElementById('arrival-title').value;
        const type = document.getElementById('arrival-type').value;
        if (!title) return;

        const data = StorageService.getData();
        const newArrival = { id: Date.now(), title, type, date: new Date().toISOString().split('T')[0] };
        data.arrivals.unshift(newArrival);
        StorageService.saveData(data);

        NotificationSystem.toast(`${title} added to arrivals`, 'success');
        this.render();
        NotificationSystem.triggerUpdateBroadcast('New arrival', title);
    },

    deleteArrival(id) {
        if (confirm("Delete this arrival record?")) {
            StorageService.removeFromCollection('arrivals', id);
            this.render();
        }
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
                            <input type="text" id="username" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="admin" onkeydown="if(event.key === 'Enter') LoginView.handleLogin()">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Password</p>
                            <input type="password" id="password" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="••••••••" onkeydown="if(event.key === 'Enter') LoginView.handleLogin()">
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
                            <input type="text" id="reg-name" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="John Doe" onkeydown="if(event.key === 'Enter') LoginView.handleRegister()">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Username</p>
                            <input type="text" id="reg-username" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="johndoe" onkeydown="if(event.key === 'Enter') LoginView.handleRegister()">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom: 8px;">Password</p>
                            <input type="password" id="reg-password" class="btn-ghost" style="width: 100%; padding: 12px; font-size: 16px;" placeholder="••••••••" onkeydown="if(event.key === 'Enter') LoginView.handleRegister()">
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
                <div class="stat-card" onclick="switchView('admin-interns')">
                    <div class="stat-icon" style="color: var(--accent-amber)"><i data-lucide="graduation-cap"></i></div>
                    <div class="stat-info">
                        <h3>Intern Management</h3>
                        <p class="user-role">View and add interns</p>
                    </div>
                </div>
                <div class="stat-card" onclick="switchView('admin-classes')">
                    <div class="stat-icon" style="color: var(--accent-blue)"><i data-lucide="calendar-clock"></i></div>
                    <div class="stat-info">
                        <h3>Class Schedule</h3>
                        <p class="user-role">Manage weekly timetable</p>
                    </div>
                </div>
                <div class="stat-card" onclick="switchView('admin-users')">
                    <div class="stat-icon"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <h3>System Users</h3>
                        <p class="user-role">Manage admin accounts</p>
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

            <div class="section" id="critical-library-section">
                <h3 style="color: var(--accent-rose); display: flex; align-items: center; gap: 8px;">
                    <i data-lucide="alert-octagon" style="width: 20px; height: 20px;"></i>
                    Critical: Day 14+ Library Returns
                </h3>
                <div class="alerts-list" id="critical-library-list" style="margin-top: 16px;">
                    <!-- Populated by renderCriticalLibrary -->
                </div>
            </div>

            <div class="section">
                <h3>Attendance Summary (Manual Entry)</h3>
                <div class="stat-card" style="margin-top: 16px;">
                    <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <p class="user-role">Filter by Grade:</p>
                        <select id="attendance-grade-filter" class="btn-ghost" style="padding: 6px 12px; cursor: pointer;" onchange="AdminView.renderAttendanceList()">
                            <option value="all">All Grades</option>
                            ${[...new Set(data.students.map(s => s.grade))].sort().map(g => `<option value="${g}">${g}</option>`).join('')}
                        </select>
                        <p class="user-role">Select Class:</p>
                        <select id="attendance-class-select" class="btn-ghost" style="padding: 6px 12px; cursor: pointer;" onchange="AdminView.renderAttendanceList()">
                            <option value="none">-- Regular Day --</option>
                            ${data.classes.map(c => `<option value="${c.id}">${c.title} (${c.dayOfWeek})</option>`).join('')}
                        </select>
                        <p class="user-role" style="margin-left: auto;">Select Date: <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}" class="btn-ghost" style="padding: 4px 8px; font-size: 12px;" onchange="AdminView.renderAttendanceList()"></p>
                    </div>
                    <div class="attendance-setup grid-responsive" style="gap: 20px;">
                        <div class="student-select">
                            <div class="student-presence-list" id="attendance-student-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                                <!-- Populated by renderAttendanceList -->
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

            <div id="absent-notifications" class="section" style="display: none;">
                <h3>Absence Alerts Needed</h3>
                <div class="alerts-list" id="absent-list" style="margin-top: 16px;">
                    <!-- Populated after saving attendance -->
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
        this.renderAttendanceList();
        this.renderCriticalLibrary();
    },

    renderCriticalLibrary() {
        const data = StorageService.getData();
        const container = document.getElementById('critical-library-list');
        const now = new Date();
        
        const criticalItems = data.library.filter(b => {
             const borrowedDate = new Date(b.borrowedDate);
             const diffDays = Math.floor((now - borrowedDate) / (1000 * 60 * 60 * 24));
             return diffDays >= 14;
        });

        if (criticalItems.length === 0) {
            document.getElementById('critical-library-section').style.display = 'none';
            return;
        }

        container.innerHTML = criticalItems.map(item => {
            const student = data.students.find(s => s.id === item.studentId);
            const borrowedDate = new Date(item.borrowedDate);
            const diffDays = Math.floor((now - borrowedDate) / (1000 * 60 * 60 * 24));
            const msg = `Hello ${student.parentName}, a reminder that ${student.name} has had the book "${item.title}" for ${diffDays} days. Please return or swap it at the library tomorrow.`;
            
            return `
                <div class="alert-item critical">
                    <div class="alert-indicator"></div>
                    <div class="alert-content">
                        <p class="alert-msg">${student.name} - Day ${diffDays} reached</p>
                        <p class="user-role">Book: "${item.title}" | Parent: ${student.parentName}</p>
                    </div>
                    <button class="btn-primary" onclick="NotificationSystem.sendDirectMessage('${student.parentPhone}', '${msg}')">Message Parent</button>
                </div>
            `;
        }).join('');
    },

    renderAttendanceList() {
        const dateFilter = document.getElementById('attendance-date')?.value;
        const gradeFilter = document.getElementById('attendance-grade-filter')?.value || 'all';
        const classFilter = document.getElementById('attendance-class-select')?.value || 'none';
        const data = StorageService.getData();
        const container = document.getElementById('attendance-student-list');
        const topicArea = document.getElementById('topics-covered');
        const saveBtn = document.querySelector('button[onclick="AdminView.saveAttendance()"]');
        
        if (!container) return;
        
        // 1. Load Session Topic
        const existingSession = data.sessions?.find(s => s.date === dateFilter && (classFilter === 'none' ? !s.classId : s.classId == classFilter));
        if (topicArea) topicArea.value = existingSession ? existingSession.topic : '';

        // 2. Filter Students
        const selectedClass = classFilter !== 'none' ? data.classes.find(c => c.id == classFilter) : null;
        const targetGrade = selectedClass && selectedClass.grade !== 'all' ? selectedClass.grade : gradeFilter;
        const filteredStudents = targetGrade === 'all' 
            ? data.students 
            : data.students.filter(s => s.grade === targetGrade);

        // 3. Render List with Pre-filled Status
        const relevantRecords = data.attendanceRecords?.filter(r => r.date === dateFilter && (classFilter === 'none' ? !r.classId : r.classId == classFilter)) || [];
        
        if (saveBtn) saveBtn.innerText = relevantRecords.length > 0 ? 'Update & Notify Parents' : 'Save & Notify Parents';

        container.innerHTML = filteredStudents.map(s => {
            const existingRecord = relevantRecords.find(r => r.studentId === s.id);
            const isAbsent = existingRecord && existingRecord.status === 'absent';
            const isPresent = !existingRecord || existingRecord.status === 'present';

            return `
                <label style="display: flex; align-items: center; justify-content: space-between; font-size: 14px; cursor: pointer; padding: 8px; background: var(--glass-bg); border-radius: 8px;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-weight: 500;">${s.name}</span>
                        <span class="user-role" style="font-size: 10px;">${s.grade}</span>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="radio" name="att-${s.id}" value="present" ${isPresent ? 'checked' : ''} style="accent-color: var(--accent-emerald);"> 
                            <span style="color: var(--accent-emerald); font-weight: 600; font-size: 12px;">P</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="radio" name="att-${s.id}" value="absent" ${isAbsent ? 'checked' : ''} style="accent-color: var(--accent-rose);"> 
                            <span style="color: var(--accent-rose); font-weight: 600; font-size: 12px;">A</span>
                        </label>
                    </div>
                </label>
            `;
        }).join('');
    },

    saveAttendance() {
        const date = document.getElementById('attendance-date').value;
        const topics = document.getElementById('topics-covered').value;
        const classId = document.getElementById('attendance-class-select').value;
        const numericClassId = classId !== 'none' ? parseInt(classId) : null;
        const data = StorageService.getData();
        const currentClass = numericClassId ? data.classes.find(c => c.id == numericClassId) : null;
        const className = currentClass ? currentClass.title : 'Regular Class';
        
        const newRecords = [];
        const absentees = [];

        // 1. Gather new data
        data.students.forEach(s => {
            const rad = document.querySelector(`input[name="att-${s.id}"]:checked`);
            if (!rad) return;
            const status = rad.value;
            newRecords.push({ date, studentId: s.id, status, classId: numericClassId });
            if (status === 'absent') {
                absentees.push(s);
            }
        });

        // 2. Upsert Logic: Remove old records for this session set
        data.attendanceRecords = (data.attendanceRecords || []).filter(r => 
            !(r.date === date && r.classId == numericClassId)
        );
        data.attendanceRecords.push(...newRecords);

        // 3. Update Session Log (Topics)
        data.sessions = (data.sessions || []).filter(s => 
            !(s.date === date && s.classId == numericClassId)
        );
        if (topics.trim()) {
            data.sessions.push({ date, classId: numericClassId, topic: topics.trim() });
        }

        StorageService.saveData(data);
        NotificationSystem.toast(`Attendance for ${className} recorded!`, 'success');
        
        // Handle Absence Alerts
        const notifySection = document.getElementById('absent-notifications');
        const listContainer = document.getElementById('absent-list');
        
        if (absentees.length > 0) {
            notifySection.style.display = 'block';
            listContainer.innerHTML = absentees.map(s => {
                const msg = `Hello ${s.parentName}, this is to inform you that ${s.name} was ABSENT for ${className} today (${date}). Topics covered: ${topics || 'Regular session'}. Please contact us if unplanned.`;
                return `
                    <div class="alert-item critical">
                        <div class="alert-indicator"></div>
                        <div class="alert-content">
                            <p class="alert-msg">${s.name} - Marked Absent</p>
                            <p class="user-role">Parent: ${s.parentName} (${s.parentPhone})</p>
                        </div>
                        <button class="btn-primary" onclick="NotificationSystem.sendDirectMessage('${s.parentPhone}', '${msg}')">Notify Parent</button>
                    </div>
                `;
            }).join('');
            notifySection.scrollIntoView({ behavior: 'smooth' });
        } else {
            notifySection.style.display = 'none';
            NotificationSystem.simulateSend('Parents Group', 'WhatsApp', `Daily Update: All present. ${topics}`);
        }

        // Automatic Topic/Update Trigger
        if (topics.trim()) {
            setTimeout(() => {
                if (confirm(`Attendance saved. Would you like to trigger a broadcast for the topics covered today?`)) {
                    NotificationSystem.simulateSend('All Members', 'WhatsApp', 'Topic Update', null, `Today's Learning: ${topics}`);
                }
            }, 500);
        }
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
                            <input type="text" id="new-school" class="btn-ghost" style="padding: 12px;" placeholder="School Name (Optional)">
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
                                        <p class="user-role" style="font-size: 10px;">${s.grade || 'No Grade'} | ${s.isLibraryMember ? 'Library Member' : 'Not Member'}</p>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="icon-btn" onclick="AdminStudentsView.showEditModal(${s.id})" title="Edit Student">
                                            <i data-lucide="edit-3" style="color: var(--accent-blue);"></i>
                                        </button>
                                        <button class="icon-btn" onclick="AdminStudentsView.deleteStudent(${s.id})" title="Delete Student">
                                            <i data-lucide="trash-2" style="color: var(--accent-rose);"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div id="edit-student-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 500px; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3>Edit Student Details</h3>
                        <button class="icon-btn" onclick="document.getElementById('edit-student-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <input type="hidden" id="edit-id">
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 4px;">Student Name</p>
                            <input type="text" id="edit-name" class="btn-ghost" style="width: 100%; padding: 12px;">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 4px;">School Name</p>
                            <input type="text" id="edit-school" class="btn-ghost" style="width: 100%; padding: 12px;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                             <div>
                                <p class="user-role font-xs" style="margin-bottom: 4px;">Grade</p>
                                <select id="edit-grade" class="btn-ghost" style="width: 100%; padding: 12px;">
                                    ${Array.from({length: 12}, (_, i) => `Grade ${i+1}`).map(g => `<option>${g}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 4px;">Parent Phone</p>
                                <input type="tel" id="edit-phone" class="btn-ghost" style="width: 100%; padding: 12px;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 4px;">Library Member</p>
                                <select id="edit-library" class="btn-ghost" style="width: 100%; padding: 12px;" onchange="document.getElementById('edit-plan-div').style.display = this.value === 'true' ? 'block' : 'none'">
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                            <div id="edit-plan-div">
                                <p class="user-role font-xs" style="margin-bottom: 4px;">Subscription Plan</p>
                                <select id="edit-plan" class="btn-ghost" style="width: 100%; padding: 12px;">
                                    <option>Basic</option>
                                    <option>Premium</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 12px;" onclick="AdminStudentsView.updateStudent()">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    showEditModal(id) {
        const data = StorageService.getData();
        const student = data.students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('edit-id').value = student.id;
        document.getElementById('edit-name').value = student.name;
        document.getElementById('edit-school').value = student.schoolName || '';
        document.getElementById('edit-grade').value = student.grade || 'Grade 1';
        document.getElementById('edit-phone').value = student.parentPhone;
        document.getElementById('edit-library').value = student.isLibraryMember ? 'true' : 'false';
        document.getElementById('edit-plan').value = student.subscriptionPlan || 'Basic';
        document.getElementById('edit-plan-div').style.display = student.isLibraryMember ? 'block' : 'none';
        
        document.getElementById('edit-student-overlay').style.display = 'flex';
        lucide.createIcons();
    },

    updateStudent() {
        const id = parseInt(document.getElementById('edit-id').value);
        const name = document.getElementById('edit-name').value;
        const school = document.getElementById('edit-school').value;
        const grade = document.getElementById('edit-grade').value;
        const phone = document.getElementById('edit-phone').value;
        const isLibraryMember = document.getElementById('edit-library').value === 'true';
        const subscriptionPlan = isLibraryMember ? document.getElementById('edit-plan').value : 'None';

        if (!name) {
            NotificationSystem.toast("Name is required", "error");
            return;
        }

        const data = StorageService.getData();
        const index = data.students.findIndex(s => s.id === id);
        if (index !== -1) {
            data.students[index] = { ...data.students[index], name, schoolName: school, grade, parentPhone: phone, isLibraryMember, subscriptionPlan };
            StorageService.saveData(data);
            NotificationSystem.toast(`${name} updated successfully!`, "success");
            this.render();
        }
    },

    deleteStudent(id) {
        if (confirm("Are you sure you want to delete this student and all their records?")) {
            StorageService.removeFromCollection('students', id);
            NotificationSystem.toast("Student removed from system", "success");
            this.render();
        }
    },

    addStudent() {
        const name = document.getElementById('new-name').value.trim();
        const school = document.getElementById('new-school').value.trim();
        const parentName = document.getElementById('new-parent').value.trim();
        const parentEmail = document.getElementById('new-email').value.trim();
        const parentPhone = document.getElementById('new-phone').value.trim();

        if (!name || !parentName || !parentPhone) {
            NotificationSystem.toast("Name, Parent, and Phone are required", "error");
            return;
        }

        const data = StorageService.getData();
        const newId = data.students.length > 0 ? Math.max(...data.students.map(s => s.id)) + 1 : 1;
        
        const newStudent = {
            id: newId,
            name,
            schoolName: school || 'Not Specified',
            parentName,
            parentEmail,
            parentPhone,
            grade: "Grade 1",
            isLibraryMember: false,
            subscriptionPlan: "None"
        };
        data.students.push(newStudent);
        StorageService.saveData(data);

        NotificationSystem.toast(`${name} registered successfully!`, "success");
        switchView('students');
    }
};

const AdminUsersView = {
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
                    <h2>System User Management</h2>
                    <p>Add or modify administrative accounts.</p>
                </div>
            </div>

            <div class="section">
                <div class="grid-responsive" style="gap: 32px;">
                    <div class="stat-card">
                        <h3>Create Admin User</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
                            <input type="text" id="user-display-name" class="btn-ghost" style="padding: 12px;" placeholder="Full Name">
                            <input type="text" id="user-username" class="btn-ghost" style="padding: 12px;" placeholder="Username">
                            <input type="password" id="user-password" class="btn-ghost" style="padding: 12px;" placeholder="Password">
                            <button class="btn-primary" onclick="AdminUsersView.addUser()">Add User</button>
                        </div>
                    </div>

                    <div class="stat-card">
                        <h3>Existing Admins</h3>
                        <div class="alerts-list" style="margin-top: 24px;">
                            ${data.users.map(u => `
                                <div class="alert-item" style="padding: 12px; gap: 12px;">
                                    <div class="alert-content">
                                        <p class="alert-msg" style="font-size: 14px;">${u.name}</p>
                                        <p class="user-role" style="font-size: 10px;">@${u.username} | ${u.role.toUpperCase()}</p>
                                    </div>
                                    <button class="icon-btn" onclick="AdminUsersView.deleteUser('${u.id}')" ${u.id === 'admin' ? 'disabled' : ''} title="Delete User">
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

    addUser() {
        const name = document.getElementById('user-display-name').value;
        const username = document.getElementById('user-username').value;
        const password = document.getElementById('user-password').value;

        if (!name || !username || !password) {
            NotificationSystem.toast("All fields required", "error");
            return;
        }

        const data = StorageService.getData();
        if (data.users.find(u => u.username === username)) {
            NotificationSystem.toast("Username already exists", "error");
            return;
        }

        const newUser = { id: Date.now().toString(), name, username, password, role: 'admin' };
        data.users.push(newUser);
        StorageService.saveData(data);

        NotificationSystem.toast(`Admin "${name}" added!`, "success");
        this.render();
    },

    deleteUser(id) {
        if (id === 'admin') return;
        if (confirm("Delete this admin account?")) {
            StorageService.removeFromCollection('users', id);
            NotificationSystem.toast("User removed", "success");
            this.render();
        }
    }
};

const FeesView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');

        const studentSummaries = data.students.map(s => {
            const studentFees = data.fees.filter(f => f.studentId === s.id);
            const totalDue  = studentFees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
            const totalPaid = studentFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
            const hasUnpaid  = studentFees.some(f => f.status === 'unpaid');
            const hasPending = studentFees.some(f => f.status === 'pending');
            const statusColor = hasUnpaid ? 'var(--accent-rose)' : hasPending ? 'var(--accent-amber)' : 'var(--accent-emerald)';
            const statusLabel = hasUnpaid ? 'Unpaid' : hasPending ? 'Pending' : totalPaid > 0 ? 'Cleared' : 'No Records';
            return { student: s, studentFees, totalDue, totalPaid, statusColor, statusLabel };
        });

        // Global function for bill generation
        window.generateBill = (id) => {
            const data = StorageService.getData();
            const student = data.students.find(s => s.id === id);
            const unpaidFees = data.fees.filter(f => f.studentId === id && f.status !== 'paid');
            const total = unpaidFees.reduce((sum, f) => sum + f.amount, 0);
            
            if (unpaidFees.length === 0) {
                NotificationSystem.toast("No outstanding fees for this student", "info");
                return;
            }

            const billHtml = `
                <div class="payment-overlay" id="bill-overlay" style="display: flex; align-items: center; justify-content: center;">
                    <div class="stat-card" style="width: 100%; max-width: 400px; padding: 40px; background: white; color: #1a1a1a;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: #1a1a1a; margin-bottom: 8px;">Book Buddy</h2>
                            <p style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Fee Invoice / Bill</p>
                        </div>
                        <div style="margin-bottom: 24px; font-size: 14px;">
                            <p><strong>Student:</strong> ${student.name}</p>
                            <p><strong>Grade:</strong> ${student.grade}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 16px 0; margin-bottom: 24px;">
                            ${unpaidFees.map(f => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>${f.month} Fee</span>
                                    <span>₹${f.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; margin-bottom: 32px;">
                            <span>Total Due</span>
                            <span>₹${total.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn-primary" style="flex: 1; background: #1a1a1a;" onclick="window.print()">Print Bill</button>
                            <button class="btn-ghost" style="flex: 1;" onclick="document.getElementById('bill-overlay').remove()">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', billHtml);
        };

        const totalOutstanding = data.fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
        const totalCollected   = data.fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
        const studentsWithDues = studentSummaries.filter(s => s.totalDue > 0).length;

        // Build fee rows per student
        const buildFeeRows = (studentFees, student) => studentFees.map(f => {
            const statusBadge = f.status === 'paid' ? 'badge-emerald' : f.status === 'unpaid' ? 'badge-rose' : 'badge-amber';
            let actions = '';
            if (f.status !== 'paid') {
                const safeName  = student.name.replace(/'/g, "\\'");
                const safeMonth = f.month.replace(/'/g, "\\'");
                actions += `<button class="btn-primary" style="padding:6px 14px;font-size:12px;" onclick="PaymentModal.show(${f.id},'${safeName}','${safeMonth}',${f.amount})"><i data-lucide="credit-card" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:3px;"></i>Pay Now</button>`;
                if (isAdmin) {
                    actions += `<button class="btn-ghost" style="padding:6px 14px;font-size:12px;" onclick="FeesView.markPaid(${f.id})"><i data-lucide="check" style="width:11px;height:11px;display:inline-block;vertical-align:middle;margin-right:3px;"></i>Mark Paid</button>`;
                    actions += `<button class="icon-btn" style="width:32px;height:32px;" onclick="FeesView.deleteItem(${f.id})" title="Delete"><i data-lucide="trash-2" style="color:var(--accent-rose);width:14px;height:14px;"></i></button>`;
                }
            }
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-primary);border-radius:var(--radius-sm);flex-wrap:wrap;gap:8px;">
                        <div>
                            <span style="font-weight:600;font-size:14px;">${f.month}</span>
                            <span style="color:var(--text-secondary);font-size:12px;margin-left:8px;">Due: ${f.dueDate}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                            <span style="font-weight:700;font-size:15px;">&#8377;${f.amount.toLocaleString()}</span>
                            <span class="badge ${statusBadge}">${f.status}</span>
                            ${actions}
                        </div>
                    </div>`;
        }).join('');

        const buildStudentCard = ({ student, studentFees, totalDue, totalPaid: paid, statusColor, statusLabel }) => {
            const safeParent = student.parentName ? student.parentName.replace(/'/g, "\\'") : '';
            const reminderBtn = isAdmin && totalDue > 0
                ? (() => {
                    const studentFees = data.fees.filter(f => f.studentId === student.id && f.status !== 'paid');
                    const feeDetails = studentFees.map(f => `${f.month} (₹${f.amount})`).join(', ');
                    const msg = `Hello ${student.parentName}, a reminder for ${student.name}'s fee of ₹${totalDue.toLocaleString()} for ${feeDetails}. Please clear it soon.`;
                    return `<button class="btn-ghost" style="font-size:12px;padding:8px 14px;" onclick="NotificationSystem.sendDirectMessage('${student.parentPhone}', '${msg}')"><i data-lucide="send" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i>Send Reminder</button>`;
                })()
                : '';
            const dueText  = totalDue > 0 ? `&nbsp;&middot;&nbsp;<strong style="color:var(--accent-rose);">&#8377;${totalDue.toLocaleString()} due</strong>` : '';
            const paidText = paid > 0 ? `&nbsp;&middot;&nbsp;<span style="color:var(--accent-emerald);">&#8377;${paid.toLocaleString()} paid</span>` : '';
            const feeRows  = buildFeeRows(studentFees, student);
            const feeBody  = feeRows
                ? `<div style="display:flex;flex-direction:column;gap:8px;padding-top:12px;border-top:1px solid var(--border-color);">${feeRows}</div>`
                : `<p class="user-role" style="font-size:13px;padding-top:12px;border-top:1px solid var(--border-color);">No fee records yet.</p>`;
            return `<div class="stat-card" style="padding:20px 24px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;${studentFees.length > 0 ? 'margin-bottom:16px;' : ''}">
                            <div style="display:flex;align-items:center;gap:14px;">
                                <div class="user-avatar" style="width:46px;height:46px;font-size:20px;font-weight:700;flex-shrink:0;background:var(--accent-blue);">${student.name.charAt(0)}</div>
                                <div>
                                    <p style="font-weight:600;font-size:15px;margin-bottom:4px;">${student.name}</p>
                                    <p class="user-role" style="font-size:12px;display:flex;align-items:center;gap:6px;">
                                        <span style="width:8px;height:8px;border-radius:50%;background:${statusColor};display:inline-block;flex-shrink:0;"></span>
                                        ${statusLabel}${dueText}${paidText}
                                    </p>
                                </div>
                            </div>
                            ${reminderBtn}
                            ${isAdmin && totalDue > 0 ? `<button class="icon-btn" onclick="generateBill(${student.id})" title="Generate Bill"><i data-lucide="file-text"></i></button>` : ''}
                        </div>
                        ${feeBody}
                    </div>`;
        };

        const adminAddForm = isAdmin ? `
            <div class="section">
                <h3 style="margin-bottom:16px;font-weight:600;">Add Fee Record</h3>
                <div class="stat-card">
                    <div class="grid-responsive" style="gap:16px;">
                        <div>
                            <p class="user-role font-sm" style="margin-bottom:8px;">Student</p>
                            <select id="fee-student" class="btn-ghost" style="width:100%;padding:12px;font-size:14px;cursor:pointer;">
                                <option value="">Select Student...</option>
                                ${data.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom:8px;">Month</p>
                            <input type="text" id="fee-month" class="btn-ghost" style="width:100%;padding:12px;" placeholder="e.g. May 2026" value="${new Date().toLocaleString('default',{month:'long'})} ${new Date().getFullYear()}">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom:8px;">Amount (&#8377;)</p>
                            <input type="number" id="fee-amount" class="btn-ghost" style="width:100%;padding:12px;" placeholder="1500" value="1500">
                        </div>
                        <div>
                            <p class="user-role font-sm" style="margin-bottom:8px;">Due Date</p>
                            <input type="date" id="fee-due" class="btn-ghost" style="width:100%;padding:12px;" value="${new Date(Date.now()+15*24*60*60*1000).toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top:16px;" onclick="FeesView.addFee()"><i data-lucide="plus" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;"></i>Add Fee Record</button>
                </div>
            </div>` : '';

        container.innerHTML = `
            <div class="view-header">
                <h2>Fee Management</h2>
                <p>Track and manage fee payments for all students.</p>
            </div>
            <div class="dashboard-grid" style="margin-bottom:32px;">
                <div class="stat-card">
                    <div class="stat-icon" style="background:rgba(244,63,94,0.1);color:var(--accent-rose);"><i data-lucide="alert-circle"></i></div>
                    <div class="stat-info"><h3>Total Outstanding</h3><p class="value" style="color:var(--accent-rose);">&#8377;${totalOutstanding.toLocaleString()}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:rgba(16,185,129,0.1);color:var(--accent-emerald);"><i data-lucide="check-circle"></i></div>
                    <div class="stat-info"><h3>Total Collected</h3><p class="value" style="color:var(--accent-emerald);">&#8377;${totalCollected.toLocaleString()}</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i data-lucide="users"></i></div>
                    <div class="stat-info"><h3>Students with Dues</h3><p class="value">${studentsWithDues}</p></div>
                </div>
            </div>
            ${adminAddForm}
            <div class="section">
                <h3 style="margin-bottom:16px;font-weight:600;">Student-wise Fee Status</h3>
                <div style="display:flex;flex-direction:column;gap:16px;">
                    ${studentSummaries.map(s => buildStudentCard(s)).join('')}
                </div>
            </div>`;
        lucide.createIcons();
    },

    addFee() {
        const studentId = parseInt(document.getElementById('fee-student').value);
        const month  = document.getElementById('fee-month').value.trim();
        const amount = parseInt(document.getElementById('fee-amount').value);
        const dueDate = document.getElementById('fee-due').value;
        if (!studentId || !month || !amount || !dueDate) { NotificationSystem.toast('Please fill all fields', 'error'); return; }
        const data = StorageService.getData();
        const newId = data.fees.length > 0 ? Math.max(...data.fees.map(f => f.id)) + 1 : 301;
        data.fees.push({ id: newId, studentId, month, amount, dueDate, status: 'unpaid' });
        StorageService.saveData(data);
        NotificationSystem.toast('Fee record added successfully!', 'success');
        this.render();
    },

    markPaid(id) {
        const data = StorageService.getData();
        const fee = data.fees.find(f => f.id === id);
        if (fee) { fee.status = 'paid'; StorageService.saveData(data); NotificationSystem.toast('Payment marked as received!', 'success'); this.render(); }
    },

    deleteItem(id) {
        if (confirm("Delete this fee record?")) {
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
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <button class="btn-primary" style="padding: 10px 20px; font-size: 13px;" onclick="NotificationSystem.toast('Launching ${w.title}...', 'info')">
                                    <i data-lucide="play" style="width: 14px; height: 14px; margin-right: 8px;"></i> Start Worksheet
                                </button>
                                ${isAdmin ? `
                                    <button class="icon-btn" onclick="WorksheetsView.deleteItem(${w.id})" title="Delete Worksheet"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-ghost" onclick="NotificationSystem.triggerUpdateBroadcast('Worksheet', '${w.title}')">Announce</button>
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
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <button class="btn-ghost" style="padding: 10px 20px; font-size: 13px;" onclick="window.open('${n.url}', '_blank')">
                                    <i data-lucide="external-link" style="width: 14px; height: 14px; margin-right: 8px;"></i> Read Newspaper
                                </button>
                                ${isAdmin ? `
                                    <button class="icon-btn" onclick="NewspapersView.deleteItem(${n.id})" title="Delete Newspaper"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-primary" onclick="NotificationSystem.triggerUpdateBroadcast('Newspaper', '${n.title}')">Dispatch to Group</button>
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
                                    : `<p class="user-role" style="font-size: 12px; margin-bottom: 6px;">Student ID: #TS3-${s.id.toString().padStart(3,'0')}</p>
                                       <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 10px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--border-color); width: fit-content; padding: 4px 8px;">
                                            <i data-lucide="lock" style="width:10px;height:10px;"></i> Profile: Admin Only
                                       </span>`
                                }
                            </div>
                            ${isAdmin
                                ? `<button class="btn-ghost" onclick="switchView('profile', ${s.id})">View Profile</button>`
                                : ``
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
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                                <div>
                                    <p class="user-role font-xs">Grade</p>
                                    <p style="font-weight: 600;">${student.grade || 'N/A'}</p>
                                </div>
                                <div>
                                    <p class="user-role font-xs">Library</p>
                                    <p style="font-weight: 600; color: ${student.isLibraryMember ? 'var(--accent-emerald)' : 'var(--text-secondary)'}">
                                        ${student.isLibraryMember ? student.subscriptionPlan : 'No'}
                                    </p>
                                </div>
                            </div>
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
                            ${AuthService.isAdmin() ? (() => {
                                const marksStr = grades.length > 0 
                                    ? grades.map(g => `${g.subject}: ${g.score}/${g.max}`).join(', ')
                                    : 'records pending';
                                const msg = `Hello ${student.parentName}, your daughter ${student.name} scored: ${marksStr}. Overall Attendance: ${attendanceRate}%`;
                                return `
                                    <button class="btn-primary" onclick="NotificationSystem.sendDirectMessage('${student.parentPhone}', '${msg}')">Message Marks</button>
                                    <button class="btn-ghost" onclick="NotificationSystem.initiateCall('${student.parentPhone}')">Call Parent</button>
                                `;
                            })() : `
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

const PaymentModal = {
    show(feeId, studentName, month, amount) {
        // Remove any existing modal
        const existing = document.getElementById('payment-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'payment-overlay';
        overlay.className = 'payment-overlay';
        overlay.innerHTML = `
            <div class="payment-modal" id="payment-modal">
                <div class="payment-header">
                    <h3>Pay Fees</h3>
                    <button class="close-btn" onclick="PaymentModal.close()">&times;</button>
                </div>
                <div class="payment-amount-display">
                    <p class="student-name-lbl">${studentName}</p>
                    <p class="amount-big">&#8377;${amount.toLocaleString()}</p>
                    <p class="month-lbl">${month}</p>
                </div>
                <div class="payment-body">
                    <div class="payment-methods">
                        <button class="pay-method-btn active" id="pm-upi" onclick="PaymentModal.setMethod('upi')">
                            <span class="pay-method-icon">&#128242;</span>UPI
                        </button>
                        <button class="pay-method-btn" id="pm-card" onclick="PaymentModal.setMethod('card')">
                            <span class="pay-method-icon">&#128179;</span>Card
                        </button>
                        <button class="pay-method-btn" id="pm-net" onclick="PaymentModal.setMethod('net')">
                            <span class="pay-method-icon">&#127968;</span>Net Banking
                        </button>
                    </div>
                    <div id="pay-form-area">
                        ${PaymentModal.getUpiForm()}
                    </div>
                    <button class="pay-now-btn" id="pay-now-btn" onclick="PaymentModal.processPayment(${feeId}, '${studentName}', '${month}', ${amount})">
                        Pay &#8377;${amount.toLocaleString()}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) PaymentModal.close(); });
    },

    currentMethod: 'upi',

    setMethod(method) {
        PaymentModal.currentMethod = method;
        ['upi','card','net'].forEach(m => {
            const btn = document.getElementById('pm-' + m);
            if (btn) btn.classList.toggle('active', m === method);
        });
        const area = document.getElementById('pay-form-area');
        if (!area) return;
        if (method === 'upi')  area.innerHTML = PaymentModal.getUpiForm();
        if (method === 'card') area.innerHTML = PaymentModal.getCardForm();
        if (method === 'net')  area.innerHTML = PaymentModal.getNetForm();
    },

    getUpiForm() {
        return `<div class="pay-input-group" style="margin-bottom: 20px;">
            <div>
                <label>UPI ID</label>
                <input type="text" id="upi-id" placeholder="example@upi" autocomplete="off">
            </div>
        </div>`;
    },

    getCardForm() {
        return `<div class="pay-input-group" style="margin-bottom: 20px;">
            <div>
                <label>Card Number</label>
                <input type="text" id="card-num" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="off">
            </div>
            <div style="display:flex;gap:12px;">
                <div style="flex:1;"><label>Expiry</label><input type="text" id="card-exp" placeholder="MM/YY" maxlength="5"></div>
                <div style="flex:1;"><label>CVV</label><input type="password" id="card-cvv" placeholder="&#9679;&#9679;&#9679;" maxlength="3"></div>
            </div>
            <div>
                <label>Cardholder Name</label>
                <input type="text" id="card-name" placeholder="Name on card">
            </div>
        </div>`;
    },

    getNetForm() {
        return `<div class="pay-input-group" style="margin-bottom: 20px;">
            <div>
                <label>Select Bank</label>
                <select id="net-bank">
                    <option value="">-- Choose Bank --</option>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Bank of Baroda</option>
                    <option>Punjab National Bank</option>
                    <option>Canara Bank</option>
                </select>
            </div>
        </div>`;
    },

    processPayment(feeId, studentName, month, amount) {
        const btn = document.getElementById('pay-now-btn');
        const formArea = document.getElementById('pay-form-area');
        if (!btn || !formArea) return;

        // Basic validation
        if (PaymentModal.currentMethod === 'upi') {
            const val = (document.getElementById('upi-id') || {}).value || '';
            if (!val.includes('@')) { NotificationSystem.toast('Please enter a valid UPI ID', 'error'); return; }
        } else if (PaymentModal.currentMethod === 'card') {
            const num = (document.getElementById('card-num') || {}).value || '';
            if (num.replace(/\s/g,'').length < 12) { NotificationSystem.toast('Please enter a valid card number', 'error'); return; }
        } else if (PaymentModal.currentMethod === 'net') {
            const bank = (document.getElementById('net-bank') || {}).value || '';
            if (!bank) { NotificationSystem.toast('Please select a bank', 'error'); return; }
        }

        // Processing animation
        btn.disabled = true;
        btn.textContent = 'Processing...';
        formArea.innerHTML = `<div style="text-align:center;padding:24px 0;color:var(--text-secondary);">
            <div style="width:40px;height:40px;border:3px solid var(--border-color);border-top-color:var(--accent-blue);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
            <p>Securely processing your payment...</p>
        </div>`;

        setTimeout(() => {
            // Mark as paid in storage
            const data = StorageService.getData();
            const fee = data.fees.find(f => f.id === feeId);
            if (fee) { fee.status = 'paid'; StorageService.saveData(data); }

            // Show success
            const modal = document.getElementById('payment-modal');
            if (!modal) return;
            const txnId = 'TXN' + Date.now().toString().slice(-8).toUpperCase();
            const now = new Date().toLocaleString('en-IN');
            modal.innerHTML = `
                <div class="payment-success">
                    <div class="success-checkmark"><i data-lucide="check-circle" style="width:36px;height:36px;color:var(--accent-emerald);"></i></div>
                    <h3>Payment Successful!</h3>
                    <p>Fee paid for <strong>${studentName}</strong></p>
                    <div class="receipt-card">
                        <p style="font-weight:700;font-size:13px;margin-bottom:10px;color:var(--text-secondary);">RECEIPT</p>
                        <div class="receipt-row"><span>Month</span><span>${month}</span></div>
                        <div class="receipt-row"><span>Amount Paid</span><span style="color:var(--accent-emerald);">&#8377;${amount.toLocaleString()}</span></div>
                        <div class="receipt-row"><span>Method</span><span>${PaymentModal.currentMethod.toUpperCase()}</span></div>
                        <hr class="receipt-divider">
                        <div class="receipt-row"><span>Transaction ID</span><span style="font-size:11px;">${txnId}</span></div>
                        <div class="receipt-row"><span>Date & Time</span><span style="font-size:11px;">${now}</span></div>
                    </div>
                    <button class="pay-now-btn" style="margin-top:20px;background:linear-gradient(135deg,var(--accent-emerald),#059669);" onclick="PaymentModal.close(); FeesView.render();">Close</button>
                </div>
            `;
            lucide.createIcons();
        }, 2200);
    },

    close() {
        const el = document.getElementById('payment-overlay');
        if (el) el.remove();
    }
};

window.PaymentModal = PaymentModal;
window.LibraryView = LibraryView;
window.LoginView = LoginView;
window.AdminView = AdminView;
window.AdminStudentsView = AdminStudentsView;
window.AdminUsersView = AdminUsersView;
window.FeesView = FeesView;
window.WorksheetsView = WorksheetsView;
window.NewspapersView = NewspapersView;
window.StudentsView = StudentsView;
window.ProfileView = ProfileView;
window.BlueprintView = BlueprintView;
window.PerformanceView = PerformanceView;

const EventsView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header">
                <h2>Campus Events</h2>
                <p>Stay updated with the latest happenings at Book Buddy.</p>
            </div>
            
            <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3>Upcoming Events</h3>
                    ${isAdmin ? `<button class="btn-primary" onclick="EventsView.showAddModal()"><i data-lucide="plus"></i> Add Event</button>` : ''}
                </div>
                <div class="alerts-list">
                    ${data.events.map(e => `
                        <div class="alert-item">
                            <div class="alert-indicator" style="background: var(--accent-amber)"></div>
                            <div class="alert-content">
                                <p class="alert-msg" style="font-size: 16px;">${e.title}</p>
                                <p class="user-role">${e.date} at ${e.time} | ${e.location}</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                ${isAdmin ? `
                                    <button class="icon-btn" onclick="EventsView.deleteEvent(${e.id})"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                    <button class="btn-ghost" onclick="NotificationSystem.triggerUpdateBroadcast('Event', '${e.title}')">Broadcast</button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="event-modal-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 550px; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3>Schedule New Event</h3>
                        <button class="icon-btn" onclick="document.getElementById('event-modal-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom:4px;">Event Title</p>
                            <input type="text" id="ev-title" class="btn-ghost" style="width:100%; padding: 12px;" placeholder="e.g. Annual Day 2026">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom:4px;">Date</p>
                                <input type="date" id="ev-date" class="btn-ghost" style="width:100%; padding: 12px;">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom:4px;">Time</p>
                                <input type="time" id="ev-time" class="btn-ghost" style="width:100%; padding: 12px;">
                            </div>
                        </div>
                         <div>
                            <p class="user-role font-xs" style="margin-bottom:4px;">Location</p>
                            <input type="text" id="ev-loc" class="btn-ghost" style="width:100%; padding: 12px;" placeholder="e.g. Main Auditorium">
                        </div>
                        <button class="btn-primary" style="margin-top: 12px;" onclick="EventsView.addEvent()">Create & Notify Members</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    showAddModal() {
        document.getElementById('event-modal-overlay').style.display = 'flex';
        lucide.createIcons();
    },

    addEvent() {
        const title = document.getElementById('ev-title').value.trim();
        const date = document.getElementById('ev-date').value;
        const time = document.getElementById('ev-time').value;
        const location = document.getElementById('ev-loc').value.trim();

        if (!title || !date || !time) {
            NotificationSystem.toast("Please fill title, date, and time", "error");
            return;
        }

        const data = StorageService.getData();
        const newId = data.events.length > 0 ? Math.max(...data.events.map(e => e.id)) + 1 : 601;
        const newEvent = { id: newId, title, date, time, location: location || 'TBD' };
        data.events.unshift(newEvent);
        StorageService.saveData(data);

        NotificationSystem.toast(`Event "${title}" scheduled!`, "success");
        this.render();
        NotificationSystem.triggerUpdateBroadcast('Event', title);
    },

    deleteEvent(id) {
        if (confirm("Delete this event?")) {
            StorageService.removeFromCollection('events', id);
            NotificationSystem.toast("Event removed", "success");
            this.render();
        }
    }
};

window.EventsView = EventsView;

const AdminInternsView = {
    render() {
        const data = StorageService.getData() || { interns: [] };
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header" style="display: flex; align-items: center; gap: 20px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2>Intern Management</h2>
                    <p>Track college interns and their parent contacts.</p>
                </div>
            </div>

            <div class="section">
                <div class="grid-responsive" style="gap: 32px;">
                    <div class="stat-card">
                        <h3>Onboard New Intern</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
                            <input type="text" id="int-name" class="btn-ghost" style="padding: 12px;" placeholder="Full Name">
                            <input type="text" id="int-college" class="btn-ghost" style="padding: 12px;" placeholder="College Name">
                            <input type="email" id="int-email" class="btn-ghost" style="padding: 12px;" placeholder="Intern Email">
                            <input type="tel" id="int-phone" class="btn-ghost" style="padding: 12px;" placeholder="Intern Phone">
                            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 8px 0;">
                            <p class="user-role font-xs">Emergency / Parent Contact</p>
                            <input type="text" id="int-p-name" class="btn-ghost" style="padding: 12px;" placeholder="Parent Name">
                            <input type="tel" id="int-p-phone" class="btn-ghost" style="padding: 12px;" placeholder="Parent Phone">
                            <button class="btn-primary" onclick="AdminInternsView.addIntern()">Add Intern</button>
                        </div>
                    </div>

                    <div class="stat-card">
                        <h3>Current Interns</h3>
                        <div class="alerts-list" style="margin-top: 24px; max-height: 500px; overflow-y: auto;">
                            ${data.interns.map(i => `
                                <div class="alert-item">
                                    <div class="alert-indicator" style="background: var(--accent-emerald)"></div>
                                    <div class="alert-content">
                                        <p class="alert-msg">${i.name}</p>
                                        <p class="user-role">${i.collegeName} • ${i.phone}</p>
                                        <p class="user-role font-xs" style="margin-top: 4px;">Parent: ${i.parentName} (${i.parentPhone})</p>
                                    </div>
                                    <button class="icon-btn" onclick="AdminInternsView.deleteIntern(${i.id})">
                                        <i data-lucide="trash-2" style="color: var(--accent-rose);"></i>
                                    </button>
                                </div>
                            `).join('') || '<p class="empty-msg">No interns registered.</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    addIntern() {
        const name = document.getElementById('int-name').value.trim();
        const college = document.getElementById('int-college').value.trim();
        const phone = document.getElementById('int-phone').value.trim();
        const pName = document.getElementById('int-p-name').value.trim();
        const pPhone = document.getElementById('int-p-phone').value.trim();

        if (!name || !college || !phone) {
            NotificationSystem.toast("Basic info required", "error");
            return;
        }

        const data = StorageService.getData();
        const newId = data.interns.length > 0 ? Math.max(...data.interns.map(i => i.id)) + 1 : 801;
        const newIntern = { id: newId, name, collegeName: college, phone, parentName: pName, parentPhone: pPhone, email: document.getElementById('int-email').value };
        
        data.interns.unshift(newIntern);
        StorageService.saveData(data);
        NotificationSystem.toast("Intern registered!", "success");
        this.render();
    },

    deleteIntern(id) {
        if (confirm("Remove this intern?")) {
            StorageService.removeFromCollection('interns', id);
            this.render();
        }
    }
};

const AdminClassesView = {
    render() {
        const data = StorageService.getData();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header" style="display: flex; align-items: center; gap: 20px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2>Class Schedule</h2>
                    <p>Manage the weekly timetable for all subjects.</p>
                </div>
            </div>

            <div class="section">
                <div class="grid-responsive" style="gap: 32px;">
                    <div class="stat-card">
                        <h3>Add Weekly Slot</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 24px;">
                            <input type="text" id="cls-title" class="btn-ghost" style="padding: 12px;" placeholder="Subject (e.g. English)">
                            <select id="cls-day" class="btn-ghost" style="padding: 12px;">
                                <option>Monday</option>
                                <option>Tuesday</option>
                                <option>Wednesday</option>
                                <option>Thursday</option>
                                <option>Friday</option>
                                <option>Saturday</option>
                            </select>
                            <input type="time" id="cls-time" class="btn-ghost" style="padding: 12px;">
                            <button class="btn-primary" onclick="AdminClassesView.addClass()">Save Schedule Slot</button>
                        </div>
                    </div>

                    <div class="stat-card">
                        <h3>Upcoming Timetable</h3>
                        <div class="alerts-list" style="margin-top: 24px;">
                            ${data.classes.map(c => `
                                <div class="alert-item">
                                    <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                                    <div class="alert-content">
                                        <p class="alert-msg">${c.title}</p>
                                        <p class="user-role">${c.dayOfWeek} at ${c.time}</p>
                                    </div>
                                    <button class="icon-btn" onclick="AdminClassesView.deleteClass(${c.id})">
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

    addClass() {
        const title = document.getElementById('cls-title').value.trim();
        const day = document.getElementById('cls-day').value;
        const time = document.getElementById('cls-time').value;

        if (!title || !time) return;

        const data = StorageService.getData();
        const newId = data.classes.length > 0 ? Math.max(...data.classes.map(c => c.id)) + 1 : 101;
        const newClass = { id: newId, title, dayOfWeek: day, time, grade: "all", status: "upcoming" };
        
        data.classes.unshift(newClass);
        StorageService.saveData(data);
        NotificationSystem.toast("Schedule updated!", "success");
        this.render();
        NotificationSystem.triggerUpdateBroadcast('Class Schedule', `${title} on ${day}s`);
    },

    deleteClass(id) {
        if (confirm("Remove this schedule slot?")) {
            StorageService.removeFromCollection('classes', id);
            this.render();
        }
    }
};

window.EventsView = EventsView;
window.AdminInternsView = AdminInternsView;
window.AdminClassesView = AdminClassesView;
