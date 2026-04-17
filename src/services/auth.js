/**
 * CoFee App - Authentication Service
 * Manages user sessions and login status.
 */

const AuthService = {
    USER_SESSION_KEY: 'cofee_user_session',

    login(username, password) {
        const data = StorageService.getData();
        if (!data || !data.users) {
            console.error('Auth failure: User data not found in storage.');
            return { success: false, message: 'System error: Data not initialized.' };
        }
        
        const user = data.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Remove sensitive password from session data
            const sessionData = { ...user };
            delete sessionData.password;
            
            sessionStorage.setItem(this.USER_SESSION_KEY, JSON.stringify(sessionData));
            console.log(`User ${username} logged in successfully.`);
            return { success: true, user: sessionData };
        }
        
        return { success: false, message: 'Invalid username or password' };
    },

    register(name, username, password) {
        const data = StorageService.getData();
        
        // Check if username exists
        if (data.users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: 'u' + Date.now(),
            name,
            username,
            password,
            role: 'user' // Default role
        };

        data.users.push(newUser);
        StorageService.saveData(data);

        return { success: true, message: 'Registration successful! Please login.' };
    },

    logout() {
        sessionStorage.removeItem(this.USER_SESSION_KEY);
        window.location.reload(); // Refresh to clear all app state
    },

    getUser() {
        const session = sessionStorage.getItem(this.USER_SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    isAuthenticated() {
        return this.getUser() !== null;
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
};

window.AuthService = AuthService;
