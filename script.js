// ============================================
// 🏦 BANK DETAILS - EDIT YOUR INFO HERE
// ============================================
const BANK_DETAILS = {
    bankName: 'Access Bank',
    holderName: 'kamadioyepeter',
    accountNumber: '1501533082'  // <-- YOUR ACCOUNT NUMBER
};

// ============================================
// 💳 DISPLAY BANK DETAILS ON DASHBOARD
// ============================================
function showBankDetails() {
    // Update bank details on the page
    const bankNameEl = document.getElementById('bankName');
    const holderNameEl = document.getElementById('accHolderName');
    const accNumberEl = document.getElementById('accNumber');
    
    if (bankNameEl) bankNameEl.textContent = BANK_DETAILS.bankName;
    if (holderNameEl) holderNameEl.textContent = BANK_DETAILS.holderName;
    if (accNumberEl) {
        accNumberEl.textContent = BANK_DETAILS.accountNumber;
        // Make it extra visible with styling
        accNumberEl.style.fontSize = '28px';
        accNumberEl.style.fontWeight = 'bold';
        accNumberEl.style.color = '#d32f2f';
        accNumberEl.style.background = '#fff3e0';
        accNumberEl.style.padding = '4px 12px';
        accNumberEl.style.borderRadius = '6px';
        accNumberEl.style.display = 'inline-block';
        accNumberEl.style.letterSpacing = '2px';
    }
}

// ============================================
// 📋 COPY ACCOUNT NUMBER
// ============================================
function copyAccountNumber() {
    const accNumber = BANK_DETAILS.accountNumber;
    
    // Modern copy method
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(accNumber)
            .then(() => {
                showCopyNotification('✅ Account number copied: ' + accNumber);
            })
            .catch(() => {
                fallbackCopy(accNumber);
            });
    } else {
        fallbackCopy(accNumber);
    }
}

// ============================================
// 🔄 FALLBACK COPY METHOD
// ============================================
function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    tempInput.style.top = '-100px';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showCopyNotification('✅ Account number copied: ' + text);
}

// ============================================
// 🔔 COPY NOTIFICATION
// ============================================
function showCopyNotification(message) {
    // Check if notification already exists
    let notification = document.getElementById('copyNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'copyNotification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.background = '#1a56db';
        notification.style.color = 'white';
        notification.style.padding = '15px 30px';
        notification.style.borderRadius = '10px';
        notification.style.fontSize = '18px';
        notification.style.fontWeight = 'bold';
        notification.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        notification.style.zIndex = '9999';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    clearTimeout(notification._timeout);
    notification._timeout = setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
}

// ============================================
// 🏦 GET BANK DETAILS (for use in other functions)
// ============================================
function getBankDetails() {
    return BANK_DETAILS;
}

// ============================================
// 📊 SHOW BANK DETAILS IN INVESTMENT CONFIRMATION
// ============================================
// Override the selectPackage function to include bank details
// This adds bank details to the investment confirmation
const originalSelectPackage = selectPackage;
selectPackage = function(amount) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login first!');
        window.location.href = 'login.html';
        return;
    }
    
    const pkg = INVESTMENT_PACKAGES[amount];
    if (!pkg) return;
    
    const confirmMsg = `Are you sure you want to invest ₦${amount.toLocaleString()} in the ${pkg.name} package?

💰 Investment Details:
• Package: ${pkg.name}
• Amount: ₦${amount.toLocaleString()}
• Daily Bonus: ₦${pkg.dailyBonus.toLocaleString()}

🏦 Send payment to:
• Bank: ${BANK_DETAILS.bankName}
• Account Name: ${BANK_DETAILS.holderName}
• Account Number: ${BANK_DETAILS.accountNumber}

⚠️ Your investment will be confirmed within 24 hours after payment.`;

    if (confirm(confirmMsg)) {
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
        
        alert(`✅ Investment of ₦${amount.toLocaleString()} created!

📌 Send payment to:
🏦 Bank: ${BANK_DETAILS.bankName}
👤 Account: ${BANK_DETAILS.holderName}
🔢 Account Number: ${BANK_DETAILS.accountNumber}

⏳ Your investment will be confirmed within 24 hours.`);
        
        // Scroll to payment details
        const paymentSection = document.getElementById('paymentDetails');
        if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        loadDashboard();
    }
};

// ============================================
// 🚀 INITIALIZE BANK DETAILS ON PAGE LOAD
// ============================================
// Add bank details loading to the existing DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Show bank details if on dashboard
    if (document.querySelector('.dashboard-container')) {
        showBankDetails();
    }
});

// ============================================
// 📱 SHOW PAYMENT INSTRUCTIONS (for admin/confirmation)
// ============================================
function showPaymentInstructions(amount, packageName) {
    return `
💳 PAYMENT INSTRUCTIONS

Package: ${packageName}
Amount: ₦${amount.toLocaleString()}

🏦 Bank Details:
• Bank: ${BANK_DETAILS.bankName}
• Account Name: ${BANK_DETAILS.holderName}
• Account Number: ${BANK_DETAILS.accountNumber}

📝 Please send EXACT amount of ₦${amount.toLocaleString()}
⏳ Confirmation within 24 hours
📸 Keep your transaction receipt
    `;
}
