/***********************
 * CONSTANTS
 ***********************/
const USER_KEY = "currentUser";
const USERS_KEY = "users";
const CART_KEY = "cart";
const ORDERS_KEY = "orders";

/***********************
 * DOM READY
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
    renderUserArea();
    updateCartCount();
    renderCart();

    const btnCart = document.getElementById("btnCart");
    if (btnCart) btnCart.addEventListener("click", renderCart);

    initAuth();
    initCart();
    initCheckout();
});

/***********************
 * AUTH
 ***********************/
function initAuth() {
    const authForm = document.getElementById("authForm");
    if (!authForm) return;

    const toggleAuth = document.getElementById("toggleAuth");
    const authTitle = document.getElementById("authTitle");
    const authNameWrapper = document.getElementById("authNameWrapper");
    const authName = document.getElementById("authName");
    const authUsername = document.getElementById("authUsername");
    const authPassword = document.getElementById("authPassword");
    const authConfirmPasswordWrapper = document.getElementById("authConfirmPasswordWrapper");
    const authConfirmPassword = document.getElementById("authConfirmPassword");
    const authPasswordInfo = document.getElementById("authPasswordInfo");

    let isLogin = true;

    window.openAuthModal = () => {
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modalAuth")
        ).show();
    };

    toggleAuth.onclick = e => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.innerText = isLogin ? "Đăng nhập" : "Đăng ký";
        toggleAuth.innerText = isLogin
            ? "Chưa có tài khoản? Đăng ký"
            : "Đã có tài khoản? Đăng nhập";
        authNameWrapper.style.display = isLogin ? "none" : "block";
        
        // Show/hide additional fields for registration
        const authAddressWrapper = document.getElementById('authAddressWrapper');
        const authPhoneWrapper = document.getElementById('authPhoneWrapper');
        if (authAddressWrapper) authAddressWrapper.style.display = isLogin ? "none" : "block";
        if (authPhoneWrapper) authPhoneWrapper.style.display = isLogin ? "none" : "block";
        
        // Show/hide password confirmation and info for registration
        if (authConfirmPasswordWrapper) authConfirmPasswordWrapper.style.display = isLogin ? "none" : "block";
        if (authPasswordInfo) authPasswordInfo.style.display = isLogin ? "none" : "block";
        
        // Clear form
        authUsername.value = '';
        authPassword.value = '';
        if (authName) authName.value = '';
        if (authConfirmPassword) authConfirmPassword.value = '';
        const authAddress = document.getElementById('authAddress');
        const authPhone = document.getElementById('authPhone');
        if (authAddress) authAddress.value = '';
        if (authPhone) authPhone.value = '';
        
        // Reset validation styles
        authPassword.classList.remove('is-valid', 'is-invalid');
        if (authConfirmPassword) authConfirmPassword.classList.remove('is-valid', 'is-invalid');
        const passwordError = document.getElementById('authPasswordError');
        const confirmPasswordError = document.getElementById('authConfirmPasswordError');
        if (passwordError) passwordError.style.display = 'none';
        if (confirmPasswordError) confirmPasswordError.style.display = 'none';
    };

    // Add real-time password validation for registration
    if (authPassword && authConfirmPassword) {
        authPassword.addEventListener('input', validateRegistrationPassword);
        authConfirmPassword.addEventListener('input', validateRegistrationPassword);
    }

    function validateRegistrationPassword() {
        if (isLogin) return; // Only validate during registration
        
        const password = authPassword.value;
        const confirmPassword = authConfirmPassword.value;
        const passwordError = document.getElementById('authPasswordError');
        const confirmPasswordError = document.getElementById('authConfirmPasswordError');
        
        // Reset styles and errors
        authPassword.classList.remove('is-valid', 'is-invalid');
        authConfirmPassword.classList.remove('is-valid', 'is-invalid');
        if (passwordError) passwordError.style.display = 'none';
        if (confirmPasswordError) confirmPasswordError.style.display = 'none';
        
        // Validate password length
        if (password.length > 0) {
            if (password.length >= 6) {
                authPassword.classList.add('is-valid');
            } else {
                authPassword.classList.add('is-invalid');
                if (passwordError) {
                    passwordError.style.display = 'block';
                    passwordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự';
                }
            }
        }
        
        // Validate password confirmation
        if (confirmPassword.length > 0) {
            if (password === confirmPassword && password.length >= 6) {
                authConfirmPassword.classList.add('is-valid');
            } else {
                authConfirmPassword.classList.add('is-invalid');
                if (confirmPasswordError) {
                    confirmPasswordError.style.display = 'block';
                    if (password.length < 6) {
                        confirmPasswordError.textContent = 'Vui lòng nhập mật khẩu hợp lệ trước';
                    } else {
                        confirmPasswordError.textContent = 'Mật khẩu xác nhận không khớp';
                    }
                }
            }
        }
    }

    authForm.onsubmit = e => {
        e.preventDefault();
        const username = authUsername.value.trim();
        const password = authPassword.value.trim();
        let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

        // Tự động tạo tài khoản admin nếu chưa có (trừ khi đã reset dữ liệu)
        if (!users.find(u => u.username === 'admin') && localStorage.getItem('preventSampleData') !== 'true') {
            users.push({
                name: 'Administrator',
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }

        if (isLogin) {
            const user = users.find(u => {
                if (u.username === username) {
                    // Support both old plain password and new hashed password
                    if (u.passwordHash) {
                        return verifyPassword(password, u.passwordHash);
                    } else {
                        return u.password === password;
                    }
                }
                return false;
            });
            
            if (!user) return alert("Sai tài khoản hoặc mật khẩu");
            
            // Không cho phép đăng nhập admin từ modal header
            if (user.username === 'admin' || user.role === 'admin') {
                alert("❌ Không thể đăng nhập Admin từ đây!\n\n🔐 Vui lòng sử dụng link 'Admin Panel' ở cuối trang để đăng nhập Admin.");
                return;
            }
            
            // Migrate old password to hashed password if needed
            if (!user.passwordHash && user.password) {
                user.passwordHash = hashPassword(user.password);
                user.password = undefined; // Remove plain password
                
                // Update in localStorage
                const userIndex = users.findIndex(u => u.username === username);
                if (userIndex !== -1) {
                    users[userIndex] = user;
                    localStorage.setItem(USERS_KEY, JSON.stringify(users));
                }
            }
            
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
            const name = authName.value.trim();
            const address = document.getElementById('authAddress')?.value.trim() || '';
            const phone = document.getElementById('authPhone')?.value.trim() || '';
            const confirmPassword = authConfirmPassword ? authConfirmPassword.value.trim() : '';
            
            if (!name) return alert("Vui lòng nhập họ tên");
            if (users.some(u => u.username === username))
                return alert("Tên đăng nhập đã tồn tại");
            
            // Validate password
            if (password.length < 6) {
                alert("Mật khẩu phải có ít nhất 6 ký tự!");
                return;
            }
            
            // Validate password confirmation
            if (password !== confirmPassword) {
                alert("Mật khẩu và xác nhận mật khẩu không khớp!");
                return;
            }

            const newUser = { 
                name, 
                username, 
                password: undefined, // Don't store plain password
                passwordHash: hashPassword(password), // Store hashed password
                role: 'user',
                address: address,
                phone: phone
            };
            users.push(newUser);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        }

        bootstrap.Modal.getInstance(
            document.getElementById("modalAuth")
        ).hide();

        renderUserArea();
    };
}

function renderUserArea() {
    const userArea = document.getElementById("userArea");
    if (!userArea) return;

    const user = JSON.parse(localStorage.getItem(USER_KEY));
    const adminUser = localStorage.getItem('adminUser');
    const adminReturnButton = document.getElementById('adminReturnButton');

    // Hiển thị nút trở về Admin nếu admin đã đăng nhập
    if (adminReturnButton) {
        if (adminUser) {
            adminReturnButton.classList.remove('d-none');
        } else {
            adminReturnButton.classList.add('d-none');
        }
    }

    if (user) {
        // Kiểm tra nếu user là admin
        const isAdmin = user.username === 'admin' || user.role === 'admin';
        
        const adminMenuItem = isAdmin ? 
            '<li><a class="dropdown-item" href="admin.html"><i class="fas fa-cogs"></i> Admin Panel</a></li>' : '';

        userArea.innerHTML = `
        <a class="nav-link dropdown-toggle text-success" href="#" data-bs-toggle="dropdown">
            <i class="fa-solid fa-user"></i> ${user.name} ${isAdmin ? '<i class="fas fa-crown text-warning"></i>' : ''}
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#" onclick="openProfileModal()">Thông tin tài khoản</a></li>
            <li><a class="dropdown-item" href="#" onclick="openHistoryModal()">Lịch sử mua hàng</a></li>
            ${adminMenuItem}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Đăng xuất</a></li>
        </ul>
        `;
    } else {
        userArea.innerHTML = `
        <a class="nav-link text-success" href="#" onclick="openAuthModal()">
            <i class="fa-solid fa-user"></i> Đăng nhập
        </a>
        `;
    }
}

window.logout = function () {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('adminUser'); // Cũng xóa session admin
    
    // Hiển thị thông báo đăng xuất thành công
    showSuccessToast("Đã đăng xuất thành công!");
    
    // Reload trang sau 1.5 giây để người dùng thấy được thông báo
    setTimeout(() => {
        window.location.reload();
    }, 1500);
};

// Hàm đăng nhập admin từ footer - hiển thị modal riêng
window.showAdminLogin = function() {
    // Tạo modal admin nếu chưa có
    if (!document.getElementById('modalAdminLogin')) {
        createAdminLoginModal();
    }
    
    // Hiển thị modal admin
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalAdminLogin')).show();
};

// Tạo modal đăng nhập admin riêng biệt
function createAdminLoginModal() {
    const modalHTML = `
    <div class="modal fade" id="modalAdminLogin" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-shield-alt me-2"></i>Đăng nhập Admin
                    </h5>
                    <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="adminLoginForm">
                        <div class="mb-3">
                            <label class="form-label">Tên đăng nhập</label>
                            <input type="text" id="adminUsername" class="form-control" required autocomplete="username">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Mật khẩu</label>
                            <input type="password" id="adminPassword" class="form-control" required autocomplete="current-password">
                        </div>
                        <div class="text-end">
                            <button type="submit" class="btn btn-dark">
                                <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Xử lý form đăng nhập admin
    document.getElementById('adminLoginForm').onsubmit = function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        
        if (!username || !password) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        // Kiểm tra tài khoản admin
        let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        
        // Tự động tạo tài khoản admin nếu chưa có (trừ khi đã reset dữ liệu)
        if (!users.find(u => u.username === 'admin') && localStorage.getItem('preventSampleData') !== 'true') {
            users.push({
                name: 'Administrator',
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        }
        
        const adminUser = users.find(u => {
            if (u.username === username && (u.role === 'admin' || u.username === 'admin')) {
                // Support both old plain password and new hashed password
                if (u.passwordHash) {
                    return verifyPassword(password, u.passwordHash);
                } else {
                    return u.password === password;
                }
            }
            return false;
        });
        
        if (!adminUser) {
            alert('Tên đăng nhập hoặc mật khẩu không đúng!');
            return;
        }
        
        // Migrate admin password to hashed if needed
        if (!adminUser.passwordHash && adminUser.password) {
            adminUser.passwordHash = hashPassword(adminUser.password);
            adminUser.password = undefined; // Remove plain password
            
            // Update in localStorage
            const userIndex = users.findIndex(u => u.username === username);
            if (userIndex !== -1) {
                users[userIndex] = adminUser;
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
        }
        
        // Lưu session admin
        localStorage.setItem('adminUser', JSON.stringify({
            username: adminUser.username,
            loginTime: new Date().toISOString()
        }));
        
        // Đóng modal
        bootstrap.Modal.getInstance(document.getElementById('modalAdminLogin')).hide();
        
        // Hiển thị thông báo thành công
        showSuccessToast('Đăng nhập Admin thành công! Đang chuyển vào Admin Panel...');
        
        // Chuyển vào admin panel
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
    };
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Không cần hiển thị banner admin nữa
});

/***********************
 * PASSWORD ENCRYPTION
 ***********************/

// Simple password hashing function (for demo purposes)
function hashPassword(password) {
    // Simple hash using btoa and some manipulation
    let hash = btoa(password + "organicfarm2024");
    return hash.split('').reverse().join('');
}

// Verify password against hash
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

/***********************
 * PROFILE MODAL
 ***********************/
window.openProfileModal = function () {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (!user) return alert("Vui lòng đăng nhập!");

    const profileName = document.getElementById("profileName");
    const profileUsername = document.getElementById("profileUsername");
    const profileAddress = document.getElementById("profileAddress");
    const profilePhone = document.getElementById("profilePhone");

    if (profileName) profileName.value = user.name;
    if (profileUsername) profileUsername.value = user.username;
    if (profileAddress) profileAddress.value = user.address || '';
    if (profilePhone) profilePhone.value = user.phone || '';

    // Reset change password section
    const changePasswordSection = document.getElementById("changePasswordSection");
    if (changePasswordSection) {
        changePasswordSection.style.display = 'none';
        document.getElementById("currentPassword").value = '';
        document.getElementById("newPassword").value = '';
        document.getElementById("confirmPassword").value = '';
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalProfile")).show();
};

// Toggle change password section
window.toggleChangePassword = function() {
    const section = document.getElementById("changePasswordSection");
    const isVisible = section.style.display !== 'none';
    
    section.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        // Clear fields when opening
        document.getElementById("currentPassword").value = '';
        document.getElementById("newPassword").value = '';
        document.getElementById("confirmPassword").value = '';
    }
};

window.updateProfile = function (e) {
    e.preventDefault();
    const profileName = document.getElementById("profileName").value.trim();
    const profileUsername = document.getElementById("profileUsername").value.trim();
    const profileAddress = document.getElementById("profileAddress").value.trim();
    const profilePhone = document.getElementById("profilePhone").value.trim();

    if (!profileName || !profileUsername) return alert("Vui lòng nhập đầy đủ thông tin bắt buộc");

    let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const currentUser = JSON.parse(localStorage.getItem(USER_KEY));

    // Kiểm tra username mới có trùng với người khác không
    if (users.some(u => u.username === profileUsername && u.username !== currentUser.username))
        return alert("Tên đăng nhập đã tồn tại");

    // Check if changing password
    const changePasswordSection = document.getElementById("changePasswordSection");
    let newPasswordHash = currentUser.passwordHash || hashPassword(currentUser.password || 'defaultpass');
    
    if (changePasswordSection && changePasswordSection.style.display !== 'none') {
        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        if (currentPassword || newPassword || confirmPassword) {
            // Validate current password
            const currentHash = currentUser.passwordHash || hashPassword(currentUser.password || 'defaultpass');
            if (!verifyPassword(currentPassword, currentHash)) {
                alert("Mật khẩu hiện tại không đúng!");
                return;
            }
            
            // Validate new password
            if (newPassword.length < 6) {
                alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
                return;
            }
            
            // Hash new password
            newPasswordHash = hashPassword(newPassword);
            showSuccessToast("Mật khẩu đã được thay đổi thành công!");
        }
    }

    // Cập nhật user trong mảng users
    users = users.map(u => {
        if (u.username === currentUser.username) {
            return { 
                name: profileName, 
                username: profileUsername, 
                password: undefined, // Remove plain password
                passwordHash: newPasswordHash, // Use hashed password
                address: profileAddress,
                phone: profilePhone,
                role: u.role || 'user'
            };
        }
        return u;
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const updatedUser = { 
        name: profileName, 
        username: profileUsername, 
        password: undefined, // Remove plain password
        passwordHash: newPasswordHash, // Use hashed password
        address: profileAddress,
        phone: profilePhone,
        role: currentUser.role || 'user'
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    bootstrap.Modal.getInstance(document.getElementById("modalProfile")).hide();
    renderUserArea();
    
    // Show success message
    showSuccessToast("Thông tin tài khoản đã được cập nhật!");
};

/***********************
 * CART
 ***********************/
function initCart() {
    window.addToCart = function () {
        if (typeof getProductId !== "function" || typeof products === "undefined")
            return;

        const user = JSON.parse(localStorage.getItem(USER_KEY));
        if (!user) return alert("Vui lòng đăng nhập!");

        const productId = +getProductId();
        const product = products.find(p => p.id === productId);
        const qty = +document.getElementById("product-quantity")?.value || 1;

        // Kiểm tra sản phẩm có tồn tại không
        if (!product) {
            alert("Không tìm thấy sản phẩm!");
            return;
        }

        // Kiểm tra tồn kho
        if (product.stock <= 0) {
            alert("Sản phẩm đã hết hàng!");
            return;
        }

        if (qty > product.stock) {
            alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
            return;
        }

        let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        const item = cart.find(i => i.id === productId);

        if (item) {
            // Kiểm tra tổng số lượng không vượt quá tồn kho
            const newQuantity = item.quantity + qty;
            if (newQuantity > product.stock) {
                alert(`Không thể thêm ${qty} sản phẩm. Chỉ còn ${product.stock - item.quantity} sản phẩm có thể thêm vào giỏ hàng!`);
                return;
            }
            item.quantity = newQuantity;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail,
                quantity: qty,
                maxStock: product.stock // Lưu thông tin tồn kho để kiểm tra sau
            });
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCart();
        
        // Hiển thị thông báo thành công
        showSuccessToast(`Đã thêm ${qty} sản phẩm "${product.title}" vào giỏ hàng!`);
    };
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const cartCount = document.getElementById("cartCount");
    if (cartCount)
        cartCount.innerText = cart.reduce((s, i) => s + i.quantity, 0);
}

function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartItems || !cartTotal) return;

    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    let total = 0;

    if (!cart.length) {
        cartItems.innerHTML = "<p class='text-muted'>Giỏ hàng trống</p>";
        cartTotal.innerText = "0₫";
        return;
    }

    cartItems.innerHTML = "";
    cart.forEach(item => {
        // Kiểm tra tồn kho hiện tại
        const currentProduct = adminProducts.find(p => p.id === item.id);
        const currentStock = currentProduct ? currentProduct.stock : 0;
        
        // Cảnh báo nếu không đủ hàng
        let stockWarning = "";
        if (currentStock <= 0) {
            stockWarning = `<div class="text-danger small"><i class="fas fa-exclamation-triangle"></i> Sản phẩm đã hết hàng!</div>`;
        } else if (item.quantity > currentStock) {
            stockWarning = `<div class="text-warning small"><i class="fas fa-exclamation-triangle"></i> Chỉ còn ${currentStock} sản phẩm</div>`;
        }
        
        total += item.price * item.quantity;
        cartItems.innerHTML += `
        <div class="d-flex align-items-center mb-3">
            <img src="${item.thumbnail}" width="60" class="me-3">
            <div class="flex-grow-1">
                <div class="fw-semibold">${item.title}</div>
                <div class="input-group input-group-sm mt-1" style="width:120px">
                    <button class="btn btn-outline-secondary" onclick="changeQty(${item.id},-1)">−</button>
                    <input class="form-control text-center" value="${item.quantity}" readonly>
                    <button class="btn btn-outline-secondary" onclick="changeQty(${item.id},1)" ${currentStock <= 0 || item.quantity >= currentStock ? 'disabled' : ''}>+</button>
                </div>
                <small>${formatVND(item.price)}</small>
                ${stockWarning}
            </div>
            <strong>${formatVND(item.price * item.quantity)}</strong>
        </div>`;
    });

    cartTotal.innerText = formatVND(total);
}

window.changeQty = function (id, delta) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    const item = cart.find(i => i.id === id);
    if (!item) return;

    // Kiểm tra tồn kho khi tăng số lượng
    if (delta > 0) {
        const currentProduct = adminProducts.find(p => p.id === id);
        const currentStock = currentProduct ? currentProduct.stock : 0;
        
        if (currentStock <= 0) {
            showSuccessToast('❌ Sản phẩm đã hết hàng!');
            return;
        }
        
        if (item.quantity >= currentStock) {
            showSuccessToast(`❌ Chỉ còn ${currentStock} sản phẩm trong kho!`);
            return;
        }
    }

    const oldQuantity = item.quantity;
    item.quantity += delta;
    
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
        showSuccessToast(`🗑️ Đã xóa "${item.title}" khỏi giỏ hàng`);
    } else if (delta > 0) {
        showSuccessToast(`➕ Đã tăng số lượng "${item.title}" lên ${item.quantity}`);
    } else {
        showSuccessToast(`➖ Đã giảm số lượng "${item.title}" xuống ${item.quantity}`);
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
    updateCartCount();
};

function formatVND(value) {
    return value.toLocaleString("vi-VN") + "₫";
}

/***********************
 * CHECKOUT
 ***********************/
function initCheckout() {
    const btnClearCart = document.getElementById("btnClearCart");
    const btnCheckout = document.getElementById("btnCheckout");
    const checkoutForm = document.getElementById("checkoutForm");

    if (btnClearCart)
        btnClearCart.onclick = () => {
            localStorage.removeItem(CART_KEY);
            renderCart();
            updateCartCount();
        };

    if (btnCheckout)
        btnCheckout.onclick = () => {
            // Auto-fill user information when opening checkout
            const user = JSON.parse(localStorage.getItem(USER_KEY));
            if (user) {
                const custName = document.getElementById("custName");
                const custPhone = document.getElementById("custPhone");
                const custAddress = document.getElementById("custAddress");
                
                if (custName) custName.value = user.name || '';
                if (custPhone) custPhone.value = user.phone || '';
                if (custAddress) custAddress.value = user.address || '';
            }
            
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById("modalCheckout")
            ).show();
        };

    // Handle "Use Profile Address" button
    const useProfileAddressBtn = document.getElementById("useProfileAddress");
    if (useProfileAddressBtn) {
        useProfileAddressBtn.onclick = () => {
            const user = JSON.parse(localStorage.getItem(USER_KEY));
            if (user && user.address) {
                const custAddress = document.getElementById("custAddress");
                if (custAddress) {
                    custAddress.value = user.address;
                    showSuccessToast("Đã sử dụng địa chỉ mặc định!");
                }
            } else {
                alert("Bạn chưa có địa chỉ mặc định. Vui lòng cập nhật trong thông tin tài khoản.");
            }
        };
    }

    if (checkoutForm)
        checkoutForm.onsubmit = e => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem(USER_KEY));
            if (!user) return alert("Vui lòng đăng nhập!");

            const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
            if (!cart.length) return alert("Giỏ hàng trống!");

            // Kiểm tra tồn kho trước khi đặt hàng
            const stockCheckResult = checkStockAvailability(cart);
            if (!stockCheckResult.success) {
                alert(stockCheckResult.message);
                return;
            }

            // Lấy phương thức thanh toán
            const paymentMethod = document.getElementById("payMethod").value;
            
            // Xác định trạng thái đơn hàng dựa trên phương thức thanh toán
            let orderStatus = 'pending'; // Mặc định chờ xử lý
            if (paymentMethod === 'bank') {
                orderStatus = 'completed'; // Chuyển khoản tự động hoàn thành
            }

            // Trừ tồn kho cho các sản phẩm trong đơn hàng (chỉ khi đã hoàn thành)
            if (orderStatus === 'completed') {
                updateProductStock(cart);
            }

            // Lưu đơn hàng
            const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
            if (!allOrders[user.username]) allOrders[user.username] = [];
            
            const orderData = {
                id: generateOrderId(),
                date: new Date().toISOString(),
                dateDisplay: new Date().toLocaleString('vi-VN'),
                items: cart,
                status: orderStatus,
                paymentMethod: paymentMethod,
                customerInfo: {
                    name: document.getElementById("custName").value,
                    phone: document.getElementById("custPhone").value,
                    address: document.getElementById("custAddress").value
                },
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };
            
            allOrders[user.username].push(orderData);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));

            // Xóa giỏ hàng
            localStorage.removeItem(CART_KEY);
            renderCart();
            updateCartCount();

            bootstrap.Modal.getInstance(document.getElementById("modalCheckout")).hide();
            
            // Hiển thị modal thành công với thông tin đơn hàng
            const orderId = document.getElementById("orderId");
            if (orderId) orderId.textContent = `#${orderData.id}`;
            
            // Nếu thanh toán chuyển khoản, hiển thị thông tin ngân hàng
            if (paymentMethod === 'bank') {
                showBankingInfo(orderData);
            } else {
                bootstrap.Modal.getOrCreateInstance(document.getElementById("modalSuccess")).show();
            }
        };
}

/***********************
 * LỊCH SỬ MUA HÀNG
 ***********************/
window.openHistoryModal = function () {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    const historyBody = document.getElementById("historyBody");
    if (!user || !historyBody) return;

    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    const orders = allOrders[user.username] || [];

    if (!orders.length) {
        historyBody.innerHTML = "<p class='text-muted'>Chưa có đơn hàng nào</p>";
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalHistory")).show();
        return;
    }

    let html = "";
    orders.forEach((order, idx) => {
        let total = 0;
        let itemsHtml = "";
        order.items.forEach(item => {
            total += item.price * item.quantity;
            itemsHtml += `
            <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>${formatVND(item.price)}</td>
                <td>${formatVND(item.price * item.quantity)}</td>
            </tr>`;
        });

        html += `
        <div class="mb-4 border rounded p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Đơn hàng #${order.id || (idx + 1)} - ${order.dateDisplay || order.date}</h6>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="editOrder('${user.username}', ${idx})" title="Chỉnh sửa đơn hàng">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelOrder('${user.username}', ${idx})" title="Hủy đơn hàng">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-outline-secondary" onclick="deleteOrder('${user.username}', ${idx})" title="Xóa đơn hàng khỏi lịch sử">
                            <i class="fas fa-trash"></i>
                        </button>
                    `}
                </div>
            </div>
            <div class="mb-2">
                <small class="text-muted">
                    <i class="fas fa-credit-card me-1"></i>
                    Thanh toán: ${order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD'}
                </small>
                ${order.status === 'pending' ? `
                    <small class="text-info d-block">
                        <i class="fas fa-info-circle me-1"></i>
                        Bạn có thể chỉnh sửa hoặc hủy đơn hàng này
                    </small>
                ` : `
                    <small class="text-muted d-block">
                        <i class="fas fa-info-circle me-1"></i>
                        Đơn hàng đã hoàn thành - có thể xóa khỏi lịch sử
                    </small>
                `}
            </div>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>SL</th>
                        <th>Giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="3">Tổng cộng</th>
                        <th>${formatVND(total)}</th>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    });

    historyBody.innerHTML = html;
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modalHistory")).show();
};

/***********************
 * ORDER MANAGEMENT FUNCTIONS
 ***********************/

// Chỉnh sửa đơn hàng (chỉ cho đơn hàng pending)
window.editOrder = function(username, orderIndex) {
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    const order = allOrders[username][orderIndex];
    
    if (!order || order.status !== 'pending') {
        alert('Chỉ có thể chỉnh sửa đơn hàng đang chờ xử lý!');
        return;
    }
    
    // Đóng modal lịch sử
    bootstrap.Modal.getInstance(document.getElementById("modalHistory")).hide();
    
    // Mở modal chỉnh sửa đơn hàng
    showEditOrderModal(username, orderIndex, order);
};

// Hủy đơn hàng (chỉ cho đơn hàng pending)
window.cancelOrder = function(username, orderIndex) {
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    const order = allOrders[username][orderIndex];
    
    if (!order || order.status !== 'pending') {
        alert('Chỉ có thể hủy đơn hàng đang chờ xử lý!');
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${order.id || (orderIndex + 1)}?`)) {
        // Cập nhật trạng thái thành cancelled
        allOrders[username][orderIndex].status = 'cancelled';
        localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
        
        showSuccessToast('Đơn hàng đã được hủy thành công!');
        
        // Refresh lịch sử
        openHistoryModal();
    }
};

// Xóa đơn hàng khỏi lịch sử (cho đơn hàng đã hoàn thành/hủy)
window.deleteOrder = function(username, orderIndex) {
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    const order = allOrders[username][orderIndex];
    
    if (!order) {
        alert('Đơn hàng không tồn tại!');
        return;
    }
    
    if (order.status === 'pending') {
        alert('Không thể xóa đơn hàng đang chờ xử lý! Vui lòng hủy đơn hàng trước.');
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${order.id || (orderIndex + 1)} khỏi lịch sử?\n\nHành động này không thể hoàn tác!`)) {
        // Xóa đơn hàng khỏi mảng
        allOrders[username].splice(orderIndex, 1);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
        
        showSuccessToast('Đơn hàng đã được xóa khỏi lịch sử!');
        
        // Refresh lịch sử
        openHistoryModal();
    }
};

// Hiển thị modal chỉnh sửa đơn hàng
function showEditOrderModal(username, orderIndex, order) {
    // Tạo modal chỉnh sửa nếu chưa có
    if (!document.getElementById('modalEditOrder')) {
        createEditOrderModal();
    }
    
    // Điền thông tin đơn hàng vào form
    document.getElementById('editOrderId').textContent = `#${order.id || (orderIndex + 1)}`;
    document.getElementById('editCustName').value = order.customerInfo?.name || '';
    document.getElementById('editCustPhone').value = order.customerInfo?.phone || '';
    document.getElementById('editCustAddress').value = order.customerInfo?.address || '';
    
    // Hiển thị danh sách sản phẩm
    const editOrderItems = document.getElementById('editOrderItems');
    let itemsHtml = '';
    let total = 0;
    
    order.items.forEach((item, itemIndex) => {
        total += item.price * item.quantity;
        itemsHtml += `
            <tr>
                <td>
                    <img src="${item.thumbnail}" width="40" class="me-2">
                    ${item.title}
                </td>
                <td>
                    <div class="input-group input-group-sm" style="width: 120px;">
                        <button class="btn btn-outline-secondary" onclick="changeEditOrderQty(${itemIndex}, -1)">-</button>
                        <input class="form-control text-center" id="editQty_${itemIndex}" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary" onclick="changeEditOrderQty(${itemIndex}, 1)">+</button>
                    </div>
                </td>
                <td>${formatVND(item.price)}</td>
                <td id="editItemTotal_${itemIndex}">${formatVND(item.price * item.quantity)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="removeEditOrderItem(${itemIndex})" title="Xóa sản phẩm">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    editOrderItems.innerHTML = itemsHtml;
    document.getElementById('editOrderTotal').textContent = formatVND(total);
    
    // Lưu thông tin để xử lý
    window.currentEditOrder = { username, orderIndex, order: JSON.parse(JSON.stringify(order)) };
    
    // Hiển thị modal
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditOrder')).show();
}

// Tạo modal chỉnh sửa đơn hàng
function createEditOrderModal() {
    const modalHTML = `
    <div class="modal fade" id="modalEditOrder" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-edit me-2"></i>Chỉnh sửa đơn hàng <span id="editOrderId">#001</span>
                    </h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6><i class="fas fa-user me-2"></i>Thông tin giao hàng</h6>
                            <div class="mb-3">
                                <label class="form-label">Họ tên</label>
                                <input type="text" id="editCustName" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Số điện thoại</label>
                                <input type="tel" id="editCustPhone" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Địa chỉ giao hàng</label>
                                <textarea id="editCustAddress" class="form-control" rows="3" required></textarea>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6><i class="fas fa-info-circle me-2"></i>Thông tin đơn hàng</h6>
                            <div class="alert alert-info">
                                <small>
                                    <i class="fas fa-exclamation-triangle me-1"></i>
                                    Bạn có thể thay đổi thông tin giao hàng và số lượng sản phẩm.
                                    Không thể thêm sản phẩm mới vào đơn hàng đã tạo.
                                </small>
                            </div>
                            <div class="text-center">
                                <h4 class="text-success">Tổng: <span id="editOrderTotal">0đ</span></h4>
                            </div>
                        </div>
                    </div>
                    
                    <h6 class="mt-4"><i class="fas fa-shopping-cart me-2"></i>Sản phẩm trong đơn hàng</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead class="table-light">
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Thành tiền</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="editOrderItems">
                                <!-- Items will be populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                    <button class="btn btn-success" onclick="saveOrderChanges()">
                        <i class="fas fa-save me-2"></i>Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Thay đổi số lượng sản phẩm trong modal chỉnh sửa
window.changeEditOrderQty = function(itemIndex, delta) {
    if (!window.currentEditOrder) return;
    
    const item = window.currentEditOrder.order.items[itemIndex];
    const newQty = item.quantity + delta;
    
    if (newQty <= 0) {
        if (confirm('Bạn có muốn xóa sản phẩm này khỏi đơn hàng?')) {
            removeEditOrderItem(itemIndex);
        }
        return;
    }
    
    // Cập nhật số lượng
    item.quantity = newQty;
    
    // Cập nhật hiển thị
    document.getElementById(`editQty_${itemIndex}`).value = newQty;
    document.getElementById(`editItemTotal_${itemIndex}`).textContent = formatVND(item.price * newQty);
    
    // Cập nhật tổng tiền
    updateEditOrderTotal();
};

// Xóa sản phẩm khỏi đơn hàng đang chỉnh sửa
window.removeEditOrderItem = function(itemIndex) {
    if (!window.currentEditOrder) return;
    
    if (window.currentEditOrder.order.items.length <= 1) {
        alert('Đơn hàng phải có ít nhất 1 sản phẩm!');
        return;
    }
    
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?')) {
        // Xóa sản phẩm
        window.currentEditOrder.order.items.splice(itemIndex, 1);
        
        // Refresh hiển thị
        showEditOrderModal(
            window.currentEditOrder.username, 
            window.currentEditOrder.orderIndex, 
            window.currentEditOrder.order
        );
    }
};

// Cập nhật tổng tiền đơn hàng đang chỉnh sửa
function updateEditOrderTotal() {
    if (!window.currentEditOrder) return;
    
    const total = window.currentEditOrder.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('editOrderTotal').textContent = formatVND(total);
}

// Lưu thay đổi đơn hàng
window.saveOrderChanges = function() {
    if (!window.currentEditOrder) return;
    
    const editedOrder = window.currentEditOrder.order;
    const username = window.currentEditOrder.username;
    const orderIndex = window.currentEditOrder.orderIndex;
    
    // Validate thông tin
    const name = document.getElementById('editCustName').value.trim();
    const phone = document.getElementById('editCustPhone').value.trim();
    const address = document.getElementById('editCustAddress').value.trim();
    
    if (!name || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin giao hàng!');
        return;
    }
    
    if (editedOrder.items.length === 0) {
        alert('Đơn hàng phải có ít nhất 1 sản phẩm!');
        return;
    }
    
    // Cập nhật thông tin khách hàng
    editedOrder.customerInfo = { name, phone, address };
    editedOrder.total = editedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Lưu vào localStorage
    const allOrders = JSON.parse(localStorage.getItem(ORDERS_KEY)) || {};
    allOrders[username][orderIndex] = editedOrder;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
    
    // Đóng modal và refresh lịch sử
    bootstrap.Modal.getInstance(document.getElementById('modalEditOrder')).hide();
    showSuccessToast('Đơn hàng đã được cập nhật thành công!');
    
    // Refresh lịch sử sau một chút
    setTimeout(() => {
        openHistoryModal();
    }, 500);
    
    // Clear current edit order
    window.currentEditOrder = null;
};

/***********************
 * STOCK MANAGEMENT
 ***********************/

// Kiểm tra tồn kho trước khi đặt hàng
function checkStockAvailability(cart) {
    const adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    
    for (let cartItem of cart) {
        const product = adminProducts.find(p => p.id === cartItem.id);
        
        if (!product) {
            return {
                success: false,
                message: `Sản phẩm "${cartItem.title}" không tồn tại!`
            };
        }
        
        if (product.stock < cartItem.quantity) {
            return {
                success: false,
                message: `Sản phẩm "${cartItem.title}" chỉ còn ${product.stock} trong kho, không đủ cho ${cartItem.quantity} sản phẩm bạn đã chọn!`
            };
        }
    }
    
    return { success: true };
}

// Cập nhật tồn kho sau khi đặt hàng (chỉ cho đơn hàng đã hoàn thành)
function updateProductStock(cart) {
    let adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    
    // Trừ tồn kho cho từng sản phẩm trong giỏ hàng
    cart.forEach(cartItem => {
        const productIndex = adminProducts.findIndex(p => p.id === cartItem.id);
        
        if (productIndex !== -1) {
            adminProducts[productIndex].stock -= cartItem.quantity;
            
            // Đảm bảo stock không âm
            if (adminProducts[productIndex].stock < 0) {
                adminProducts[productIndex].stock = 0;
            }
            
            // Cập nhật status nếu hết hàng
            if (adminProducts[productIndex].stock === 0) {
                adminProducts[productIndex].status = 'out_of_stock';
            }
            
            console.log(`Updated stock for ${cartItem.title}: ${adminProducts[productIndex].stock} remaining`);
        }
    });
    
    // Lưu lại dữ liệu
    localStorage.setItem("adminProducts", JSON.stringify(adminProducts));
    
    // Cập nhật products global nếu có
    if (typeof window !== 'undefined' && typeof refreshProducts === 'function') {
        window.products = refreshProducts();
    }
    
    console.log('Stock updated successfully');
}

// Hàm kiểm tra và cập nhật trạng thái sản phẩm hết hàng
function updateOutOfStockProducts() {
    let adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    let updated = false;
    
    adminProducts.forEach(product => {
        if (product.stock <= 0 && product.status !== 'out_of_stock') {
            product.status = 'out_of_stock';
            updated = true;
        } else if (product.stock > 0 && product.status === 'out_of_stock') {
            product.status = 'active';
            updated = true;
        }
    });
    
    if (updated) {
        localStorage.setItem("adminProducts", JSON.stringify(adminProducts));
        console.log('Product statuses updated based on stock levels');
    }
}

// Gọi hàm cập nhật trạng thái khi trang load
document.addEventListener('DOMContentLoaded', function() {
    updateOutOfStockProducts();
});
/***********************
 * UTILITY FUNCTIONS
 ***********************/

// Show success toast notification
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Thành công!</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Generate unique order ID
function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `HC${timestamp}${random}`;
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'pending': return 'bg-warning text-dark';
        case 'completed': return 'bg-success';
        case 'cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Get status text
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Chờ xử lý';
        case 'completed': return 'Đã xử lý';
        case 'cancelled': return 'Đã hủy';
        default: return 'Không xác định';
    }
}

// Show banking information modal
function showBankingInfo(orderData) {
    const bankingModal = document.getElementById('modalBanking');
    if (!bankingModal) {
        createBankingModal();
    }
    
    // Update order info in banking modal
    document.getElementById('bankingOrderId').textContent = `#${orderData.id}`;
    document.getElementById('bankingAmount').textContent = formatVND(orderData.total);
    document.getElementById('bankingContent').textContent = `Thanh toan don hang ${orderData.id}`;
    
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalBanking')).show();
}

// Create banking modal dynamically
function createBankingModal() {
    const modalHTML = `
    <div class="modal fade" id="modalBanking" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-university me-2"></i>Thông tin chuyển khoản
                    </h5>
                    <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Đơn hàng của bạn đã được tạo thành công!</strong><br>
                        Vui lòng chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng.
                    </div>
                    
                    <div class="row">
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header bg-light">
                                    <h6 class="mb-0"><i class="fas fa-credit-card me-2"></i>Thông tin tài khoản</h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Ngân hàng:</label>
                                        <div class="d-flex align-items-center">
                                            <span class="me-2">Vietcombank (VCB)</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="copyToClipboard('Vietcombank')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Số tài khoản:</label>
                                        <div class="d-flex align-items-center">
                                            <span class="me-2 font-monospace">1234567890</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="copyToClipboard('1234567890')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Chủ tài khoản:</label>
                                        <div class="d-flex align-items-center">
                                            <span class="me-2">NGUYEN NGOC XUAN MAI</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="copyToClipboard('NGUYEN NGOC XUAN MAI')">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Số tiền:</label>
                                        <div class="d-flex align-items-center">
                                            <span class="me-2 text-danger fw-bold" id="bankingAmount">0đ</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="copyAmount()">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label class="form-label fw-bold">Nội dung chuyển khoản:</label>
                                        <div class="d-flex align-items-center">
                                            <span class="me-2 font-monospace" id="bankingContent">Thanh toan don hang</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="copyContent()">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header bg-light text-center">
                                    <h6 class="mb-0"><i class="fas fa-qrcode me-2"></i>Mã QR</h6>
                                </div>
                                <div class="card-body text-center">
                                    <div class="qr-code-placeholder bg-light border rounded p-3 mb-3" style="height: 150px; display: flex; align-items: center; justify-content: center;">
                                        <div class="text-muted">
                                            <i class="fas fa-qrcode fa-3x mb-2"></i><br>
                                            <small>Mã QR thanh toán</small>
                                        </div>
                                    </div>
                                    <small class="text-muted">Quét mã QR để chuyển khoản nhanh</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-warning mt-3">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <strong>Lưu ý:</strong> Đơn hàng <span id="bankingOrderId">#HC001</span> đã được xác nhận và sẽ được xử lý sau khi nhận được thanh toán.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button class="btn btn-success" onclick="confirmBankingPayment()">
                        <i class="fas fa-check me-2"></i>Tôi đã chuyển khoản
                    </button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Copy functions for banking info
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showSuccessToast(`Đã sao chép: ${text}`);
    });
}

function copyAmount() {
    const amountText = document.getElementById('bankingAmount').textContent;
    const numericAmount = amountText.replace(/[^\d]/g, '');
    copyToClipboard(numericAmount);
}

function copyContent() {
    const content = document.getElementById('bankingContent').textContent;
    copyToClipboard(content);
}

function confirmBankingPayment() {
    bootstrap.Modal.getInstance(document.getElementById('modalBanking')).hide();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSuccess')).show();
    showSuccessToast('Cảm ơn bạn đã xác nhận thanh toán! Đơn hàng sẽ được xử lý trong thời gian sớm nhất.');
}