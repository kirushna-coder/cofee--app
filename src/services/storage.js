/**
 * CoFee App - Storage Service
 * Handles data persistence and mock data initialization.
 */

const STORAGE_KEYS = {
    COFEE_DATA: 'cofee_app_data',
    LAST_LOGIN: 'cofee_last_login',
    DATA_VERSION: 'cofee_data_version'
};

const CURRENT_VERSION = 18; // Increment this to force a re-sync for all users

const DEFAULT_DATA = {
    students: [
        { id: 1, name: "Maghizini", parentName: "Meena", parentEmail: "meena@example.com", parentPhone: "8072200903", grade: "Grade 1", schoolName: "Primary School A", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 2, name: "Dheeran", parentName: "Meena", parentEmail: "meena2@example.com", parentPhone: "8072200903", grade: "Grade 4", schoolName: "Primary School A", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 3, name: "Rogit Mithran", parentName: "Sangeetha", parentEmail: "sangeetha@example.com", parentPhone: "9841840616", grade: "Grade 4", schoolName: "High School B", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 4, name: "Jagat Mithran", parentName: "Sangeetha", parentEmail: "sangeetha2@example.com", parentPhone: "9841840616", grade: "Grade 1", schoolName: "High School B", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 5, name: "Vidhaarth", parentName: "Revathi", parentEmail: "revathi@example.com", parentPhone: "9962197126", grade: "Grade 4", schoolName: "Central Academy", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 6, name: "Ria Francis", parentName: "Jennifer", parentEmail: "jennifer@example.com", parentPhone: "8124606410", grade: "Grade 2", schoolName: "St. Joseph's", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 7, name: "Nandeesh", parentName: "Sudha", parentEmail: "sudha@example.com", parentPhone: "9790864746", grade: "Grade 5", schoolName: "Primary School A", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 8, name: "Naresh", parentName: "Naresh", parentEmail: "naresh@example.com", parentPhone: "8825778534", grade: "Grade 12", schoolName: "Model High", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 9, name: "Pragadeesh", parentName: "Sudha", parentEmail: "sudha2@example.com", parentPhone: "9790864746", grade: "Grade 7", schoolName: "Primary School A", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 10, name: "Saravin", parentName: "Revathi", parentEmail: "revathi2@example.com", parentPhone: "9962197126", grade: "Grade 9", schoolName: "Central Academy", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 11, name: "Pavana", parentName: "Suveetha", parentEmail: "suveetha@example.com", parentPhone: "9500090239", grade: "Grade 7", schoolName: "Global International", isLibraryMember: false, subscriptionPlan: "None" },
        { id: 12, name: "Aaric", parentName: "Jennifer", parentEmail: "jennifer2@example.com", parentPhone: "8124606410", grade: "Grade 5", schoolName: "St. Joseph's", isLibraryMember: false, subscriptionPlan: "None" }
    ],
    classes: [
        { id: 101, title: "English", dayOfWeek: "Tuesday", time: "16:00", grade: "all", status: "upcoming" }
    ],
    interns: [
        { id: 801, name: "Intern Demo", email: "intern@example.com", phone: "9000000000", collegeName: "State Engineering College", parentName: "Demo Parent", parentPhone: "9111111111", schoolName: "Book Buddy Academy" }
    ],
    library: [],
    fees: [],
    worksheets: [
        { id: 401, title: "English Grammar Basics", launched: "2026-04-20", difficulty: "Easy" }
    ],
    newspapers: [
        { id: 501, title: "Daily News - April 21", launched: "2026-04-21T08:00:00", url: "#" }
    ],
    events: [],
    arrivals: [],
    attendance: [],
    attendanceRecords: [],
    performanceMetrics: [],
    users: [
        { id: 'admin', username: 'admin', password: 'p', role: 'admin', name: 'Admin User' }
    ]
};

const StorageService = {
    init() {
        const existingData = localStorage.getItem(STORAGE_KEYS.COFEE_DATA);
        const storedVersion = parseInt(localStorage.getItem(STORAGE_KEYS.DATA_VERSION) || "0");

        if (!existingData || storedVersion < CURRENT_VERSION) {
            localStorage.setItem(STORAGE_KEYS.COFEE_DATA, JSON.stringify(DEFAULT_DATA));
            localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_VERSION.toString());
            console.log(`Storage synchronized to version ${CURRENT_VERSION}`);
        }
        
        // Track last login for inactivity reminder
        const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
        const now = Date.now();
        localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, now.toString());
        
        return lastLogin ? parseInt(lastLogin) : now;
    },

    getData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.COFEE_DATA));
    },

    saveData(data) {
        localStorage.setItem(STORAGE_KEYS.COFEE_DATA, JSON.stringify(data));
    },

    updateCollection(key, newItem) {
        const data = this.getData();
        if (data[key]) {
            data[key].unshift(newItem); // Add to beginning
            this.saveData(data);
        }
    },

    removeFromCollection(key, id) {
        const data = this.getData();
        if (data[key]) {
            data[key] = data[key].filter(item => item.id !== id);
            this.saveData(data);
            return true;
        }
        return false;
    },

    getInactivityStatus() {
        const lastLogin = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_LOGIN));
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        return (Date.now() - lastLogin) > oneWeek;
    }
};

window.StorageService = StorageService;
