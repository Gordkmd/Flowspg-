// ============================================
// 🔐 ADMIN AUTHENTICATION
// ============================================
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'flowspg2026' // Change this!
};

// ============================================
// 📊 ADMIN DASHBOARD
// ============================================
function loadAdminDashboard() {
    if (!localStorage.getItem('flowspg_admin')) {
        const username = prompt('Enter Admin Username:');
        const password = prompt('Enter Admin Password:');
        
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            localStorage.setItem('flowspg_admin', 'true');
        } else {
            alert('Invalid credentials!');
            window.location.href = 'index.html';
            return;
        }
    }
    
    const users = JSON.parse(localStorage.getItem('flowspg_users') || '[]');
    const investments = JSON.parse(localStorage.getItem('flowspg_investments') || '[]');
    const payments = JSON.parse(localStorage.getItem('flowspg_payments') || '[]');
    const checkins = JSON.parse(localStorage.getItem('flowspg_checkins') || '[]');
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalInvestments').textContent = '₦' + investments.reduce((sum, i) => sum + i.amount, 0).toLocaleString();
    document.getElementById('pendingPayments').textContent = payments.filter(p => p.status === 'pending').length;
    document.getElementById('totalCheckins').textContent = checkins.length;
    
    loadUsersList(users);
    loadInvestmentsList(investments);
    loadPaymentsList(payments);
    loadCheckinsList(checkins);
}

// ============================================
// 👥 USERS LIST
// ============================================
function loadUsersList(users) {
    const container = document.getElementById('usersList');
    if (users.length === 0) {
        container.innerHTML = '<p>No users registered yet.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Balance</th>
                    <th>Streak</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>₦${(user.balance || 0).toLocaleString()}</td>
                <td>${user.streak || 0} days</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================
// 💼 INVESTMENTS LIST
// ============================================
function loadInvestmentsList(investments) {
    const container = document.getElementById('investmentsList');
    if (investments.length === 0) {
        container.innerHTML = '<p>No investments yet.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Daily Bonus</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    investments.forEach(inv => {
        const statusClass = inv.status === 'confirmed' ? 'status-paid' : 'status-pending';
        html += `
            <tr>
                <td>${inv.userName}</td>
                <td>${inv.package}</td>
                <td>₦${inv.amount.toLocaleString()}</td>
                <td>₦${inv.dailyBonus.toLocaleString()}</td>
                <td class="${statusClass}">${inv.status.toUpperCase()}</td>
                <td>${new Date(inv.date).toLocaleDateString()}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================
// 💳 PAYMENTS LIST (Admin Confirmation)
// ============================================
function loadPaymentsList(payments) {
    const container = document.getElementById('paymentsList');
    const pending = payments.filter(p => p.status === 'pending');
    
    if (pending.length === 0) {
        container.innerHTML = '<p>No pending payments.</p>';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    pending.forEach(payment => {
        html += `
            <tr>
                <td>${payment.userName}</td>
                <td>${payment.package}</td>
                <td>₦${payment.amount.toLocaleString()}</td>
                <td class="status-pending">PENDING</td>
                <td>${new Date(payment.date).toLocaleDateString()}</td>
                <td>
                    <button class="btn-confirm" onclick="confirmPayment(${payment.id})">
                        ✅ Confirm
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================
// ✅ CONFIRM PAYMENT (Admin Only)
// ============================================
function confirmPayment(paymentId) {
    if (!confirm('Confirm this payment? The user will get their investment activated.')) return;
    
    const payments = JSON.parse(localStorage.getItem('flowspg_payments') || '[]');
    const payment = payments.find(p => p.id === paymentId);
    
    if (!payment) {
        alert('Payment not found!');
        return;
    }
    
    payment.status = 'confirmed';
    savePayments(payments);
    
    const investments = JSON.parse(localStorage.getItem('flowspg_investments') || '[]');
    const investment = investments.find(i => i.userId === payment.userId && i.amount === payment.amount);
    if (investment) {
        investment.status = 'confirmed';
        saveInvestments(investments);
    }
    
    const users = JSON.parse(localStorage.getItem('flowspg_users') || '[]');
    const user = users.find(u => u.id === payment.userId);
    if (user) {
        user.balance = (user.balance || 0) + payment.amount;
        saveUsers(users);
    }
    
    alert(`✅ Payment of ₦${payment.amount.toLocaleString()} confirmed for ${payment.userName}!`);
    
    loadAdminDashboard();
}

// ============================================
// ✅ CHECK-INS LIST
// ============================================
function loadCheckinsList(checkins) {
    const container = document.getElementById('checkinsList');
    if (checkins.length === 0) {
        container.innerHTML = '<p>No check-ins yet.</p>';
        return;
    }
    
    const recent = checkins.slice(-50).reverse();
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>User</th>
                    <th>Bonus Earned</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recent.forEach(checkin => {
        html += `
            <tr>
                <td>${checkin.userName || 'Unknown'}</td>
                <td>₦${checkin.bonus.toLocaleString()}</td>
                <td>${new Date(checkin.date).toLocaleString()}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============================================
// 📂 SECTION NAVIGATION
// ============================================
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(el => {
        el.classList.remove('active');
    });
    
    const target = document.getElementById(`section-${section}`);
    if (target) {
        target.classList.add('active');
    }
    
    document.querySelectorAll('.admin-sidebar a').forEach(el => {
        el.classList.remove('active');
        if (el.textContent.toLowerCase().includes(section)) {
            el.classList.add('active');
        }
    });
}

// ============================================
// 🚀 INITIALIZE ADMIN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.admin-container')) {
        loadAdminDashboard();
    }
});

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================
function savePayments(payments) {
    localStorage.setItem('flowspg_payments', JSON.stringify(payments));
}

function saveInvestments(investments) {
    localStorage.setItem('flowspg_investments', JSON.stringify(investments));
}

function saveUsers(users) {
    localStorage.setItem('flowspg_users', JSON.stringify(users));
}
