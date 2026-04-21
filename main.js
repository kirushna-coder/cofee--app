/**
 * CoFee App - Main Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Storage
    const lastLoginTime = StorageService.init();
    
    // 2. Auth Check
    if (!AuthService.isAuthenticated()) {
        switchView('login');
        return; // Stop initialization of main app
    }

    // 3. Update User Info in Top Nav
    const user = AuthService.getUser();
    if (user) {
        document.getElementById('nav-user-avatar').textContent = user.name.split(' ').map(n => n[0]).join('');
    }

    // 4. Initialize UI Components
    lucide.createIcons();
    
    // 5. Setup Navigation
    const isAdmin = AuthService.isAdmin();
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const view = item.getAttribute('data-view');
        
        // Hide Admin Panel from nav for non-admins (Students stays visible but view is guarded)
        if (view === 'admin' && !isAdmin) {
            item.style.display = 'none';
        }

        item.addEventListener('click', () => {
            switchView(view);
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Mobile Menu Toggle - Slide Down
    const menuToggle = document.getElementById('menu-toggle');
    const navDropdown = document.getElementById('nav-dropdown');

    if (menuToggle && navDropdown) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navDropdown.classList.toggle('show');
        });

        // Close menu when clicking a nav item
        const navLinks = navDropdown.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navDropdown.classList.remove('show');
            });
        });
    }

    // Close menu when clicking outside
    window.addEventListener('click', () => {
        if (navDropdown) navDropdown.classList.remove('show');
    });

    // 4. Check for Inactivity
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastLoginTime > oneWeek) {
        NotificationSystem.toast("Welcome back! You haven't logged in for a week. Let's catch up!", 'warning');
    }

    // Notification Toggle
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
            NotificationSystem.refreshDropdown();
        });
    }

    // Close dropdown on outside click
    window.addEventListener('click', () => {
        if (notifDropdown) notifDropdown.classList.remove('show');
    });

    // Initialize Badge
    NotificationSystem.updateBadge();

    // 5. Theme Toggle Logic
    const themeBtn = document.getElementById('theme-btn');
    const body = document.body;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('cofee_theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        updateThemeIcon('sun');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
                localStorage.setItem('cofee_theme', 'light');
                updateThemeIcon('sun');
            } else {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
                localStorage.setItem('cofee_theme', 'dark');
                updateThemeIcon('moon');
            }
        });
    }

    function updateThemeIcon(iconName) {
        themeBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lucide.createIcons();
    }

    // Default View
    switchView('dashboard');
});

function switchView(view, params = null) {
    console.log(`Switching to view: ${view}`, params);
    const container = document.getElementById('view-container');
    
    if (view === 'login') {
        LoginView.render();
        return;
    }

    container.className = 'view-content fade-in';
    
    switch(view) {
        case 'dashboard':
            Dashboard.render();
            break;
        case 'library':
            LibraryView.render();
            break;
        case 'fees':
            FeesView.render();
            break;
        case 'worksheets':
            WorksheetsView.render();
            break;
        case 'newspapers':
            NewspapersView.render();
            break;
        case 'blueprint':
            BlueprintView.render();
            break;
        case 'performance':
            PerformanceView.render();
            break;
        case 'students':
            StudentsView.render();
            break;
        case 'profile':
            ProfileView.render(params);
            break;
        case 'admin':
            AdminView.render();
            break;
        case 'admin-students':
            AdminStudentsView.render();
            break;
        case 'admin-users':
            AdminUsersView.render();
            break;
        case 'events':
            EventsView.render();
            break;
        default:
            container.innerHTML = '<h2>Coming Soon</h2>';
    }
}
