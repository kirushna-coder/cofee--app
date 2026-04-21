/**
 * CoFee App - Storage Service
 * Handles data persistence and mock data initialization.
 */

const STORAGE_KEYS = {
    COFEE_DATA: 'cofee_app_data',
    LAST_LOGIN: 'cofee_last_login',
    DATA_VERSION: 'cofee_data_version'
};

const CURRENT_VERSION = 14; // Increment this to force a re-sync for all users

const DEFAULT_DATA = {
    students: [
        { id: 1, name: "Arulmozhi Varman", parentName: "Sundara Chozhar", parentEmail: "parent1@example.com", parentPhone: "9876543210" },
        { id: 2, name: "Kavin Selvan", parentName: "Selvaraj", parentEmail: "parent2@example.com", parentPhone: "9876543211" },
        { id: 3, name: "Thamizhalagan", parentName: "Arivazhagan", parentEmail: "parent3@example.com", parentPhone: "9876543212" },
        { id: 4, name: "Yazhini K.", parentName: "Kumaresan", parentEmail: "parent4@example.com", parentPhone: "9876543213" },
        { id: 5, name: "Ilankumaran", parentName: "Ilango", parentEmail: "parent5@example.com", parentPhone: "9876543214" },
        { id: 6, name: "Senthamizhan", parentName: "Tamizharasan", parentEmail: "parent6@example.com", parentPhone: "9876543215" },
        { id: 7, name: "Mathivanan R.", parentName: "Rajendran", parentEmail: "parent7@example.com", parentPhone: "9876543216" },
        { id: 8, name: "Anbarasi", parentName: "Sivakumar", parentEmail: "parent8@example.com", parentPhone: "9876543217" },
        { id: 9, name: "Ezhilarasi", parentName: "Murugan", parentEmail: "parent9@example.com", parentPhone: "9876543218" },
        { id: 10, name: "Pugazhendhi V.", parentName: "Velmurugan", parentEmail: "parent10@example.com", parentPhone: "9876543219" },
        { id: 11, name: "Monisha", parentName: "Mohan", parentEmail: "parent11@example.com", parentPhone: "9677999526" },
        { id: 12, name: "Hemanandhini", parentName: "Meganathan", parentEmail: "parent12@example.com", parentPhone: "6381366517" }
    ],
    classes: [
        { id: 101, title: "Mathematics - Team 3", time: "2026-04-16T14:00:00", status: "upcoming" },
        { id: 102, title: "English Literature", time: "2026-04-17T11:00:00", status: "upcoming" }
    ],
    library: [
        { id: 201, studentId: 1, title: "The Great Gatsby", borrowedDate: "2026-04-01", dueDate: "2026-04-15", status: "overdue" },
        { id: 202, studentId: 2, title: "Clean Code", borrowedDate: "2026-04-10", dueDate: "2026-04-24", status: "borrowed" }
    ],
    fees: [
        { id: 301, studentId: 1, month: "April 2026", amount: 3000, dueDate: "2026-04-10", status: "unpaid" },
        { id: 302, studentId: 2, month: "April 2026", amount: 3000, dueDate: "2026-04-25", status: "pending" },
        { id: 303, studentId: 3, month: "April 2026", amount: 3000, dueDate: "2026-04-15", status: "unpaid" },
        { id: 304, studentId: 4, month: "April 2026", amount: 3000, dueDate: "2026-04-10", status: "paid" },
        { id: 305, studentId: 5, month: "April 2026", amount: 3000, dueDate: "2026-04-20", status: "unpaid" },
        { id: 306, studentId: 6, month: "April 2026", amount: 3000, dueDate: "2026-04-12", status: "unpaid" },
        { id: 307, studentId: 7, month: "April 2026", amount: 3000, dueDate: "2026-04-05", status: "pending" },
        { id: 308, studentId: 8, month: "April 2026", amount: 3000, dueDate: "2026-04-18", status: "paid" },
        { id: 309, studentId: 9, month: "April 2026", amount: 3000, dueDate: "2026-04-22", status: "unpaid" },
        { id: 310, studentId: 10, month: "April 2026", amount: 3000, dueDate: "2026-04-15", status: "unpaid" },
        { id: 311, studentId: 11, month: "April 2026", amount: 3000, dueDate: "2026-04-28", status: "pending" },
        { id: 312, studentId: 12, month: "April 2026", amount: 3000, dueDate: "2026-04-10", status: "unpaid" }
    ],
    worksheets: [
        { id: 401, title: "Algebra Basics", launched: "2026-04-15", difficulty: "Medium" },
        { id: 402, title: "Grammar Quiz", launched: "2026-04-14", difficulty: "Easy" }
    ],
    newspapers: [
        { id: 501, title: "Daily News - April 16", launched: "2026-04-16T08:00:00", url: "#" }
    ],
    attendance: [], // Populated by admin
    attendanceRecords: [
        { date: "2026-04-10", studentId: 1, status: "present" },
        { date: "2026-04-10", studentId: 2, status: "absent" },
        { date: "2026-04-10", studentId: 3, status: "present" },
        { date: "2026-04-10", studentId: 4, status: "present" },
        { date: "2026-04-10", studentId: 5, status: "present" },
        { date: "2026-04-10", studentId: 6, status: "present" },
        { date: "2026-04-10", studentId: 7, status: "present" },
        { date: "2026-04-10", studentId: 8, status: "present" },
        { date: "2026-04-10", studentId: 9, status: "present" },
        { date: "2026-04-10", studentId: 10, status: "present" },
        { date: "2026-04-10", studentId: 11, status: "present" },
        { date: "2026-04-10", studentId: 12, status: "present" },
        { date: "2026-04-11", studentId: 1, status: "present" },
        { date: "2026-04-11", studentId: 2, status: "present" },
        { date: "2026-04-11", studentId: 11, status: "present" }
    ],
    performanceMetrics: [
        { studentId: 1, subject: "Mathematics", score: 88, max: 100 },
        { studentId: 1, subject: "English", score: 92, max: 100 },
        { studentId: 1, subject: "Science", score: 85, max: 100 },
        { studentId: 2, subject: "Mathematics", score: 75, max: 100 },
        { studentId: 2, subject: "English", score: 80, max: 100 },
        { studentId: 2, subject: "Science", score: 78, max: 100 },
        { studentId: 3, subject: "Mathematics", score: 90, max: 100 },
        { studentId: 4, subject: "Mathematics", score: 82, max: 100 },
        { studentId: 5, subject: "Mathematics", score: 70, max: 100 },
        { studentId: 11, subject: "Mathematics", score: 95, max: 100 },
        { studentId: 11, subject: "English", score: 88, max: 100 },
        { studentId: 11, subject: "Science", score: 91, max: 100 },
        { studentId: 12, subject: "Mathematics", score: 85, max: 100 }
    ],
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
