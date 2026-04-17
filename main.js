/**
 * CoFee App - Main Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Storage
    const lastLoginTime = StorageService.init();
    
    // 2. Initialize UI Components
    lucide.createIcons();
    
    // 3. Setup Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            switchView(view);
            
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
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

    // Default View
    switchView('dashboard');
});

function switchView(view, params = null) {
    console.log(`Switching to view: ${view}`, params);
    const container = document.getElementById('view-container');
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
        case 'students':
            StudentsView.render();
            break;
        case 'profile':
            ProfileView.render(params);
            break;
        case 'admin':
            AdminView.render();
            break;
        default:
            container.innerHTML = '<h2>Coming Soon</h2>';
    }
}
