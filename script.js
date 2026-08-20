// ============================================
// 📊 INVESTMENT DATA
// ============================================
const INVESTMENT_PACKAGES = {
    3000: { name: 'Bronze', dailyBonus: 500, monthlyReturn: 5 },
    10000: { name: 'Silver', dailyBonus: 1500, monthlyReturn: 8 },
    50000: { name: 'Gold', dailyBonus: 7500, monthlyReturn: 12 },
    100000: { name: 'Platinum', dailyBonus: 15000, monthlyReturn: 15 }
};

// ============================================
// 💾 LOCAL STORAGE FUNCTIONS
// ============================================
function getUsers() {
    return JSON.parse(localStorage.getItem('flowspg_users') || '[]');
}

function getInvestments() {
    return JSON.parse(localStorage.getItem('flowspg_investments') || '[]');
}

function getPayments() {
    return JSON.parse(localStorage.getItem('flowspg_payments') || '[]');
}

function getCheckins() {
    return JSON.parse(localStorage.getItem('flowspg_checkins') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('flowspg_users', JSON.stringify(users));
}

function saveInvestments(investments) {
    localStorage.setItem('flowspg_investments', JSON.stringify(investments));
}

function savePayments(payments) {
    localStorage.setItem('flowspg_payments', JSON.stringify(payments));
}

function saveCheckins(checkins) {
    localStorage.setItem('flowspg_checkins', JSON.stringify(checkins));
}

// ============================================
// 🔐 AUTHENTICATION FUNCTIONS
// ============================================
function registerUser(name, email, phone, password) {
    const users = getUsers();
    
    if (users.find(u => u.email === email || u.phone === phone)) {
        alert('User already exists! Please login.');
        return false;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        balance: 0,
        totalEarned: 0,
        streak: 0,
        lastCheckin: null,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    localStorage.setItem('flowspg_user', JSON.stringify(newUser));
    window.location.href = 'dashboard.html';
    return true;
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);
    
    if (user) {
        localStorage.setItem('flowspg_user', JSON.stringify(user));
        window.location.href = 'dashboard.html';
        return true;
    } else {
        alert('Invalid credentials!');
        return false;
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('flowspg_user') || 'null');
}

function logout() {
    localStorage.removeItem('flowspg_user');
    window.location.href = 'index.html';
}

// ============================================
// 📈 DASHBOARD FUNCTIONS
// ============================================
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userName').textContent = `Welcome, ${user.name}`;
    
    const investments = getInvestments().filter(i => i.userId === user.id);
    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    
    document.getElementById('totalBalance').textContent = `₦${totalInvested.toLocaleString()}`;
    document.getElementById('totalEarned').textContent = `₦${user.totalEarned.toLocaleString()}`;
    document.getElementById('streakCount').textContent = `${user.streak || 0} Days`;
    
    checkTodayBonus(user);
}

function checkTodayBonus(user) {
    const today = new Date().toDateString();
    const checkins = getCheckins().filter(c => c.userId === user.id);
    const todayCheckin = checkins.find(c => new Date(c.date).toDateString() === today);
    
    if (todayCheckin) {
        document.getElementById('todayBonus').textContent = `₦${todayCheckin.bonus.toLocaleString()}`;
    } else {
        document.getElementById('todayBonus').textContent = '₦0.00';
    }
}

// ============================================
// 💰 INVESTMENT FUNCTIONS
// ============================================
function selectPackage(amount) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }
    
    const pkg = INVESTMENT_PACKAGES[amount];
    if (!pkg) return;
    
    if (confirm(`Are you sure you want to invest ₦${amount.toLocaleString()} in the ${pkg.name} package?`)) {
        const investment = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            amount: amount,
            package: pkg.name,
            dailyBonus: pkg.dailyBonus,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        const investments = getInvestments();
        investments.push(investment);
        saveInvestments(investments);
        
        const payment = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            amount: amount,
            package: pkg.name,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        const payments = getPayments();
        payments.push(payment);
        savePayments(payments);
        
        alert(`✅ Investment of ₦${amount.toLocaleString()} created!\n\nSend payment to:\nBank: Access Bank\nAccount: 1234567890\nName: Flows PG Investment\n\nYour investment will be confirmed within 24 hours.`);
        
        loadDashboard();
    }
}

// ============================================
// ✅ DAILY CHECK-IN
// ============================================
function dailyCheckin() {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }
    
    const today = new Date().toDateString();
    const checkins = getCheckins();
    const todayCheckin = checkins.find(c => c.userId === user.id && new Date(c.date).toDateString() === today);
    
    if (todayCheckin) {
        document.getElementById('checkinMessage').textContent = '✅ You already checked in today! Come back tomorrow.';
        document.getElementById('checkinMessage').style.color = '#f0c040';
        return;
    }
    
    const investments = getInvestments().filter(i => i.userId === user.id && i.status === 'confirmed');
    if (investments.length === 0) {
        document.getElementById('checkinMessage').textContent = '❌ You need an active investment to check in!';
        document.getElementById('checkinMessage').style.color = '#ff4757';
        return;
    }
    
    const highestInvestment = investments.reduce((max, i) => i.amount > max.amount ? i : max);
    const bonus = highestInvestment.dailyBonus;
    
    const checkin = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        bonus: bonus,
        date: new Date().toISOString()
    };
    
    checkins.push(checkin);
    saveCheckins(checkins);
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex].balance += bonus;
        users[userIndex].totalEarned += bonus;
        users[userIndex].streak = (users[userIndex].streak || 0) + 1;
        users[userIndex].lastCheckin = new Date().toISOString();
        saveUsers(users);
        
        localStorage.setItem('flowspg_user', JSON.stringify(users[userIndex]));
    }
    
    document.getElementById('checkinMessage').textContent = `✅ Check-in successful! You earned ₦${bonus.toLocaleString()}!`;
    document.getElementById('checkinMessage').style.color = '#00d26a';
    
    setTimeout(() => loadDashboard(), 1500);
}

// ============================================
// 📝 FORM HANDLERS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirmPassword').value;
            
            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters!');
                return;
            }
            
            registerUser(name, email, phone, password);
        });
    }
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }
    
    if (document.querySelector('.dashboard-container')) {
        loadDashboard();
    }
});

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================
function formatCurrency(amount) {
    return '₦' + amount.toLocaleString();
}

function getDateString(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
