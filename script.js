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
// 🔑 FORGOT PASSWORD FUNCTIONS
// ============================================
function sendResetLink() {
    const email = document.getElementById('resetEmail').value.trim();
    const users = getUsers();
    const user = users.find(u => u.email === email || u.phone === email);
    
    const messageDiv = document.getElementById('resetMessage');
    
    if (!user) {
        messageDiv.style.display = 'block';
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
        messageDiv.innerHTML = '❌ No account found with this email or phone number.';
        return;
    }
    
    // Store the user's email for password reset
    localStorage.setItem('flowspg_reset_email', user.email);
    
    messageDiv.style.display = 'block';
    messageDiv.style.background = '#d4edda';
    messageDiv.style.color = '#155724';
    messageDiv.style.border = '1px solid #c3e6cb';
    messageDiv.innerHTML = '✅ Reset link sent! <a href="reset-password.html" style="color: #1a56db; font-weight: bold;">Click here to reset your password</a>';
}

function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    const resetEmail = localStorage.getItem('flowspg_reset_email');
    
    if (!resetEmail) {
        alert('Session expired. Please request a new reset link.');
        window.location.href = 'forgot-password.html';
        return;
    }
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters!');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === resetEmail);
    
    if (userIndex === -1) {
        alert('User not found. Please try again.');
        return;
    }
    
    // Update password
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    // Clear reset session
    localStorage.removeItem('flowspg_reset_email');
    
    const successDiv = document.getElementById('resetSuccess');
    successDiv.style.display = 'block';
    successDiv.innerHTML = '✅ Password reset successfully! You can now <a href="login.html" style="color: #1a56db; font-weight: bold;">login with your new password</a>.';
    
    // Clear form
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
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
        
        alert(`✅ Investment of ₦${amount.toLocaleString()} created!\n\nSend payment to your bank details shown below.\n\nYour investment will be confirmed within 24 hours.`);
        
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
        document.getElementById('checkinMessage').style.color = '#f0a030';
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
    document.getElementById('checkinMessage').style.color = '#1a56db';
    
    setTimeout(() => loadDashboard(), 1500);
}

// ============================================
// 📝 FORM HANDLERS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Register Form
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
    
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }
    
    // Forgot Password Form
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendResetLink();
        });
    }
    
    // Reset Password Form
    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetPassword();
        });
    }
    
    // Load dashboard if on dashboard page
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
