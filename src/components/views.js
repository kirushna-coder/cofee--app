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
            <div class="view-header slide-up">
                <h2>Library Management</h2>
                <p>Manage book returns, extensions, and swaps with real-time tracking.</p>
            </div>
            <div class="section slide-up" style="animation-delay: 0.1s;">
                <div class="alerts-list">
                    ${data.library.map(book => `
                        <div class="alert-item premium">
                            <div class="alert-indicator" style="background: ${new Date(book.dueDate) < new Date() ? 'var(--accent-rose)' : 'var(--accent-emerald)'}"></div>
                            <div class="alert-icon-circle"><i data-lucide="book-open"></i></div>
                            <div class="alert-content">
                                <p class="alert-msg">"${book.title}"</p>
                                <p class="user-role">Student: ${this.getStudentName(book.studentId)} | Due: ${book.dueDate}</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                ${isAdmin ? (() => {
                                    const s = data.students.find(st => st.id === book.studentId);
                                    const phone = s ? s.parentPhone : '';
                                    const sName = s ? s.name : `Student ${book.studentId}`;
                                    return `
                                        <button class="btn-ghost btn-sm" onclick="NotificationSystem.toast('Return recorded', 'success')">Return</button>
                                        <button class="btn-ghost btn-sm" onclick="NotificationSystem.simulateSend('${sName}', 'WhatsApp', 'Book Renewal', '${phone}', 'I would like to RENEW the book: ${book.title}')">Renew</button>
                                        <button class="btn-primary btn-sm" onclick="NotificationSystem.simulateSend('${sName}', 'WhatsApp', 'Return Reminder', '${phone}')">Remind</button>
                                        <button class="icon-btn btn-sm" onclick="LibraryView.deleteItem(${book.id})" title="Delete Book"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
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
            <div class="section slide-up" style="margin-top: 48px; animation-delay: 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 700;">New Arrivals Hub</h3>
                    ${isAdmin ? `
                        <button class="btn-primary" onclick="LibraryView.showAddArrivalModal()">
                            <i data-lucide="plus-circle" style="width: 14px; height: 14px; margin-right: 8px;"></i> Log New Arrival
                        </button>
                    ` : ''}
                </div>
                <div class="alerts-list">
                    ${data.arrivals.map(a => `
                        <div class="alert-item premium">
                            <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                            <div class="alert-icon-circle"><i data-lucide="package"></i></div>
                            <div class="alert-content">
                                <p class="alert-msg">${a.title}</p>
                                <p class="user-role">${a.type} | Added: ${a.date}</p>
                            </div>
                            ${isAdmin ? `
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-ghost btn-sm" onclick="NotificationSystem.triggerUpdateBroadcast('New arrival', '${a.title}')">Announce</button>
                                    <button class="icon-btn btn-sm" onclick="LibraryView.deleteArrival(${a.id})"><i data-lucide="trash-2" style="color: var(--accent-rose);"></i></button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div id="arrival-modal-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 400px; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3 style="font-weight: 700;">Log New Arrival</h3>
                        <button class="icon-btn" onclick="document.getElementById('arrival-modal-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px;">Title / Item Name</p>
                            <input type="text" id="arrival-title" class="btn-ghost" style="width: 100%; padding: 12px;" placeholder="e.g. Encyclopedia of Science">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px;">Category</p>
                            <select id="arrival-type" class="btn-ghost" style="width: 100%; padding: 12px; cursor: pointer;">
                                <option>Book</option>
                                <option>Game</option>
                                <option>Kit</option>
                            </select>
                        </div>
                        <button class="btn-primary" style="padding: 14px;" onclick="LibraryView.addArrival()">Add to Collection</button>
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
                <div class="login-card stat-card fade-in">
                    <div class="logo-section" style="margin-bottom: 32px; justify-content: center;">
                        <div class="logo-icon">📚</div>
                        <h1 style="font-size: 28px;">Book<span>Buddy</span></h1>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Welcome Back</h2>
                    <p class="user-role" style="margin-bottom: 32px; font-size: 15px;">Please sign in to access the management portal.</p>
                    
                    <div id="login-error" class="badge badge-rose" style="display: none; width: 100%; margin-bottom: 24px; text-transform: none; padding: 10px;"></div>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Username</p>
                            <input type="text" id="username" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 16px; background: var(--bg-primary);" placeholder="admin" onkeydown="if(event.key === 'Enter') LoginView.handleLogin()">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Password</p>
                            <input type="password" id="password" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 16px; background: var(--bg-primary);" placeholder="••••••••" onkeydown="if(event.key === 'Enter') LoginView.handleLogin()">
                        </div>
                        <button class="btn-primary" style="margin-top: 12px; padding: 16px; font-size: 16px; font-weight: 700;" onclick="LoginView.handleLogin()">Sign In to Dashboard</button>
                        <p style="text-align: center; font-size: 14px; margin-top: 16px; color: var(--text-secondary);">Don't have an account? <a href="#" onclick="LoginView.showRegisterForm()" style="color: var(--accent-blue); font-weight: 700;">Create one</a></p>

                    </div>
                </div>
            </div>
        `;
    },

    showRegisterForm() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="login-wrapper">
                <div class="login-card stat-card fade-in">
                    <div class="logo-section" style="margin-bottom: 32px; justify-content: center;">
                        <div class="logo-icon">📚</div>
                        <h1 style="font-size: 28px;">Book<span>Buddy</span></h1>
                    </div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">Create Account</h2>
                    <p class="user-role" style="margin-bottom: 32px; font-size: 15px;">Sign up for school management access.</p>
                    
                    <div id="register-error" class="badge badge-rose" style="display: none; width: 100%; margin-bottom: 24px; text-transform: none; padding: 10px;"></div>
                    
                    <div style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Full Name</p>
                            <input type="text" id="reg-name" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 16px; background: var(--bg-primary);" placeholder="John Doe" onkeydown="if(event.key === 'Enter') LoginView.handleRegister()">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Username</p>
                            <input type="text" id="reg-username" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 16px; background: var(--bg-primary);" placeholder="johndoe" onkeydown="if(event.key === 'Enter') LoginView.handleRegister()">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Password</p>
                            <input type="password" id="reg-password" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 16px; background: var(--bg-primary);" placeholder="••••••••" onkeydown="if(event.key === 'Enter') LoginView.handleRegister()">
                        </div>
                        <button class="btn-primary" style="margin-top: 12px; padding: 16px; font-size: 16px; font-weight: 700;" onclick="LoginView.handleRegister()">Create Account</button>
                        <p style="text-align: center; font-size: 14px; margin-top: 16px; color: var(--text-secondary);">Already have an account? <a href="#" onclick="LoginView.showLoginForm()" style="color: var(--accent-blue); font-weight: 700;">Sign in here</a></p>
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
        const config = WhatsappApiService.getConfig();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up">
                <h2>Admin Master Hub</h2>
                <p>Advanced controls for student management, broadcasting, and system configuration.</p>
            </div>
            
            <div class="dashboard-grid slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <div class="stat-card premium-hover" onclick="switchView('admin-students')">
                    <div class="stat-icon-wrapper blue"><i data-lucide="user-plus"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Student Management</h3>
                        <p class="user-role">Add, edit, or remove students</p>
                    </div>
                </div>
                <div class="stat-card premium-hover" onclick="NotificationSystem.simulateSend('All Members', 'WhatsApp/Mail', 'New Arrivals')">
                    <div class="stat-icon-wrapper emerald"><i data-lucide="package"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Arrival Broadcasts</h3>
                        <p class="user-role">Announce new library items</p>
                    </div>
                </div>
                <div class="stat-card premium-hover" onclick="switchView('admin-interns')">
                    <div class="stat-icon-wrapper amber"><i data-lucide="graduation-cap"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Intern Management</h3>
                        <p class="user-role">Manage teaching assistants</p>
                    </div>
                </div>
                <div class="stat-card premium-hover" onclick="switchView('admin-classes')">
                    <div class="stat-icon-wrapper blue"><i data-lucide="calendar-clock"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Weekly Timetable</h3>
                        <p class="user-role">Configure class schedules</p>
                    </div>
                </div>
                <div class="stat-card premium-hover" onclick="switchView('admin-users')">
                    <div class="stat-icon-wrapper blue"><i data-lucide="shield-check"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">System Admins</h3>
                        <p class="user-role">Manage admin access rights</p>
                    </div>
                </div>
                <div class="stat-card premium-hover" onclick="AuthService.logout()">
                    <div class="stat-icon-wrapper rose"><i data-lucide="log-out"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Secure Logout</h3>
                        <p class="user-role">End your current session</p>
                    </div>
                </div>
            </div>

            <div class="section slide-up" id="critical-library-section" style="margin-top: 48px; animation-delay: 0.2s;">
                <h3 style="color: var(--accent-rose); display: flex; align-items: center; gap: 12px; font-weight: 700; margin-bottom: 24px;">
                    <i data-lucide="alert-octagon" style="width: 24px; height: 24px;"></i>
                    Critical Alerts: Overdue Library Items
                </h3>
                <div class="alerts-list" id="critical-library-list">
                    <!-- Populated by renderCriticalLibrary -->
                </div>
            </div>

            <div class="section slide-up" style="margin-top: 48px; animation-delay: 0.3s;">
                <h3 style="font-weight: 700; margin-bottom: 24px;">Daily Attendance & Learning Log</h3>
                <div class="stat-card" style="padding: 32px;">
                    <div style="margin-bottom: 32px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;">
                            <p class="user-role font-xs" style="margin-bottom: 8px;">Filter by Grade</p>
                            <select id="attendance-grade-filter" class="btn-ghost" style="width: 100%; padding: 10px; cursor: pointer;" onchange="AdminView.renderAttendanceList()">
                                <option value="all">All Grades</option>
                                ${[...new Set(data.students.map(s => s.grade))].sort().map(g => `<option value="${g}">${g}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p class="user-role font-xs" style="margin-bottom: 8px;">Target Class</p>
                            <select id="attendance-class-select" class="btn-ghost" style="width: 100%; padding: 10px; cursor: pointer;" onchange="AdminView.renderAttendanceList()">
                                <option value="none">-- Regular Day Session --</option>
                                ${data.classes.map(c => `<option value="${c.id}">${c.title} (${c.dayOfWeek})</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p class="user-role font-xs" style="margin-bottom: 8px;">Session Date</p>
                            <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}" class="btn-ghost" style="width: 100%; padding: 8px;" onchange="AdminView.renderAttendanceList()">
                        </div>
                    </div>
                    
                    <div class="attendance-setup grid-responsive" style="gap: 32px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 12px; text-transform: uppercase;">Student Roster</p>
                            <div class="student-presence-list" id="attendance-student-list" style="max-height: 400px; overflow-y: auto; padding-right: 8px; display: flex; flex-direction: column; gap: 12px;">
                                <!-- Populated by renderAttendanceList -->
                            </div>
                        </div>
                        <div class="topic-setup">
                            <p class="user-role font-xs" style="margin-bottom: 12px; text-transform: uppercase;">Curriculum Covered Today</p>
                            <textarea id="topics-covered" class="btn-ghost" style="width: 100%; height: 240px; padding: 16px; resize: none; font-size: 15px; line-height: 1.6;" placeholder="Describe what was taught today..."></textarea>
                            <button class="btn-primary" style="margin-top: 20px; width: 100%; padding: 16px; font-weight: 700;" onclick="AdminView.saveAttendance()">
                                <i data-lucide="save" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Save & Notify Parents
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="attendance-post-save-actions" class="section" style="display: none; background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.1); border-radius: var(--radius-lg); padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">Session Completion Tasks</h3>
                    <button class="btn-ghost" onclick="document.getElementById('attendance-post-save-actions').style.display='none'">Done & Clear</button>
                </div>

                <div id="absent-notifications" style="display: none; margin-bottom: 32px;">
                    <h4 class="user-role" style="color: var(--accent-rose); filter: brightness(1.2); margin-bottom: 12px; font-weight: 700;">ABSENCE ALERTS NEEDED</h4>
                    <div class="alerts-list" id="absent-list"></div>
                </div>

                <div id="activity-notifications" style="display: none;">
                    <h4 class="user-role" style="color: var(--accent-blue); filter: brightness(1.2); margin-bottom: 12px; font-weight: 700;">DAILY ACTIVITY UPDATES</h4>
                    <div class="alerts-list" id="activity-list"></div>
                </div>
            </div>

            <div class="grid-responsive" style="margin-top: 32px; gap: 32px; align-items: flex-start;">
                <div class="section" style="margin: 0;">
                    <h3>Manual Broadcast</h3>
                    <div class="stat-card" style="margin-top: 16px;">
                        <textarea class="btn-ghost" id="broadcast-msg" style="width: 100%; height: 100px; padding: 12px; margin-bottom: 12px; resize: none;" placeholder="Type message for worksheets/games..."></textarea>
                        <button class="btn-primary" onclick="NotificationSystem.broadcastToAll(document.getElementById('broadcast-msg').value)">Broadcast to All</button>
                    </div>
                </div>

                <div class="section" style="margin: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="margin: 0;">Message Scheduler</h3>
                        <span class="badge badge-amber">BETA</span>
                    </div>
                    <div class="stat-card">
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 6px;">Schedule Time</p>
                                <input type="datetime-local" id="sch-time" class="btn-ghost" style="width: 100%; padding: 12px;">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 6px;">Message Content</p>
                                <textarea id="sch-msg" class="btn-ghost" style="width: 100%; height: 80px; padding: 12px; resize: none;" placeholder="E.g. Don't forget tomorrow's annual day!"></textarea>
                            </div>
                            <button class="btn-primary" style="background: var(--accent-amber);" onclick="AdminView.scheduleMessage()">
                                <i data-lucide="clock" style="width: 14px; height: 14px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Schedule Broadcast
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0;">WhatsApp Cloud API Configuration</h3>
                    <span class="badge badge-rose">UNSECURE FOR DEMO</span>
                </div>
                <div class="stat-card">
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none;">
                            <input type="checkbox" id="api-enabled" ${config.enabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-emerald);">
                            <span style="font-weight: 600; color: var(--accent-emerald);">Enable Official WhatsApp API (Skips Manual Tabs)</span>
                        </label>
                        
                        <div class="grid-responsive" style="gap: 16px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 6px;">Phone Number ID</p>
                                <input type="text" id="api-phone-id" class="btn-ghost" style="width: 100%; padding: 12px;" value="${config.phoneNumberId}" placeholder="e.g. 104523315729312">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 6px;">Graph API Version</p>
                                <input type="text" id="api-version" class="btn-ghost" style="width: 100%; padding: 12px;" value="${config.version || 'v21.0'}" placeholder="v21.0">
                            </div>
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 6px;">Permanent Access Token</p>
                            <input type="password" id="api-token" class="btn-ghost" style="width: 100%; padding: 12px;" value="${config.accessToken}" placeholder="EAABw...">
                            <p class="user-role" style="font-size: 11px; margin-top: 8px;">Note: This token is saved in your local browser storage. Do not use on public computers.</p>
                        </div>
                        <button class="btn-primary" style="background: var(--accent-emerald);" onclick="AdminView.saveApiConfig()">
                            <i data-lucide="shield-check" style="width: 14px; height: 14px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Save API Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        this.renderAttendanceList();
        this.renderScheduledTasks();
        this.renderCriticalLibrary();
    },

    saveApiConfig() {
        const enabled = document.getElementById('api-enabled').checked;
        const phoneNumberId = document.getElementById('api-phone-id').value.trim();
        const accessToken = document.getElementById('api-token').value.trim();
        const version = document.getElementById('api-version').value.trim();

        if (enabled && (!phoneNumberId || !accessToken)) {
            NotificationSystem.toast("ID and Token are required to enable API", "error");
            return;
        }

        WhatsappApiService.saveConfig({ enabled, phoneNumberId, accessToken, version });
        NotificationSystem.toast("WhatsApp API settings saved", "success");
        this.render();
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
            const msg = `Greetings from Book Buddy! Hello ${student.parentName}, a reminder that ${student.name} has had the book "${item.title}" for ${diffDays} days. Please return or swap it at the library tomorrow.`;
            
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
        const presentStudents = [];

        // 1. Gather new data
        data.students.forEach(s => {
            const rad = document.querySelector(`input[name="att-${s.id}"]:checked`);
            if (!rad) return;
            const status = rad.value;
            newRecords.push({ date, studentId: s.id, status, classId: numericClassId });
            if (status === 'absent') {
                absentees.push(s);
            } else if (status === 'present') {
                presentStudents.push(s);
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
        
        // Handle Post-Save Actions
        const mainOverlay = document.getElementById('attendance-post-save-actions');
        const absentSection = document.getElementById('absent-notifications');
        const activitySection = document.getElementById('activity-notifications');
        const absentList = document.getElementById('absent-list');
        const activityList = document.getElementById('activity-list');
        
        let hasTasks = false;

        // 1. Absence Alerts
        if (absentees.length > 0) {
            hasTasks = true;
            absentSection.style.display = 'block';
            absentList.innerHTML = absentees.map(s => {
                const msg = `Greetings from Book Buddy! Hello ${s.parentName}, this is to inform you that ${s.name} was ABSENT for ${className} today (${date}). Topics covered: ${topics || 'Regular session'}. Please contact us if unplanned.`;
                return `
                    <div class="alert-item critical">
                        <div class="alert-indicator"></div>
                        <div class="alert-content">
                            <p class="alert-msg">${s.name} - Absence Alert</p>
                            <p class="user-role">Parent: ${s.parentName} (${s.parentPhone})</p>
                        </div>
                        <button class="btn-primary" onclick="NotificationSystem.sendDirectMessage('${s.parentPhone}', '${msg}')">Notify Parent</button>
                    </div>
                `;
            }).join('');
        } else {
            absentSection.style.display = 'none';
        }

        // 2. Daily Activity Updates
        if (presentStudents.length > 0 && topics.trim()) {
            hasTasks = true;
            activitySection.style.display = 'block';
            activityList.innerHTML = presentStudents.map(s => {
                const msg = `Greetings from Book Buddy! Hello ${s.parentName}, today ${s.name} attended the ${className}. We covered: ${topics}. Please encourage them to practice this at home!`;
                return `
                    <div class="alert-item">
                        <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                        <div class="alert-content">
                            <p class="alert-msg">${s.name} - Topic Update</p>
                            <p class="user-role">Send: "${topics}"</p>
                        </div>
                        <button class="btn-primary" style="background: var(--accent-blue);" onclick="NotificationSystem.sendDirectMessage('${s.parentPhone}', '${msg}')">Send to Parent</button>
                    </div>
                `;
            }).join('');
        } else {
            activitySection.style.display = 'none';
        }

        if (hasTasks) {
            mainOverlay.style.display = 'block';
            mainOverlay.scrollIntoView({ behavior: 'smooth' });
        } else {
            mainOverlay.style.display = 'none';
            if (topics.trim()) {
                NotificationSystem.simulateSend('Parents Group', 'WhatsApp', `Daily Update: All present. ${topics}`);
            }
        }

        // Automatic Topic/Update Trigger
        if (topics.trim()) {
            setTimeout(() => {
                const classMsg = numericClassId ? `Today's Learning (${className}): ${topics}` : `Today's Learning: ${topics}`;
                if (confirm(`Attendance saved. Would you like to trigger a broadcast for the topics covered today?`)) {
                    NotificationSystem.broadcastToAll(classMsg);
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
    },

    scheduleMessage() {
        const msg = document.getElementById('sch-msg').value.trim();
        const timeInput = document.getElementById('sch-time').value;
        if (!msg || !timeInput) {
            NotificationSystem.toast("Please enter both message and time", "error");
            return;
        }

        const data = StorageService.getData();
        const newId = (data.scheduledMessages || []).length > 0 
            ? Math.max(...data.scheduledMessages.map(m => m.id)) + 1 
            : 901;
        
        const newSchedule = { 
            id: newId, 
            message: msg, 
            time: timeInput, 
            status: 'pending',
            created: new Date().toISOString()
        };

        data.scheduledMessages = [...(data.scheduledMessages || []), newSchedule];
        StorageService.saveData(data);
        NotificationSystem.toast("Broadcast scheduled successfully!", "success");
        this.render();
    },

    deleteScheduled(id) {
        if (confirm("Cancel this scheduled broadcast?")) {
            StorageService.removeFromCollection('scheduledMessages', id);
            this.render();
        }
    },

    renderScheduledTasks() {
        const data = StorageService.getData();
        const container = document.getElementById('scheduled-list');
        if (!container) return;
        
        const tasks = (data.scheduledMessages || [])
            .filter(t => t.status === 'pending')
            .sort((a, b) => new Date(a.time) - new Date(b.time));

        if (tasks.length === 0) {
            container.innerHTML = '<p class="user-role" style="text-align: center; padding: 20px 0;">No pending broadcasts.</p>';
            return;
        }

        container.innerHTML = tasks.map(t => {
            const timeStr = new Date(t.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
            return `
                <div class="alert-item">
                    <div class="alert-indicator" style="background: var(--accent-amber)"></div>
                    <div class="alert-content">
                        <p class="alert-msg">${t.message.substring(0, 50)}${t.message.length > 50 ? '...' : ''}</p>
                        <p class="user-role">Scheduled for: ${timeStr}</p>
                    </div>
                    <button class="icon-btn" onclick="AdminView.deleteScheduled(${t.id})" title="Cancel Schedule">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px; color: var(--accent-rose);"></i>
                </div>
            `;
        }).join('');
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
            <div class="view-header slide-up" style="display: flex; align-items: center; gap: 24px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2 style="font-size: 28px; font-weight: 700;">Student Management</h2>
                    <p>Register new members or update existing student profiles.</p>
                </div>
            </div>

             <div class="grid-responsive slide-up" style="gap: 32px; margin-top: 32px; animation-delay: 0.1s;">
                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Register New Student</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Full Name</p>
                            <input type="text" id="new-name" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="e.g. Alice Johnson">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">School Name</p>
                            <input type="text" id="new-school" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="e.g. Westside Elementary">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Parent Name</p>
                                <input type="text" id="new-parent" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="Parent's Name">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Parent Phone</p>
                                <input type="tel" id="new-phone" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="+91 XXXXX XXXXX">
                            </div>
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Parent Email</p>
                            <input type="email" id="new-email" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="parent@email.com">
                        </div>
                        <button class="btn-primary" style="padding: 16px; font-weight: 700; margin-top: 12px;" onclick="AdminStudentsView.addStudent()">
                            <i data-lucide="user-plus" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Register Student
                        </button>
                    </div>
                </div>

                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Active Roster</h3>
                    <div class="alerts-list" style="max-height: 520px; overflow-y: auto; padding-right: 12px; display: flex; flex-direction: column; gap: 12px;">
                        ${data.students.map(s => `
                            <div class="alert-item premium">
                                <div class="user-avatar" style="width: 40px; height: 40px; background: var(--accent-blue); flex-shrink: 0; font-size: 16px;">${s.name.charAt(0)}</div>
                                <div class="alert-content">
                                    <p class="alert-msg" style="font-size: 15px; font-weight: 600;">${s.name}</p>
                                    <p class="user-role" style="font-size: 11px;">${s.grade || 'Grade Not Set'} • ${s.isLibraryMember ? 'Premium Member' : 'Standard Member'}</p>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="icon-btn btn-sm" onclick="AdminStudentsView.showEditModal(${s.id})" title="Edit Student">
                                        <i data-lucide="edit-3" style="color: var(--accent-blue); width: 14px; height: 14px;"></i>
                                    </button>
                                    <button class="icon-btn btn-sm" onclick="AdminStudentsView.deleteStudent(${s.id})" title="Delete Student">
                                        <i data-lucide="trash-2" style="color: var(--accent-rose); width: 14px; height: 14px;"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div id="edit-student-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 500px; padding: 40px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                        <h3 style="font-size: 24px; font-weight: 700;">Edit Student Profile</h3>
                        <button class="icon-btn" onclick="document.getElementById('edit-student-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <input type="hidden" id="edit-id">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Student Name</p>
                            <input type="text" id="edit-name" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">School Name</p>
                            <input type="text" id="edit-school" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                             <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Grade</p>
                                <select id="edit-grade" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px; cursor: pointer;">
                                    ${Array.from({length: 12}, (_, i) => `Grade ${i+1}`).map(g => `<option>${g}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Parent Phone</p>
                                <input type="tel" id="edit-phone" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;">
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Library Access</p>
                                <select id="edit-library" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px; cursor: pointer;" onchange="document.getElementById('edit-plan-div').style.display = this.value === 'true' ? 'block' : 'none'">
                                    <option value="true">Active Member</option>
                                    <option value="false">Non-Member</option>
                                </select>
                            </div>
                            <div id="edit-plan-div">
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Subscription</p>
                                <select id="edit-plan" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px; cursor: pointer;">
                                    <option>Basic</option>
                                    <option>Premium</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 12px; padding: 16px; font-weight: 700;" onclick="AdminStudentsView.updateStudent()">
                            <i data-lucide="check-circle" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

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
        this.render();
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
            <div class="view-header slide-up" style="display: flex; align-items: center; gap: 24px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2 style="font-size: 28px; font-weight: 700;">System User Management</h2>
                    <p>Add or modify administrative accounts with role-based access.</p>
                </div>
            </div>

            <div class="grid-responsive slide-up" style="gap: 32px; margin-top: 32px; animation-delay: 0.1s;">
                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Create Admin User</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Full Name</p>
                            <input type="text" id="user-display-name" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="e.g. Robert Smith">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Username</p>
                            <input type="text" id="user-username" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="robert_admin">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Security Password</p>
                            <input type="password" id="user-password" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="••••••••">
                        </div>
                        <button class="btn-primary" style="padding: 16px; font-weight: 700; margin-top: 12px;" onclick="AdminUsersView.addUser()">
                            <i data-lucide="user-plus" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Add Admin User
                        </button>
                    </div>
                </div>

                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Existing Administrators</h3>
                    <div class="alerts-list" style="display: flex; flex-direction: column; gap: 12px;">
                        ${data.users.map(u => `
                            <div class="alert-item premium">
                                <div class="user-avatar" style="width: 40px; height: 40px; background: var(--accent-blue); flex-shrink: 0; font-size: 16px;">${u.name.charAt(0)}</div>
                                <div class="alert-content">
                                    <p class="alert-msg" style="font-size: 15px; font-weight: 600;">${u.name}</p>
                                    <p class="user-role" style="font-size: 11px;">@${u.username} • ${u.role.toUpperCase()}</p>
                                </div>
                                <button class="icon-btn btn-sm" onclick="AdminUsersView.deleteUser('${u.id}')" ${u.id === 'admin' ? 'disabled' : ''} title="Delete User">
                                    <i data-lucide="trash-2" style="color: var(--accent-rose); width: 14px; height: 14px;"></i>
                                </button>
                            </div>
                        `).join('')}
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
                    <div class="stat-card" style="width: 100%; max-width: 440px; padding: 48px; background: white; color: #1a1a1a; box-shadow: 0 32px 64px rgba(0,0,0,0.4);">
                        <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #f0f0f0; padding-bottom: 24px;">
                            <h2 style="color: #1a1a1a; margin-bottom: 4px; font-size: 28px; letter-spacing: -1px;">Book Buddy</h2>
                            <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Official Fee Invoice</p>
                        </div>
                        <div style="margin-bottom: 32px; font-size: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <p style="color: #999; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Student Name</p>
                                <p style="font-weight: 700;">${student.name}</p>
                            </div>
                            <div>
                                <p style="color: #999; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Grade Level</p>
                                <p style="font-weight: 700;">${student.grade}</p>
                            </div>
                            <div>
                                <p style="color: #999; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Invoice Date</p>
                                <p style="font-weight: 700;">${new Date().toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style="color: #999; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Invoice #</p>
                                <p style="font-weight: 700;">INV-${Math.floor(Math.random()*10000)}</p>
                            </div>
                        </div>
                        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 20px 0; margin-bottom: 32px;">
                            ${unpaidFees.map(f => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                    <span style="color: #555;">${f.month} Fee Record</span>
                                    <span style="font-weight: 700;">₹${f.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 22px; margin-bottom: 40px; color: #000;">
                            <span>Total Amount</span>
                            <span>₹${total.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <button class="btn-primary" style="flex: 1; background: #000; border-radius: 12px; padding: 16px;" onclick="window.print()">
                                <i data-lucide="printer" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Print
                            </button>
                            <button class="btn-ghost" style="flex: 1; border-radius: 12px; border-color: #ddd; color: #666;" onclick="document.getElementById('bill-overlay').remove()">Dismiss</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', billHtml);
            lucide.createIcons();
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
                actions += `<button class="btn-primary btn-sm" onclick="PaymentModal.show(${f.id},'${safeName}','${safeMonth}',${f.amount})"><i data-lucide="credit-card" style="width:12px;height:12px;margin-right:6px;"></i>Pay Now</button>`;
                if (isAdmin) {
                    actions += `<button class="btn-ghost btn-sm" onclick="FeesView.markPaid(${f.id})"><i data-lucide="check" style="width:12px;height:12px;margin-right:6px;"></i>Mark Paid</button>`;
                    actions += `<button class="icon-btn btn-sm" onclick="FeesView.deleteItem(${f.id})" title="Delete"><i data-lucide="trash-2" style="color:var(--accent-rose);width:14px;height:14px;"></i></button>`;
                }
            }
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--bg-primary);border-radius:12px;flex-wrap:wrap;gap:12px;border: 1px solid var(--glass-border);">
                        <div>
                            <p style="font-weight:600;font-size:14px;">${f.month} Fee</p>
                            <p style="color:var(--text-secondary);font-size:11px;margin-top:2px;">Deadline: ${f.dueDate}</p>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                            <span style="font-weight:700;font-size:16px;">&#8377;${f.amount.toLocaleString()}</span>
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
                    const msg = `Greetings from Book Buddy! Hello ${student.parentName}, a reminder for ${student.name}'s fee of ₹${totalDue.toLocaleString()} for ${feeDetails}. Please clear it soon.`;
                    return `<button class="btn-ghost btn-sm" onclick="NotificationSystem.sendDirectMessage('${student.parentPhone}', '${msg}')"><i data-lucide="send" style="width:12px;height:12px;margin-right:6px;"></i>Notify Parent</button>`;
                })()
                : '';
            const dueText  = totalDue > 0 ? `&nbsp;•&nbsp;<strong style="color:var(--accent-rose);">&#8377;${totalDue.toLocaleString()} due</strong>` : '';
            const paidText = paid > 0 ? `&nbsp;•&nbsp;<span style="color:var(--accent-emerald);">&#8377;${paid.toLocaleString()} cleared</span>` : '';
            const feeRows  = buildFeeRows(studentFees, student);
            const feeBody  = feeRows
                ? `<div style="display:flex;flex-direction:column;gap:12px;padding-top:20px;border-top:1px solid var(--glass-border);">${feeRows}</div>`
                : `<p class="user-role" style="font-size:13px;padding-top:16px;border-top:1px solid var(--glass-border); text-align: center;">No payment history found.</p>`;
            
            return `<div class="stat-card premium-border" style="padding:24px 32px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;${studentFees.length > 0 ? 'margin-bottom:20px;' : ''}">
                            <div style="display:flex;align-items:center;gap:18px;">
                                <div class="user-avatar" style="width:52px;height:52px;font-size:22px;font-weight:700;flex-shrink:0;background:var(--accent-blue);">${student.name.charAt(0)}</div>
                                <div>
                                    <p style="font-weight:700;font-size:17px;margin-bottom:6px; letter-spacing: -0.3px;">${student.name}</p>
                                    <p class="user-role" style="font-size:12px;display:flex;align-items:center;gap:8px;">
                                        <span style="width:8px;height:8px;border-radius:50%;background:${statusColor};display:inline-block;box-shadow: 0 0 8px ${statusColor};"></span>
                                        ${statusLabel}${dueText}${paidText}
                                    </p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 12px;">
                                ${reminderBtn}
                                ${isAdmin && totalDue > 0 ? `<button class="icon-btn btn-sm" onclick="generateBill(${student.id})" title="Generate PDF Bill"><i data-lucide="file-text"></i></button>` : ''}
                            </div>
                        </div>
                        ${feeBody}
                    </div>`;
        };

        const adminAddForm = isAdmin ? `
            <div class="section slide-up" style="animation-delay: 0.1s;">
                <h3 style="margin-bottom:20px;font-weight:700; font-size: 20px;">Record New Fee Item</h3>
                <div class="stat-card" style="padding: 32px;">
                    <div class="grid-responsive" style="gap:20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom:8px; text-transform: uppercase;">Select Student</p>
                            <select id="fee-student" class="btn-ghost" style="width:100%;padding:14px;font-size:15px;cursor:pointer;">
                                <option value="">Choose Student...</option>
                                ${data.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom:8px; text-transform: uppercase;">Billing Month</p>
                            <input type="text" id="fee-month" class="btn-ghost" style="width:100%;padding:14px; font-size: 15px;" placeholder="e.g. May 2026" value="${new Date().toLocaleString('default',{month:'long'})} ${new Date().getFullYear()}">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom:8px; text-transform: uppercase;">Amount (₹)</p>
                            <input type="number" id="fee-amount" class="btn-ghost" style="width:100%;padding:14px; font-size: 15px;" placeholder="1500" value="1500">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom:8px; text-transform: uppercase;">Payment Deadline</p>
                            <input type="date" id="fee-due" class="btn-ghost" style="width:100%;padding:14px; font-size: 15px;" value="${new Date(Date.now()+15*24*60*60*1000).toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top:24px; padding: 16px; font-weight: 700;" onclick="FeesView.addFee()">
                        <i data-lucide="plus-circle" style="width:18px;height:18px;margin-right:8px;display:inline-block;vertical-align:middle;"></i> Create Fee Record
                    </button>
                </div>
            </div>` : '';

        container.innerHTML = `
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Financial Center</h2>
                <p>Track student tuition, library fees, and payment histories in real-time.</p>
            </div>
            <div class="dashboard-grid slide-up" style="margin-bottom:48px; animation-delay: 0.1s;">
                <div class="stat-card">
                    <div class="stat-icon-wrapper rose"><i data-lucide="alert-circle"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Total Outstanding</h3>
                        <p class="value" style="color:var(--accent-rose); font-size: 28px;">&#8377;${totalOutstanding.toLocaleString()}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper emerald"><i data-lucide="check-circle-2"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Revenue Collected</h3>
                        <p class="value" style="color:var(--accent-emerald); font-size: 28px;">&#8377;${totalCollected.toLocaleString()}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper blue"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <h3 style="font-weight: 700;">Pending Accounts</h3>
                        <p class="value" style="font-size: 28px;">${studentsWithDues}</p>
                    </div>
                </div>
            </div>
            ${adminAddForm}
            <div class="section slide-up" style="margin-top: 48px; animation-delay: 0.2s;">
                <h3 style="margin-bottom:24px;font-weight:700; font-size: 20px;">Student Ledger</h3>
                <div style="display:flex;flex-direction:column;gap:20px;">
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
           <div class="view-header slide-up">
               <h2 style="font-size: 32px; font-weight: 700;">Learning Resources</h2>
               <p>Access interactive worksheets, educational games, and digital kits.</p>
           </div>
           <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
               <div class="alerts-list" style="display: flex; flex-direction: column; gap: 16px;">
                   ${data.worksheets.map(w => `
                       <div class="alert-item premium">
                           <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                           <div class="alert-icon-circle"><i data-lucide="file-text"></i></div>
                           <div class="alert-content">
                                <p class="alert-msg" style="font-size: 16px; font-weight: 600;">${w.title}</p>
                                <p class="user-role">Difficulty: ${w.difficulty} • Released: ${w.launched}</p>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <button class="btn-primary" style="padding: 12px 24px; font-size: 14px; font-weight: 600;" onclick="NotificationSystem.toast('Initializing ${w.title}...', 'info')">
                                    <i data-lucide="play" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Launch
                                </button>
                                ${isAdmin ? `
                                    <button class="btn-ghost btn-sm" onclick="NotificationSystem.triggerUpdateBroadcast('Worksheet', '${w.title}')">Broadcast</button>
                                    <button class="icon-btn btn-sm" onclick="WorksheetsView.deleteItem(${w.id})" title="Delete Worksheet"><i data-lucide="trash-2" style="color: var(--accent-rose); width: 14px; height: 14px;"></i></button>
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
           <div class="view-header slide-up">
               <h2 style="font-size: 32px; font-weight: 700;">Digital Library</h2>
               <p>Daily editions and educational periodicals for Team 3 students.</p>
           </div>
           <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
               <div class="alerts-list" style="display: flex; flex-direction: column; gap: 16px;">
                   ${data.newspapers.map(n => `
                       <div class="alert-item premium">
                           <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                           <div class="alert-icon-circle"><i data-lucide="newspaper"></i></div>
                           <div class="alert-content">
                                <p class="alert-msg" style="font-size: 16px; font-weight: 600;">${n.title}</p>
                                <p class="user-role">Published: ${new Date(n.launched).toLocaleDateString()} • Edition: Digital</p>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <button class="btn-ghost" style="padding: 12px 24px; font-size: 14px; font-weight: 600;" onclick="window.open('${n.url}', '_blank')">
                                    <i data-lucide="external-link" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Open Reader
                                </button>
                                ${isAdmin ? `
                                    <button class="btn-primary" onclick="NotificationSystem.triggerUpdateBroadcast('Newspaper', '${n.title}')">Group Dispatch</button>
                                    <button class="icon-btn btn-sm" onclick="NewspapersView.deleteItem(${n.id})" title="Delete Newspaper"><i data-lucide="trash-2" style="color: var(--accent-rose); width: 14px; height: 14px;"></i></button>
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

const BlueprintView = {
    render() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Campus Blueprint</h2>
                <p>Interactive facility layout and resource map for Book Buddy Academy.</p>
            </div>
            
            <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <div class="grid-responsive" style="gap: 32px;">
                    <div class="stat-card premium-border" style="grid-column: span 2; padding: 48px; background: var(--bg-secondary); min-height: 500px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                        <div class="blueprint-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(6, 1fr); gap: 12px; z-index: 2;">
                            <div class="blueprint-zone" style="grid-area: 1 / 1 / 3 / 4; background: rgba(59, 130, 246, 0.1); border: 2px dashed var(--accent-blue); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
                                <i data-lucide="book-open" style="color: var(--accent-blue);"></i>
                                <span style="font-size: 12px; font-weight: 700; color: var(--accent-blue);">Main Library</span>
                            </div>
                            <div class="blueprint-zone" style="grid-area: 1 / 5 / 3 / 8; background: rgba(16, 185, 129, 0.1); border: 2px dashed var(--accent-emerald); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
                                <i data-lucide="graduation-cap" style="color: var(--accent-emerald);"></i>
                                <span style="font-size: 12px; font-weight: 700; color: var(--accent-emerald);">Primary Wing</span>
                            </div>
                            <div class="blueprint-zone" style="grid-area: 4 / 1 / 6 / 3; background: rgba(245, 158, 11, 0.1); border: 2px dashed var(--accent-amber); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
                                <i data-lucide="coffee" style="color: var(--accent-amber);"></i>
                                <span style="font-size: 12px; font-weight: 700; color: var(--accent-amber);">Staff Lounge</span>
                            </div>
                            <div class="blueprint-zone" style="grid-area: 4 / 4 / 7 / 8; background: rgba(244, 63, 94, 0.1); border: 2px dashed var(--accent-rose); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px;">
                                <i data-lucide="settings" style="color: var(--accent-rose);"></i>
                                <span style="font-size: 12px; font-weight: 700; color: var(--accent-rose);">Admin Block</span>
                            </div>
                        </div>
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.03; background-image: radial-gradient(var(--text-primary) 1px, transparent 1px); background-size: 30px 30px;"></div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="stat-card" style="padding: 24px;">
                            <h4 style="font-weight: 700; margin-bottom: 16px;">Facility Status</h4>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span class="user-role">Library Occupancy</span>
                                    <span class="badge badge-emerald">65%</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span class="user-role">Classrooms Active</span>
                                    <span class="badge badge-blue">12 / 14</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span class="user-role">Power Usage</span>
                                    <span class="badge badge-amber">Stable</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; padding: 16px;" onclick="NotificationSystem.toast('Updating map resources...', 'info')">
                            <i data-lucide="refresh-cw" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Sync Blueprint
                        </button>
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
        container.innerHTML = `
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Performance Analytics</h2>
                <p>Data-driven insights into student progress and institutional growth.</p>
            </div>
            
            <div class="dashboard-grid slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <div class="stat-card">
                    <div class="stat-icon-wrapper emerald"><i data-lucide="trending-up"></i></div>
                    <div class="stat-info">
                        <h3>Avg. Attendance</h3>
                        <p class="value">94.2%</p>
                        <p class="trend up">+2.1% from last month</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper blue"><i data-lucide="award"></i></div>
                    <div class="stat-info">
                        <h3>Top Performers</h3>
                        <p class="value">18 Students</p>
                        <p class="trend up">Rising trend</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon-wrapper amber"><i data-lucide="book-open"></i></div>
                    <div class="stat-info">
                        <h3>Reading Velocity</h3>
                        <p class="value">4.5 Books/wk</p>
                        <p class="trend down">-0.2 from last wk</p>
                    </div>
                </div>
            </div>

            <div class="section slide-up" style="margin-top: 48px; animation-delay: 0.2s;">
                <div class="stat-card premium-border" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Subject Proficiency</h3>
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span style="font-weight: 600;">English Literature</span>
                                <span style="color: var(--accent-blue); font-weight: 700;">88%</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden;">
                                <div style="width: 88%; height: 100%; background: var(--accent-blue); border-radius: 4px;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span style="font-weight: 600;">Mathematical Logic</span>
                                <span style="color: var(--accent-emerald); font-weight: 700;">92%</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden;">
                                <div style="width: 92%; height: 100%; background: var(--accent-emerald); border-radius: 4px;"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                                <span style="font-weight: 600;">Creative Arts</span>
                                <span style="color: var(--accent-rose); font-weight: 700;">76%</span>
                            </div>
                            <div style="width: 100%; height: 8px; background: var(--bg-primary); border-radius: 4px; overflow: hidden;">
                                <div style="width: 76%; height: 100%; background: var(--accent-rose); border-radius: 4px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
};

const StudentsView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Student Roster</h2>
                <p>Complete directory of students enrolled in the current academic year.</p>
            </div>
            <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <div class="alerts-list" style="display: flex; flex-direction: column; gap: 12px;">
                    ${data.students.map(s => `
                        <div class="alert-item premium">
                            <div class="user-avatar" style="width: 46px; height: 46px; background: var(--accent-blue); flex-shrink: 0; font-size: 18px;">
                                ${s.name.charAt(0)}
                            </div>
                            <div class="alert-content">
                                <p class="alert-msg" style="font-size: 16px; font-weight: 700;">${s.name}</p>
                                ${isAdmin
                                    ? `<p class="user-role" style="font-size: 12px; margin-top: 2px;">Parent: ${s.parentName} • <span style="opacity: 0.8;">${s.parentPhone}</span></p>`
                                    : `<div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                        <p class="user-role" style="font-size: 11px;">#TS3-${s.id.toString().padStart(3,'0')}</p>
                                        <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary); font-size: 9px; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;">
                                                <i data-lucide="lock" style="width:10px;height:10px;"></i> Secured Profile
                                        </span>
                                       </div>`
                                }
                            </div>
                            ${isAdmin
                                ? `<button class="btn-ghost btn-sm" onclick="switchView('profile', ${s.id})">Full Profile</button>`
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
                                const msg = `Greetings from Book Buddy! Hello ${student.parentName}, your daughter ${student.name} scored: ${marksStr}. Overall Attendance: ${attendanceRate}%`;
                                return `
                                    <button class="btn-primary" onclick="NotificationSystem.sendDirectMessage('${student.parentPhone}', '${msg}')">Message</button>
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
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <h3 class="section-title" style="margin: 0;">Subject Performance</h3>
                            <button class="btn-primary" style="padding: 8px 16px; font-size: 13px;" onclick="document.getElementById('add-mark-overlay').style.display='flex'">
                                <i data-lucide="plus" style="width: 14px; height: 14px; margin-right: 6px; display: inline-block; vertical-align: middle;"></i> Add Mark
                            </button>
                        </div>
                        <div class="stat-card">
                            <div class="grades-list" style="display: flex; flex-direction: column; gap: 24px;">
                                ${grades.map(g => `
                                    <div class="grade-item" style="padding: 0;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center;">
                                            <span class="subject-name">${g.subject}</span>
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <span class="subject-score">${g.score}/${g.max}</span>
                                                <button class="icon-btn" onclick="ProfileView.deleteMark(${g.id}, ${student.id})" title="Delete Mark">
                                                    <i data-lucide="trash-2" style="width: 14px; height: 14px; color: var(--accent-rose);"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="progress-container" style="height: 10px;">
                                            <div class="progress-bar" style="width: ${(g.score / g.max) * 100}%; background: ${g.score / g.max > 0.8 ? 'var(--accent-emerald)' : 'var(--accent-blue)'}; box-shadow: 0 0 10px ${g.score / g.max > 0.8 ? 'rgba(16,185,129,0.3)' : 'var(--accent-blue-glow)'}"></div>
                                        </div>
                                    </div>
                                `).join('') || '<p class="user-role" style="text-align: center; padding: 20px 0;">No performance records yet.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Mark Modal -->
            <div id="add-mark-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 400px; padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3>Add Subject Mark</h3>
                        <button class="icon-btn" onclick="document.getElementById('add-mark-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 4px;">Subject</p>
                            <input type="text" id="m-subject" class="btn-ghost" style="width: 100%; padding: 12px;" placeholder="e.g. Mathematics">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 4px;">Score</p>
                                <input type="number" id="m-score" class="btn-ghost" style="width: 100%; padding: 12px;" placeholder="85">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 4px;">Max Score</p>
                                <input type="number" id="m-max" class="btn-ghost" style="width: 100%; padding: 12px;" placeholder="100">
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 12px;" onclick="ProfileView.addMark(${student.id})">Save Performance Record</button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    addMark(studentId) {
        const subject = document.getElementById('m-subject').value.trim();
        const score = parseInt(document.getElementById('m-score').value);
        const max = parseInt(document.getElementById('m-max').value);

        if (!subject || isNaN(score) || isNaN(max)) {
            NotificationSystem.toast("Please fill all fields correctly", "error");
            return;
        }

        const data = StorageService.getData();
        const newId = (data.performanceMetrics || []).length > 0 
            ? Math.max(...data.performanceMetrics.map(m => m.id)) + 1 
            : 701;
        
        const newMark = { id: newId, studentId, subject, score, max };
        data.performanceMetrics = [...(data.performanceMetrics || []), newMark];
        
        StorageService.saveData(data);
        NotificationSystem.toast("Mark added successfully!", "success");
        this.render(studentId);
    },

    deleteMark(id, studentId) {
        if (confirm("Delete this performance record?")) {
            StorageService.removeFromCollection('performanceMetrics', id);
            NotificationSystem.toast("Record deleted", "success");
            this.render(studentId);
        }
    }
};

const BlueprintView = {
    render() {
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Campus Blueprint</h2>
                <p>Interactive architectural overview of Team 3 School Campus.</p>
            </div>

            <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <div class="blueprint-container stat-card premium-border" style="padding: 0; overflow: hidden; position: relative;">
                    <img src="assets/school_blueprint.png" alt="School Blueprint" class="blueprint-img" style="width: 100%; height: auto; display: block; border-radius: 16px;">
                    
                    <!-- Labels / Pins -->
                    <div class="blueprint-label" style="top: 30%; left: 20%;">
                        <div class="pin"></div>
                        <span style="font-weight: 600; padding: 4px 10px; border-radius: 6px;">Admin Office</span>
                    </div>
                    <div class="blueprint-label" style="top: 25%; left: 60%;">
                        <div class="pin active" style="box-shadow: 0 0 15px var(--accent-rose);"></div>
                        <span style="font-weight: 600; padding: 4px 10px; border-radius: 6px;">Team 3 Classroom</span>
                    </div>
                    <div class="blueprint-label" style="top: 60%; left: 40%;">
                        <div class="pin"></div>
                        <span style="font-weight: 600; padding: 4px 10px; border-radius: 6px;">Central Library</span>
                    </div>
                    <div class="blueprint-label" style="top: 70%; left: 75%;">
                        <div class="pin"></div>
                        <span style="font-weight: 600; padding: 4px 10px; border-radius: 6px;">Science Lab</span>
                    </div>
                    <div class="blueprint-label" style="top: 45%; left: 45%;">
                        <div class="pin"></div>
                        <span style="font-weight: 600; padding: 4px 10px; border-radius: 6px;">Sports Plaza</span>
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
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Performance Analytics</h2>
                <p>Class-wide academic performance and subject benchmarks.</p>
            </div>

            <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Subject Benchmarks</h3>
                <div class="dashboard-grid">
                    ${averages.map(avg => `
                        <div class="stat-card premium-border" style="padding: 24px;">
                            <div class="stat-info">
                                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 8px;">${avg.subject}</h3>
                                <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 16px;">
                                    <p class="value" style="font-size: 32px; font-weight: 800;">${avg.average}%</p>
                                    <span style="font-size: 12px; color: ${avg.average >= 75 ? 'var(--accent-emerald)' : 'var(--text-secondary)'}">
                                        ${avg.average >= 75 ? '↑ Above Avg' : '− Average'}
                                    </span>
                                </div>
                                <div class="progress-container" style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                    <div class="progress-bar" style="width: ${avg.average}%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-blue-glow)); border-radius: 4px;"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section slide-up" style="margin-top: 48px; animation-delay: 0.2s;">
                <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Top Performers</h3>
                <div class="alerts-list" style="display: flex; flex-direction: column; gap: 12px;">
                    ${data.students.slice(0, 3).map((s, idx) => {
                        const isTop = idx === 0;
                        return `
                            <div class="alert-item premium" style="${isTop ? 'border-left: 4px solid var(--accent-amber); background: linear-gradient(90deg, rgba(245,158,11,0.05), transparent);' : ''}">
                                <div class="user-avatar" style="width: 46px; height: 46px; background: ${isTop ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; color: white; font-size: 18px; font-weight: 800;">
                                    ${s.name.charAt(0)}
                                </div>
                                <div class="alert-content">
                                    <p class="alert-msg" style="font-size: 16px; font-weight: 700; color: ${isTop ? 'var(--accent-amber)' : 'var(--text-primary)'};">${s.name}</p>
                                    <p class="user-role" style="font-size: 12px;">Consistently High Performance • Honor Roll</p>
                                </div>
                                <div class="badge" style="background: ${isTop ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'}; color: ${isTop ? 'var(--accent-amber)' : 'var(--accent-emerald)'}; font-size: 11px; padding: 6px 12px; font-weight: 700;">
                                    <i data-lucide="${isTop ? 'award' : 'star'}" style="width: 12px; height: 12px; margin-right: 4px; display: inline-block; vertical-align: middle;"></i> Rank #${idx + 1}
                                </div>
                            </div>
                        `;
                    }).join('')}
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
const EventsView = {
    render() {
        const data = StorageService.getData();
        const isAdmin = AuthService.isAdmin();
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up">
                <h2 style="font-size: 32px; font-weight: 700;">Campus Events</h2>
                <p>Stay updated with the latest happenings at Book Buddy.</p>
            </div>
            
            <div class="section slide-up" style="margin-top: 32px; animation-delay: 0.1s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin: 0;">Upcoming Events</h3>
                    ${isAdmin ? `<button class="btn-primary" style="padding: 10px 20px; font-size: 13px;" onclick="EventsView.showAddModal()"><i data-lucide="plus" style="width: 14px; height: 14px; margin-right: 6px; display: inline-block; vertical-align: middle;"></i> Schedule Event</button>` : ''}
                </div>
                <div class="alerts-list" style="display: flex; flex-direction: column; gap: 16px;">
                    ${data.events.map(e => `
                        <div class="alert-item premium">
                            <div class="alert-indicator" style="background: var(--accent-amber)"></div>
                            <div class="alert-icon-circle" style="background: rgba(245,158,11,0.1); color: var(--accent-amber);"><i data-lucide="calendar"></i></div>
                            <div class="alert-content">
                                <p class="alert-msg" style="font-size: 16px; font-weight: 700;">${e.title}</p>
                                <p class="user-role" style="font-size: 12px; margin-top: 2px;">${new Date(e.date).toLocaleDateString()} at ${e.time} • <span style="font-weight: 600;">${e.location}</span></p>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center;">
                                ${isAdmin ? `
                                    <button class="btn-ghost btn-sm" onclick="NotificationSystem.triggerUpdateBroadcast('Event', '${e.title}')"><i data-lucide="radio" style="width: 14px; height: 14px; margin-right: 6px;"></i> Broadcast</button>
                                    <button class="icon-btn btn-sm" onclick="EventsView.deleteEvent(${e.id})" title="Delete Event"><i data-lucide="trash-2" style="color: var(--accent-rose); width: 14px; height: 14px;"></i></button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') || '<div style="text-align: center; padding: 40px 0;"><p class="user-role">No upcoming events scheduled.</p></div>'}
                </div>
            </div>

            <div id="event-modal-overlay" class="payment-overlay" style="display: none; align-items: center; justify-content: center;">
                <div class="stat-card" style="width: 100%; max-width: 550px; padding: 40px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                        <h3 style="font-size: 24px; font-weight: 700;">Schedule New Event</h3>
                        <button class="icon-btn" onclick="document.getElementById('event-modal-overlay').style.display='none'"><i data-lucide="x"></i></button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Event Title</p>
                            <input type="text" id="ev-title" class="btn-ghost" style="width:100%; padding: 14px; font-size: 15px;" placeholder="e.g. Annual Day 2026">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Date</p>
                                <input type="date" id="ev-date" class="btn-ghost" style="width:100%; padding: 14px; font-size: 15px;">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Time</p>
                                <input type="time" id="ev-time" class="btn-ghost" style="width:100%; padding: 14px; font-size: 15px;">
                            </div>
                        </div>
                         <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Location</p>
                            <input type="text" id="ev-loc" class="btn-ghost" style="width:100%; padding: 14px; font-size: 15px;" placeholder="e.g. Main Auditorium">
                        </div>
                        <button class="btn-primary" style="margin-top: 12px; padding: 16px; font-weight: 700;" onclick="EventsView.addEvent()">
                            <i data-lucide="calendar-plus" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Create & Notify Members
                        </button>
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
window.BlueprintView = BlueprintView;
window.PerformanceView = PerformanceView;

const AdminInternsView = {
    render() {
        const data = StorageService.getData() || { interns: [] };
        const container = document.getElementById('view-container');
        container.innerHTML = `
            <div class="view-header slide-up" style="display: flex; align-items: center; gap: 24px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2 style="font-size: 28px; font-weight: 700;">Intern Management</h2>
                    <p>Track college interns and their parent contacts.</p>
                </div>
            </div>

            <div class="grid-responsive slide-up" style="gap: 32px; margin-top: 32px; animation-delay: 0.1s;">
                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Onboard New Intern</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Full Name</p>
                            <input type="text" id="int-name" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="e.g. John Doe">
                        </div>
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">College Name</p>
                            <input type="text" id="int-college" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="e.g. State University">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Intern Email</p>
                                <input type="email" id="int-email" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="john@email.com">
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Intern Phone</p>
                                <input type="tel" id="int-phone" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="+91 XXXXX XXXXX">
                            </div>
                        </div>
                        
                        <div style="margin: 16px 0; border-top: 1px dashed var(--glass-border);"></div>
                        
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 16px; text-transform: uppercase; color: var(--accent-amber);">Emergency / Parent Contact</p>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Parent Name</p>
                                    <input type="text" id="int-p-name" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="Parent Name">
                                </div>
                                <div>
                                    <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Parent Phone</p>
                                    <input type="tel" id="int-p-phone" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="+91 XXXXX XXXXX">
                                </div>
                            </div>
                        </div>

                        <button class="btn-primary" style="margin-top: 16px; padding: 16px; font-weight: 700;" onclick="AdminInternsView.addIntern()">
                            <i data-lucide="user-check" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Register Intern
                        </button>
                    </div>
                </div>

                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Active Interns</h3>
                    <div class="alerts-list" style="max-height: 550px; overflow-y: auto; padding-right: 12px; display: flex; flex-direction: column; gap: 12px;">
                        ${data.interns.map(i => `
                            <div class="alert-item premium">
                                <div class="alert-indicator" style="background: var(--accent-emerald)"></div>
                                <div class="user-avatar" style="width: 46px; height: 46px; background: var(--accent-emerald); flex-shrink: 0; font-size: 18px;">${i.name.charAt(0)}</div>
                                <div class="alert-content">
                                    <p class="alert-msg" style="font-size: 16px; font-weight: 700;">${i.name}</p>
                                    <p class="user-role" style="font-size: 12px; margin-bottom: 4px;">${i.collegeName} • <span style="color: var(--accent-blue);">${i.phone}</span></p>
                                    <p class="user-role font-xs" style="background: var(--bg-primary); padding: 6px 10px; border-radius: 6px; display: inline-block; border: 1px solid var(--glass-border);">
                                        <i data-lucide="shield" style="width: 10px; height: 10px; margin-right: 4px; display: inline-block; vertical-align: middle;"></i> Parent: ${i.parentName} (${i.parentPhone})
                                    </p>
                                </div>
                                <button class="icon-btn btn-sm" onclick="AdminInternsView.deleteIntern(${i.id})" title="Remove Intern">
                                    <i data-lucide="trash-2" style="color: var(--accent-rose); width: 16px; height: 16px;"></i>
                                </button>
                            </div>
                        `).join('') || '<div style="text-align: center; padding: 40px 0;"><p class="user-role">No interns registered.</p></div>'}
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
            <div class="view-header slide-up" style="display: flex; align-items: center; gap: 24px;">
                <button class="icon-btn" onclick="switchView('admin')"><i data-lucide="arrow-left"></i></button>
                <div>
                    <h2 style="font-size: 28px; font-weight: 700;">Class Schedule</h2>
                    <p>Manage the weekly timetable for all subjects.</p>
                </div>
            </div>

            <div class="grid-responsive slide-up" style="gap: 32px; margin-top: 32px; animation-delay: 0.1s;">
                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Add Weekly Slot</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div>
                            <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Subject Title</p>
                            <input type="text" id="cls-title" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;" placeholder="e.g. English Literature">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Day of Week</p>
                                <select id="cls-day" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px; cursor: pointer;">
                                    <option>Monday</option>
                                    <option>Tuesday</option>
                                    <option>Wednesday</option>
                                    <option>Thursday</option>
                                    <option>Friday</option>
                                    <option>Saturday</option>
                                </select>
                            </div>
                            <div>
                                <p class="user-role font-xs" style="margin-bottom: 8px; text-transform: uppercase;">Time slot</p>
                                <input type="time" id="cls-time" class="btn-ghost" style="width: 100%; padding: 14px; font-size: 15px;">
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 16px; padding: 16px; font-weight: 700;" onclick="AdminClassesView.addClass()">
                            <i data-lucide="calendar-plus" style="width: 18px; height: 18px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Save Schedule Slot
                        </button>
                    </div>
                </div>

                <div class="stat-card" style="padding: 32px;">
                    <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 24px;">Upcoming Timetable</h3>
                    <div class="alerts-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px;">
                        ${data.classes.map(c => `
                            <div class="alert-item premium">
                                <div class="alert-indicator" style="background: var(--accent-blue)"></div>
                                <div class="alert-icon-circle"><i data-lucide="book-open"></i></div>
                                <div class="alert-content">
                                    <p class="alert-msg" style="font-size: 16px; font-weight: 700;">${c.title}</p>
                                    <p class="user-role" style="font-size: 12px; margin-top: 2px;">${c.dayOfWeek} at <span style="font-weight: 600; color: var(--text-primary);">${c.time}</span></p>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <button class="btn-ghost btn-sm" onclick="AdminClassesView.notifyParents('${c.title}')">
                                        <i data-lucide="bell" style="width: 14px; height: 14px; margin-right: 6px;"></i> Remind
                                    </button>
                                    <button class="icon-btn btn-sm" onclick="AdminClassesView.deleteClass(${c.id})" title="Delete Slot">
                                        <i data-lucide="trash-2" style="color: var(--accent-rose); width: 14px; height: 14px;"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') || '<div style="text-align: center; padding: 40px 0;"><p class="user-role">No classes scheduled.</p></div>'}
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
    },

    notifyParents(classTitle) {
        const msg = `Greetings from Book Buddy! Hello Book Buddy Parents!\n\nIt's that time again!\nTurning regular reading into a lifelong habit is what we do best.\n\nOur scheduled ${classTitle} session is happening today.\n\nClass Time: 4:00 PM\n(Please arrange for pick-up promptly at 5:30 PM).\n\nLooking forward to another engaging hour of learning and fun!\nSee you soon at the library!`;
        
        if (confirm(`Send this session reminder to all parents? \n\nMessage: \n"${msg.substring(0, 100)}..."`)) {
            NotificationSystem.simulateSend('All Members', 'WhatsApp', 'Session Reminder', null, msg);
            NotificationSystem.toast(`${classTitle} reminder broadcast triggered!`, 'success');
        }
    }
};

window.EventsView = EventsView;
window.AdminInternsView = AdminInternsView;
window.AdminClassesView = AdminClassesView;

// Global Scheduler Service
const Scheduler = {
    init() {
        console.log("Scheduler Monitoring Active...");
        setInterval(() => this.checkDueMessages(), 30000); // Check every 30 seconds
        this.checkDueMessages(); // Initial check
    },

    checkDueMessages() {
        const data = StorageService.getData();
        if (!data || !data.scheduledMessages) return;

        const now = new Date();
        const due = data.scheduledMessages.find(m => m.status === 'pending' && new Date(m.time) <= now);

        if (due) {
            this.triggerAlert(due);
        }
    },

    triggerAlert(task) {
        if (document.getElementById('scheduler-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'scheduler-overlay';
        overlay.className = 'payment-overlay';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        overlay.innerHTML = `
            <div class="stat-card" style="width: 100%; max-width: 450px; padding: 40px; text-align: center; border: 2px solid var(--accent-amber); box-shadow: 0 0 50px rgba(245, 158, 11, 0.2);">
                <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--accent-amber); margin: 0 auto 24px; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="clock" style="width: 32px; height: 32px;"></i>
                </div>
                <h2 style="margin-bottom: 8px;">Scheduled Message Ready!</h2>
                <p class="user-role" style="margin-bottom: 24px;">The time you set has arrived.</p>
                
                <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); text-align: left; margin-bottom: 32px; border-left: 4px solid var(--accent-amber);">
                    <p style="font-size: 14px; line-height: 1.6; color: var(--text-primary); font-weight: 500;">${task.message}</p>
                </div>

                <div style="display: flex; gap: 12px;">
                    <button class="btn-primary" style="flex: 2; background: var(--accent-amber); height: 48px;" onclick="Scheduler.executeBroadcast(${task.id})">
                        <i data-lucide="send" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Broadcast Now
                    </button>
                    <button class="btn-ghost" style="flex: 1; height: 48px;" onclick="Scheduler.cancelTask(${task.id})">Skip</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        lucide.createIcons();
    },

    executeBroadcast(id) {
        const data = StorageService.getData();
        const task = (data.scheduledMessages || []).find(m => m.id === id);
        if (!task) return;

        NotificationSystem.simulateSend('All Members', 'WhatsApp', 'Scheduled Broadcast', null, task.message);
        this.markAsSent(id);
        this.close();
    },

    cancelTask(id) {
        if (confirm("Mark this task as skipped? It will be removed from the schedule.")) {
            this.markAsSent(id);
            this.close();
        }
    },

    markAsSent(id) {
        const data = StorageService.getData();
        const task = data.scheduledMessages.find(m => m.id === id);
        if (task) {
            task.status = 'sent';
            StorageService.saveData(data);
            if (document.getElementById('scheduled-list')) {
                AdminView.renderScheduledTasks();
            }
        }
    },

    close() {
        const overlay = document.getElementById('scheduler-overlay');
        if (overlay) overlay.remove();
    }
};

// Auto-init Scheduler
Scheduler.init();
window.Scheduler = Scheduler;
