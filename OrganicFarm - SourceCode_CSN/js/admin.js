/***********************
 * ADMIN CONSTANTS
 ***********************/
const ADMIN_KEY = "adminUser";
const CATEGORIES_KEY = "categories";
const BRANDS_KEY = "brands";
const ADMIN_PRODUCTS_KEY = "adminProducts";
const ADMIN_ORDERS_KEY = "adminOrders";

/***********************
 * INITIALIZATION
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
    console.log('Admin panel loading...');
    
    // Check admin authentication
    if (!checkAdminAuth()) {
        return;
    }
    
    // Initialize data FIRST
    initializeAdminData();
    
    // Đồng bộ danh mục với website ngay khi admin panel load
    setTimeout(() => {
        updateWebsiteCategories();
        updateBrandOptions(); // Cũng cập nhật brand options
    }, 500);
    
    // Then load dashboard
    showSection('dashboard');
    loadDashboardData();
    
    console.log('Admin panel loaded successfully');
});

/***********************
 * AUTHENTICATION
 ***********************/
function checkAdminAuth() {
    const adminUser = localStorage.getItem(ADMIN_KEY);
    if (!adminUser) {
        // Redirect to main page instead of admin-login.html
        window.location.href = "index.html";
        return false;
    }
    return true;
}

function showAdminLogin() {
    // Redirect to main page for login instead of admin-login.html
    window.location.href = "index.html";
    return false;
}

function logout() {
    // Hiển thị thông báo đăng xuất
    alert("Đã đăng xuất Admin thành công!");
    
    localStorage.removeItem(ADMIN_KEY);
    window.location.href = "index.html";
}

/***********************
 * DATA INITIALIZATION
 ***********************/
function initializeAdminData() {
    console.log('Initializing admin data...');
    
    // Check if data reset flag is set - if so, don't create sample data
    if (localStorage.getItem('preventSampleData') === 'true') {
        console.log('Sample data creation prevented by reset flag');
        return;
    }
    
    // Initialize categories if not exists
    if (!localStorage.getItem(CATEGORIES_KEY)) {
        console.log('Creating default categories...');
        const defaultCategories = [
            { id: 1, name: "Ngũ cốc bổ dưỡng", value: "Nutritious cereals" },
            { id: 2, name: "Các loại đậu", value: "Pulses" },
            { id: 3, name: "Gia vị và nước chấm", value: "Spices and Condiments" },
            { id: 4, name: "Thực phẩm chức năng và mỹ phẩm thiên nhiên", value: "Cooking oils" },
            { id: 5, name: "Gạo và các sản phẩm từ gạo", value: "Rice" },
            { id: 6, name: "Bột mì & Bột ngũ cốc", value: "Flours & Meals" },
            { id: 7, name: "Rau củ tươi", value: "Fresh Vegetables" }
        ];
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
        console.log('Default categories created:', defaultCategories);
    } else {
        console.log('Categories already exist');
    }

    // Initialize brands if not exists
    if (!localStorage.getItem(BRANDS_KEY)) {
        console.log('Creating default brands...');
        const defaultBrands = [
            { id: 1, name: "Cascadian Farm", description: "Thương hiệu thực phẩm hữu cơ cao cấp" },
            { id: 2, name: "Great Value", description: "Thương hiệu giá trị tốt" },
            { id: 3, name: "Organic Valley", description: "Sản phẩm hữu cơ chất lượng cao" },
            { id: 4, name: "Nature's Path", description: "Thực phẩm tự nhiên và hữu cơ" },
            { id: 5, name: "Bob's Red Mill", description: "Chuyên về bột và ngũ cốc" }
        ];
        localStorage.setItem(BRANDS_KEY, JSON.stringify(defaultBrands));
        console.log('Default brands created:', defaultBrands);
    } else {
        console.log('Brands already exist');
    }

    // Initialize admin products from ALL 26 products in defaultProducts
    if (!localStorage.getItem(ADMIN_PRODUCTS_KEY)) {
        console.log('Creating admin products from defaultProducts...');
        
        // Wait a bit for defaultProducts to be available if needed
        setTimeout(() => {
            if (typeof defaultProducts !== 'undefined' && defaultProducts && defaultProducts.length > 0) {
                console.log('Found defaultProducts:', defaultProducts.length, 'products');
                
                // Sử dụng TẤT CẢ sản phẩm từ defaultProducts
                const adminProducts = defaultProducts.map(product => ({
                    ...product,
                    // Đảm bảo có đầy đủ thông tin cần thiết
                    stock: product.stock || Math.floor(Math.random() * 100) + 10,
                    sold: Math.floor(Math.random() * 50),
                    status: 'active',
                    images: product.images || [product.thumbnail],
                    description: product.description || `Mô tả cho ${product.title}`,
                    brand: product.brand || '',
                    review: product.review || 0
                }));
                
                localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(adminProducts));
                console.log('SUCCESS: All', adminProducts.length, 'products from defaultProducts have been imported to admin');
                
                // Refresh the products display if we're on the products section
                if (document.getElementById('productsTable')) {
                    loadProducts();
                }
                
                // Update dashboard
                loadDashboardData();
                
            } else {
                console.error('defaultProducts not found or empty, creating fallback sample products...');
                
                // Fallback: tạo một vài sản phẩm mẫu nếu không có defaultProducts
                const sampleProducts = [
                    {
                        id: 1,
                        title: "Ngũ cốc ăn sáng hữu cơ",
                        description: "Ngũ cốc bổ dưỡng cho bữa sáng, giàu chất xơ và vitamin",
                        price: 215000,
                        discountPercentage: 397000,
                        review: 30,
                        stock: 95,
                        brand: "Cascadian Farm",
                        category: "Nutritious cereals",
                        thumbnail: "./data/products/1/thumbnail.jpeg",
                        images: ["./data/products/1/thumbnail.jpeg"],
                        status: 'active'
                    },
                    {
                        id: 2,
                        title: "Đậu lăng Great Value, 450g",
                        description: "Đậu lăng khô chất lượng cao, giàu protein",
                        price: 35000,
                        review: 44,
                        stock: 34,
                        brand: "Great Value",
                        category: "Pulses",
                        thumbnail: "./data/products/2/thumbnail.webp",
                        images: ["./data/products/2/thumbnail.webp"],
                        status: 'active'
                    }
                ];
                
                localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(sampleProducts));
                console.log('Fallback sample products created:', sampleProducts.length, 'products');
            }
        }, 100); // Small delay to ensure defaultProducts is loaded
    } else {
        const existingProducts = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY));
        console.log('Admin products already exist:', existingProducts.length, 'products');
    }
    
    console.log('Admin data initialization completed');
}

/***********************
 * NAVIGATION
 ***********************/
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'brands':
            loadBrands();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

/***********************
 * DASHBOARD
 ***********************/
function loadDashboardData() {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Lọc bỏ admin users - chỉ đếm khách hàng thực
    const customers = users.filter(user => 
        user.username !== 'admin' && 
        user.role !== 'admin'
    );
    
    // Đếm tổng số đơn hàng và tính doanh thu
    let totalOrders = 0;
    let totalRevenue = 0;
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        totalOrders += userOrders.length;
        
        userOrders.forEach(order => {
            const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            // Chỉ tính doanh thu cho đơn hàng hoàn thành
            if (order.status === 'completed') {
                totalRevenue += orderTotal;
            }
        });
    });
    
    // Update dashboard cards
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('totalRevenue').textContent = formatVND(totalRevenue);
}

/***********************
 * CATEGORIES MANAGEMENT
 ***********************/
function loadCategories() {
    console.log('Loading categories...');
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const tbody = document.getElementById('categoriesTable');
    
    console.log('Categories found:', categories);
    console.log('Products found:', products.length);
    
    if (!tbody) {
        console.error('categoriesTable not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có danh mục nào</td></tr>';
        return;
    }
    
    categories.forEach(category => {
        // Tính số lượng sản phẩm thực tế từ danh sách sản phẩm
        const productCount = products.filter(p => p.category === category.value).length;
        
        const row = `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${productCount}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    console.log('Categories loaded successfully');
}

function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Thêm danh mục';
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    const category = categories.find(c => c.id === id);
    
    if (category) {
        document.getElementById('categoryModalTitle').textContent = 'Sửa danh mục';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }
}

function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    
    if (!name) {
        alert('Vui lòng nhập tên danh mục');
        return;
    }
    
    let categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    
    if (id) {
        // Edit existing category
        const index = categories.findIndex(c => c.id == id);
        if (index !== -1) {
            categories[index].name = name;
            // Giữ nguyên value để không ảnh hưởng đến sản phẩm hiện có
        }
    } else {
        // Add new category
        const newId = Math.max(...categories.map(c => c.id), 0) + 1;
        const value = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9\s]/g, '') // Remove special chars
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
        
        categories.push({ 
            id: newId, 
            name: name, 
            value: value
        });
    }
    
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    
    // Đồng bộ với website: cập nhật dropdown danh mục
    updateWebsiteCategories();
    
    // Force update tất cả các trang đang mở
    setTimeout(() => {
        updateWebsiteCategories();
    }, 100);
    
    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
    loadCategories();
}

// Hàm đồng bộ danh mục với website
function updateWebsiteCategories() {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    
    // Lưu danh mục vào localStorage để các trang khác có thể truy cập
    localStorage.setItem('websiteCategories', JSON.stringify(categories));
    
    // Cập nhật dropdown danh mục trên trang hiện tại nếu có
    const categoryDropdowns = document.querySelectorAll('.dropdown-menu');
    categoryDropdowns.forEach(dropdown => {
        const categoryItems = dropdown.querySelectorAll('a[href*="category="]');
        if (categoryItems.length > 0) {
            // Có dropdown danh mục, cập nhật nó
            let newHTML = '';
            categories.forEach(category => {
                // Chỉ hiển thị tên danh mục, không hiển thị số lượng
                newHTML += `<li><a class="dropdown-item" href="products.html?category=${category.value}">${category.name}</a></li>`;
            });
            
            // Tìm parent ul và cập nhật
            const parentUl = categoryItems[0].closest('ul');
            if (parentUl) {
                parentUl.innerHTML = newHTML;
            }
        }
    });
    
    // Trigger event để các trang khác biết danh mục đã được cập nhật
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
            detail: { categories: categories } 
        }));
        
        // Cũng trigger event cho sidebar categories
        window.dispatchEvent(new CustomEvent('sidebarCategoriesUpdated', { 
            detail: { categories: categories } 
        }));
    }
}

function deleteCategory(id) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
        let categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        loadCategories();
    }
}

/***********************
 * BRANDS MANAGEMENT
 ***********************/
function loadBrands() {
    console.log('Loading brands...');
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const tbody = document.getElementById('brandsTable');
    
    console.log('Brands found:', brands);
    
    if (!tbody) {
        console.error('brandsTable not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (brands.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có thương hiệu nào</td></tr>';
        return;
    }
    
    brands.forEach(brand => {
        // Tính số lượng sản phẩm thực tế từ danh sách sản phẩm
        const productCount = products.filter(p => p.brand === brand.name).length;
        
        const row = `
            <tr>
                <td>${brand.id}</td>
                <td>
                    <div>
                        <strong>${brand.name}</strong>
                        ${brand.description ? `<br><small class="text-muted">${brand.description}</small>` : ''}
                    </div>
                </td>
                <td>${productCount}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editBrand(${brand.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBrand(${brand.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    console.log('Brands loaded successfully');
}

function showAddBrandModal() {
    document.getElementById('brandModalTitle').textContent = 'Thêm thương hiệu';
    document.getElementById('brandId').value = '';
    document.getElementById('brandName').value = '';
    document.getElementById('brandDescription').value = '';
    new bootstrap.Modal(document.getElementById('brandModal')).show();
}

function editBrand(id) {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    const brand = brands.find(b => b.id === id);
    
    if (brand) {
        document.getElementById('brandModalTitle').textContent = 'Sửa thương hiệu';
        document.getElementById('brandId').value = brand.id;
        document.getElementById('brandName').value = brand.name;
        document.getElementById('brandDescription').value = brand.description || '';
        new bootstrap.Modal(document.getElementById('brandModal')).show();
    }
}

function saveBrand() {
    const id = document.getElementById('brandId').value;
    const name = document.getElementById('brandName').value.trim();
    const description = document.getElementById('brandDescription').value.trim();
    
    if (!name) {
        alert('Vui lòng nhập tên thương hiệu');
        return;
    }
    
    let brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    
    if (id) {
        // Edit existing brand
        const index = brands.findIndex(b => b.id == id);
        if (index !== -1) {
            brands[index].name = name;
            brands[index].description = description;
        }
    } else {
        // Add new brand
        const newId = Math.max(...brands.map(b => b.id), 0) + 1;
        brands.push({ 
            id: newId, 
            name: name, 
            description: description
        });
    }
    
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    
    // Cập nhật dropdown thương hiệu trong form sản phẩm
    updateBrandOptions();
    
    bootstrap.Modal.getInstance(document.getElementById('brandModal')).hide();
    loadBrands();
}

function deleteBrand(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
        let brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
        brands = brands.filter(b => b.id !== id);
        localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
        loadBrands();
    }
}

// Hàm cập nhật dropdown thương hiệu trong form sản phẩm
function updateBrandOptions() {
    const brands = JSON.parse(localStorage.getItem(BRANDS_KEY)) || [];
    const select = document.getElementById('productBrand');
    
    if (select) {
        // Lưu giá trị hiện tại
        const currentValue = select.value;
        
        // Cập nhật options
        select.innerHTML = '<option value="">Chọn thương hiệu</option>';
        brands.forEach(brand => {
            select.innerHTML += `<option value="${brand.name}">${brand.name}</option>`;
        });
        
        // Khôi phục giá trị nếu có
        if (currentValue) {
            select.value = currentValue;
        }
    }
}

// Hàm xử lý upload ảnh
function handleImageUpload(input) {
    const file = input.files[0];
    if (file) {
        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!');
            input.value = '';
            return;
        }
        
        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            
            // Cập nhật URL vào input
            document.getElementById('productThumbnail').value = imageUrl;
            
            // Hiển thị preview
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = imageUrl;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

/***********************
 * PRODUCTS MANAGEMENT
 ***********************/
function loadProducts() {
    console.log('Loading products...');
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const tbody = document.getElementById('productsTable');
    
    console.log('Products found:', products.length);
    console.log('Products data:', products);
    
    if (!tbody) {
        console.error('productsTable not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Chưa có sản phẩm nào</td></tr>';
        return;
    }
    
    products.forEach(product => {
        const status = product.stock > 0 ? 
            (product.status === 'active' ? '<span class="status-active">Đang bán</span>' : '<span class="status-inactive">Tạm dừng</span>') :
            '<span class="status-out-of-stock">Hết hàng</span>';
            
        const row = `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.thumbnail}" alt="${product.title}" onerror="this.src='./img/default-product.jpg'"></td>
                <td>${product.title}</td>
                <td>${getCategoryName(product.category)}</td>
                <td>${formatVND(product.price)}</td>
                <td>${product.stock || 0}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    console.log('Products loaded successfully');
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Thêm sản phẩm';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Ẩn image preview
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productImageFile').value = '';
    
    loadCategoryOptions();
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const product = products.find(p => p.id === id);
    
    if (product) {
        document.getElementById('productModalTitle').textContent = 'Sửa sản phẩm';
        document.getElementById('productId').value = product.id;
        document.getElementById('productTitle').value = product.title;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productDiscountPrice').value = product.discountPercentage || '';
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productThumbnail').value = product.thumbnail || '';
        document.getElementById('productDescription').value = product.description || '';
        
        // Hiển thị preview ảnh nếu có
        if (product.thumbnail) {
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            previewImg.src = product.thumbnail;
            preview.style.display = 'block';
        } else {
            document.getElementById('imagePreview').style.display = 'none';
        }
        
        // Reset file input
        document.getElementById('productImageFile').value = '';
        
        loadCategoryOptions();
        new bootstrap.Modal(document.getElementById('productModal')).show();
    }
}

function loadCategoryOptions() {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    const select = document.getElementById('productCategory');
    
    select.innerHTML = '<option value="">Chọn danh mục</option>';
    categories.forEach(category => {
        select.innerHTML += `<option value="${category.value}">${category.name}</option>`;
    });
    
    // Cũng load brand options
    updateBrandOptions();
}

function saveProduct() {
    const id = document.getElementById('productId').value;
    const title = document.getElementById('productTitle').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const discountPrice = parseInt(document.getElementById('productDiscountPrice').value) || null;
    const stock = parseInt(document.getElementById('productStock').value);
    const brand = document.getElementById('productBrand').value.trim();
    const thumbnail = document.getElementById('productThumbnail').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    
    if (!title || !category || !price || stock < 0) {
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
        return;
    }
    
    let products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    if (id) {
        // Edit existing product
        const index = products.findIndex(p => p.id == id);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                title,
                category,
                price,
                discountPercentage: discountPrice,
                stock,
                brand,
                thumbnail: thumbnail || products[index].thumbnail,
                description,
                status: stock > 0 ? 'active' : 'inactive'
            };
        }
    } else {
        // Add new product
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        const newProduct = {
            id: newId,
            title,
            category,
            price,
            discountPercentage: discountPrice,
            stock,
            brand,
            thumbnail: thumbnail || './img/default-product.jpg',
            description,
            review: 0,
            sold: 0,
            status: stock > 0 ? 'active' : 'inactive',
            images: [thumbnail || './img/default-product.jpg']
        };
        products.push(newProduct);
    }
    
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
    
    // Đồng bộ với website: cập nhật products global variable
    updateWebsiteProducts();
    
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
    loadDashboardData();
}

// Hàm đồng bộ sản phẩm với website
function updateWebsiteProducts() {
    const adminProducts = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    // Chỉ lấy sản phẩm có stock > 0 và status = active để hiển thị trên website
    const visibleProducts = adminProducts.filter(p => p.stock > 0 && p.status === 'active');
    
    // Cập nhật biến global products nếu có
    if (typeof window !== 'undefined') {
        window.products = visibleProducts;
        
        // Trigger refresh cho trang products nếu đang mở
        if (typeof showSP === 'function') {
            showSP();
        }
    }
}

function deleteProduct(id) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        let products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
        products = products.filter(p => p.id !== id);
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
        loadProducts();
    }
}

/***********************
 * ORDERS MANAGEMENT
 ***********************/
function loadOrders() {
    // Lấy đơn hàng thực từ localStorage (từ khách hàng đặt hàng)
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const tbody = document.getElementById('ordersTable');
    
    tbody.innerHTML = '';
    
    let orderCounter = 1;
    
    // Duyệt qua tất cả đơn hàng của tất cả user
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        const user = users.find(u => u.username === username);
        const customerName = user ? user.name : username;
        
        userOrders.forEach((order, orderIndex) => {
            // Tính tổng tiền đơn hàng
            const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Lấy trạng thái đơn hàng
            const orderStatus = order.status || 'pending';
            
            // Lấy phương thức thanh toán
            const paymentMethod = order.paymentMethod || 'cod';
            const paymentText = paymentMethod === 'bank' ? 'Chuyển khoản' : 'COD';
            const paymentIcon = paymentMethod === 'bank' ? 'fas fa-university' : 'fas fa-money-bill-wave';
            
            const statusClass = {
                'pending': 'badge bg-warning',
                'processing': 'badge bg-info', 
                'completed': 'badge bg-success',
                'cancelled': 'badge bg-danger'
            };
            
            const statusText = {
                'pending': 'Chờ xử lý',
                'processing': 'Đang xử lý',
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy'
            };
            
            const row = `
                <tr>
                    <td>#${order.id || orderCounter}</td>
                    <td>${customerName}</td>
                    <td>${order.dateDisplay || new Date(order.date).toLocaleDateString('vi-VN')}</td>
                    <td>
                        <div>${formatVND(total)}</div>
                        <small class="text-muted">
                            <i class="${paymentIcon} me-1"></i>${paymentText}
                        </small>
                    </td>
                    <td><span class="${statusClass[orderStatus]}">${statusText[orderStatus]}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info me-1" onclick="viewOrderDetail('${username}', ${orderIndex})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <select class="form-select form-select-sm d-inline-block w-auto" onchange="updateOrderStatus('${username}', ${orderIndex}, this.value)" title="Cập nhật trạng thái">
                            <option value="pending" ${orderStatus === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                            <option value="processing" ${orderStatus === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                            <option value="completed" ${orderStatus === 'completed' ? 'selected' : ''}>Hoàn thành</option>
                            <option value="cancelled" ${orderStatus === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                        </select>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
            orderCounter++;
        });
    });
    
    if (orderCounter === 1) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có đơn hàng nào</td></tr>';
    }
}

function viewOrderDetail(username, orderIndex) {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userOrders = allOrders[username] || [];
    const order = userOrders[orderIndex];
    const user = users.find(u => u.username === username);
    
    if (!order) return;
    
    const customerName = user ? user.name : username;
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderStatus = order.status || 'pending';
    const paymentMethod = order.paymentMethod || 'cod';
    const paymentText = paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)';
    const paymentIcon = paymentMethod === 'bank' ? 'fas fa-university' : 'fas fa-money-bill-wave';
    
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td><img src="${item.thumbnail}" width="50"></td>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>${formatVND(item.price)}</td>
                <td>${formatVND(item.price * item.quantity)}</td>
            </tr>
        `;
    });
    
    const content = `
        <div class="row">
            <div class="col-md-6">
                <h6><i class="fas fa-info-circle me-2"></i>Thông tin đơn hàng</h6>
                <p><strong>Mã đơn hàng:</strong> #${order.id || (orderIndex + 1)}</p>
                <p><strong>Khách hàng:</strong> ${customerName}</p>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Ngày đặt:</strong> ${order.dateDisplay || new Date(order.date).toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> ${getOrderStatusText(orderStatus)}</p>
                <p><strong>Phương thức thanh toán:</strong> 
                    <i class="${paymentIcon} me-1"></i>${paymentText}
                </p>
            </div>
            <div class="col-md-6">
                <h6><i class="fas fa-user me-2"></i>Thông tin giao hàng</h6>
                ${order.customerInfo ? `
                    <p><strong>Họ tên:</strong> ${order.customerInfo.name}</p>
                    <p><strong>Số điện thoại:</strong> ${order.customerInfo.phone}</p>
                    <p><strong>Địa chỉ:</strong> ${order.customerInfo.address}</p>
                ` : '<p class="text-muted">Không có thông tin giao hàng</p>'}
                
                <h6 class="mt-3"><i class="fas fa-calculator me-2"></i>Tổng kết</h6>
                <p><strong>Tổng tiền:</strong> <span class="text-success">${formatVND(total)}</span></p>
                <p><strong>Số sản phẩm:</strong> ${order.items.length}</p>
            </div>
        </div>
        
        <h6 class="mt-4"><i class="fas fa-shopping-cart me-2"></i>Chi tiết sản phẩm</h6>
        <div class="table-responsive">
            <table class="table table-sm table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Hình ảnh</th>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot class="table-light">
                    <tr>
                        <th colspan="4" class="text-end">Tổng cộng:</th>
                        <th class="text-success">${formatVND(total)}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    document.getElementById('orderDetailContent').innerHTML = content;
    new bootstrap.Modal(document.getElementById('orderDetailModal')).show();
}

function updateOrderStatus(username, orderIndex, newStatus) {
    console.log('Updating order status:', { username, orderIndex, newStatus });
    
    let allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    if (allOrders[username] && allOrders[username][orderIndex]) {
        const order = allOrders[username][orderIndex];
        const oldStatus = order.status;
        
        console.log('Order found:', { oldStatus, newStatus, order });
        
        // Cập nhật trạng thái
        allOrders[username][orderIndex].status = newStatus;
        
        // Nếu chuyển từ pending sang completed, trừ tồn kho
        if (oldStatus === 'pending' && newStatus === 'completed') {
            updateProductStockFromAdmin(order.items);
            showSuccessToast('Đơn hàng đã được duyệt và tồn kho đã được cập nhật!');
        }
        
        // Nếu chuyển từ completed về pending hoặc cancelled, hoàn lại tồn kho
        if (oldStatus === 'completed' && (newStatus === 'pending' || newStatus === 'cancelled')) {
            restoreProductStock(order.items);
            showSuccessToast('Tồn kho đã được hoàn lại!');
        }
        
        // Lưu lại dữ liệu
        localStorage.setItem("orders", JSON.stringify(allOrders));
        console.log('Order status updated successfully');
        
        // Hiển thị thông báo thành công
        showSuccessToast(`Đã cập nhật trạng thái đơn hàng thành "${newStatus === 'completed' ? 'Hoàn thành' : newStatus === 'processing' ? 'Đang xử lý' : newStatus === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}"`);
        
        // Reload lại bảng đơn hàng và dashboard
        loadOrders();
        loadDashboardData(); // Update dashboard stats
    } else {
        console.error('Order not found:', { username, orderIndex, allOrders });
        showErrorToast('Không tìm thấy đơn hàng để cập nhật!');
    }
}

// Hàm trừ tồn kho từ admin (khi duyệt đơn hàng)
function updateProductStockFromAdmin(orderItems) {
    let adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    
    orderItems.forEach(orderItem => {
        const productIndex = adminProducts.findIndex(p => p.id === orderItem.id);
        
        if (productIndex !== -1) {
            adminProducts[productIndex].stock -= orderItem.quantity;
            
            // Đảm bảo stock không âm
            if (adminProducts[productIndex].stock < 0) {
                adminProducts[productIndex].stock = 0;
            }
            
            // Cập nhật status nếu hết hàng
            if (adminProducts[productIndex].stock === 0) {
                adminProducts[productIndex].status = 'out_of_stock';
            }
            
            console.log(`Admin approved: Updated stock for ${orderItem.title}: ${adminProducts[productIndex].stock} remaining`);
        }
    });
    
    localStorage.setItem("adminProducts", JSON.stringify(adminProducts));
}

// Hàm hoàn lại tồn kho (khi hủy đơn hàng đã duyệt)
function restoreProductStock(orderItems) {
    let adminProducts = JSON.parse(localStorage.getItem("adminProducts")) || [];
    
    orderItems.forEach(orderItem => {
        const productIndex = adminProducts.findIndex(p => p.id === orderItem.id);
        
        if (productIndex !== -1) {
            adminProducts[productIndex].stock += orderItem.quantity;
            
            // Cập nhật status nếu có hàng trở lại
            if (adminProducts[productIndex].stock > 0 && adminProducts[productIndex].status === 'out_of_stock') {
                adminProducts[productIndex].status = 'active';
            }
            
            console.log(`Stock restored for ${orderItem.title}: ${adminProducts[productIndex].stock} available`);
        }
    });
    
    localStorage.setItem("adminProducts", JSON.stringify(adminProducts));
}

function getOrderStatusText(status) {
    const statusText = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    return statusText[status] || status;
}

/***********************
 * CUSTOMERS MANAGEMENT
 ***********************/
function loadCustomers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    const tbody = document.getElementById('customersTable');
    
    tbody.innerHTML = '';
    
    // Lọc bỏ admin users - chỉ lấy khách hàng thực
    const customers = users.filter(user => 
        user.username !== 'admin' && 
        user.role !== 'admin'
    );
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Chưa có khách hàng nào</td></tr>';
        return;
    }
    
    customers.forEach((user, index) => {
        // Lấy đơn hàng thực của khách hàng từ localStorage "orders"
        const userOrders = allOrders[user.username] || [];
        
        // Tính tổng chi tiêu từ các đơn hàng hoàn thành
        const totalSpent = userOrders.reduce((sum, order) => {
            const orderTotal = order.items.reduce((itemSum, item) => 
                itemSum + (item.price * item.quantity), 0);
            return order.status === 'completed' ? sum + orderTotal : sum;
        }, 0);
        
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${userOrders.length}</td>
                <td>${formatVND(totalSpent)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewCustomerDetail('${user.username}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function viewCustomerDetail(username) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    const user = users.find(u => u.username === username);
    const userOrders = allOrders[username] || [];
    
    if (!user) return;
    
    // Tính tổng chi tiêu từ các đơn hàng hoàn thành
    const totalSpent = userOrders.reduce((sum, order) => {
        const orderTotal = order.items.reduce((itemSum, item) => 
            itemSum + (item.price * item.quantity), 0);
        return order.status === 'completed' ? sum + orderTotal : sum;
    }, 0);
    
    // Tạo nội dung chi tiết
    let orderDetails = '';
    if (userOrders.length > 0) {
        orderDetails = '\n\nChi tiết đơn hàng:\n';
        userOrders.forEach((order, index) => {
            const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const statusText = {
                'pending': 'Chờ xử lý',
                'processing': 'Đang xử lý', 
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy'
            };
            orderDetails += `\n${index + 1}. Đơn #${order.id || (index + 1)} - ${formatVND(orderTotal)} - ${statusText[order.status] || 'Chờ xử lý'}`;
        });
    }
    
    alert(`Thông tin khách hàng: ${user.name}\nTên đăng nhập: ${user.username}\nEmail: ${user.email || 'Chưa có'}\nSố đơn hàng: ${userOrders.length}\nTổng chi tiêu: ${formatVND(totalSpent)}${orderDetails}`);
}

/***********************
 * STATISTICS
 ***********************/
function loadStatistics() {
    loadInventoryStatistics();
    loadTopProducts();
    loadTopCustomers();
    loadRevenueStatistics();
}

// Thống kê tồn kho
function loadInventoryStatistics() {
    console.log('Loading inventory statistics...');
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    console.log('Products found:', products.length);
    console.log('Products data:', products);
    
    let totalProducts = products.length;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalInventoryValue = 0;
    
    let inventoryDetails = '';
    
    products.forEach(product => {
        const stock = product.stock || 0;
        const price = product.price || 0;
        
        totalInventoryValue += stock * price;
        
        if (stock === 0) {
            outOfStockProducts++;
        } else if (stock <= 5) {
            lowStockProducts++;
        }
    });
    
    console.log('Inventory stats:', {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue
    });
    
    // Kiểm tra xem các element có tồn tại không
    const totalProductsEl = document.getElementById('inventoryTotalProducts');
    const lowStockEl = document.getElementById('inventoryLowStockProducts');
    const outOfStockEl = document.getElementById('inventoryOutOfStockProducts');
    const totalValueEl = document.getElementById('inventoryTotalValue');
    
    console.log('Elements found:', {
        totalProducts: !!totalProductsEl,
        lowStock: !!lowStockEl,
        outOfStock: !!outOfStockEl,
        totalValue: !!totalValueEl
    });
    
    // Cập nhật số liệu tổng quan
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (lowStockEl) lowStockEl.textContent = lowStockProducts;
    if (outOfStockEl) outOfStockEl.textContent = outOfStockProducts;
    if (totalValueEl) totalValueEl.textContent = formatVND(totalInventoryValue);
    
    // Chi tiết tồn kho
    inventoryDetails = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead class="table-light">
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Tồn kho</th>
                        <th>Giá trị</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Sắp xếp theo tồn kho thấp nhất
    const sortedProducts = products.sort((a, b) => (a.stock || 0) - (b.stock || 0)).slice(0, 10);
    
    if (sortedProducts.length === 0) {
        inventoryDetails += `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Chưa có sản phẩm nào trong hệ thống
                </td>
            </tr>
        `;
    } else {
        sortedProducts.forEach(product => {
            const stock = product.stock || 0;
            const value = stock * (product.price || 0);
            let statusClass = 'success';
            let statusText = 'Đủ hàng';
            
            if (stock === 0) {
                statusClass = 'danger';
                statusText = 'Hết hàng';
            } else if (stock <= 5) {
                statusClass = 'warning';
                statusText = 'Sắp hết';
            }
            
            inventoryDetails += `
                <tr>
                    <td>${product.title}</td>
                    <td>${stock}</td>
                    <td>${formatVND(value)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
    }
    
    inventoryDetails += '</tbody></table></div>';
    
    const inventoryDetailsEl = document.getElementById('inventoryDetails');
    if (inventoryDetailsEl) {
        inventoryDetailsEl.innerHTML = inventoryDetails;
    } else {
        console.error('inventoryDetails element not found!');
    }
    
    console.log('Inventory statistics loaded successfully');
}


// Top 10 sản phẩm bán chạy
function loadTopProducts() {
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    const productSales = {};
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        userOrders.forEach(order => {
            if (order.status === 'completed') {
                order.items.forEach(item => {
                    if (!productSales[item.id]) {
                        productSales[item.id] = {
                            title: item.title,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productSales[item.id].quantity += item.quantity;
                    productSales[item.id].revenue += item.price * item.quantity;
                });
            }
        });
    });
    
    const sortedProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b.quantity - a.quantity)
        .slice(0, 10);
    
    let html = '';
    if (sortedProducts.length === 0) {
        html = '<p class="text-muted text-center">Chưa có dữ liệu bán hàng</p>';
    } else {
        html = '<div class="list-group list-group-flush">';
        sortedProducts.forEach(([id, data], index) => {
            const rankIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <span class="me-2">${rankIcon}</span>
                        <strong>${data.title}</strong>
                        <br><small class="text-muted">Doanh thu: ${formatVND(data.revenue)}</small>
                    </div>
                    <span class="badge bg-primary rounded-pill">${data.quantity} đã bán</span>
                </div>
            `;
        });
        html += '</div>';
    }
    
    document.getElementById('topProducts').innerHTML = html;
}

// Khách hàng mua nhiều
function loadTopCustomers() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    const customerStats = {};
    
    // Lọc bỏ admin users
    const customers = users.filter(user => 
        user.username !== 'admin' && 
        user.role !== 'admin'
    );
    
    customers.forEach(customer => {
        const userOrders = allOrders[customer.username] || [];
        let totalSpent = 0;
        let totalOrders = 0;
        
        userOrders.forEach(order => {
            if (order.status === 'completed') {
                totalOrders++;
                const orderTotal = order.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0);
                totalSpent += orderTotal;
            }
        });
        
        if (totalSpent > 0) {
            customerStats[customer.username] = {
                name: customer.name,
                totalSpent,
                totalOrders,
                avgOrderValue: totalSpent / totalOrders
            };
        }
    });
    
    const sortedCustomers = Object.entries(customerStats)
        .sort(([,a], [,b]) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
    
    let html = '';
    if (sortedCustomers.length === 0) {
        html = '<p class="text-muted text-center">Chưa có dữ liệu khách hàng</p>';
    } else {
        html = '<div class="list-group list-group-flush">';
        sortedCustomers.forEach(([username, data], index) => {
            const rankIcon = index < 3 ? ['👑', '🥈', '🥉'][index] : `${index + 1}.`;
            html += `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="me-2">${rankIcon}</span>
                            <strong>${data.name}</strong>
                            <br><small class="text-muted">${data.totalOrders} đơn hàng • Trung bình: ${formatVND(data.avgOrderValue)}</small>
                        </div>
                        <span class="badge bg-success rounded-pill">${formatVND(data.totalSpent)}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    document.getElementById('topCustomers').innerHTML = html;
}

// Doanh thu theo thời gian
function loadRevenueStatistics() {
    const filter = document.getElementById('revenueFilter').value;
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    let revenueData = {};
    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;
    
    const now = new Date();
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        userOrders.forEach(order => {
            if (order.status === 'completed' && order.date) {
                const orderDate = new Date(order.date);
                const orderTotal = order.items.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0);
                
                let periodKey = '';
                
                if (filter === 'daily') {
                    periodKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
                } else if (filter === 'monthly') {
                    periodKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                } else if (filter === 'yearly') {
                    periodKey = orderDate.getFullYear().toString();
                }
                
                if (!revenueData[periodKey]) {
                    revenueData[periodKey] = 0;
                }
                revenueData[periodKey] += orderTotal;
            }
        });
    });
    
    // Tính toán kỳ hiện tại và kỳ trước
    if (filter === 'daily') {
        const today = now.toISOString().split('T')[0];
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        currentPeriodRevenue = revenueData[today] || 0;
        previousPeriodRevenue = revenueData[yesterday] || 0;
    } else if (filter === 'monthly') {
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
        currentPeriodRevenue = revenueData[thisMonth] || 0;
        previousPeriodRevenue = revenueData[lastMonth] || 0;
    } else if (filter === 'yearly') {
        const thisYear = now.getFullYear().toString();
        const lastYear = (now.getFullYear() - 1).toString();
        currentPeriodRevenue = revenueData[thisYear] || 0;
        previousPeriodRevenue = revenueData[lastYear] || 0;
    }
    
    // Tính tăng trưởng
    let growth = 0;
    if (previousPeriodRevenue > 0) {
        growth = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100;
    }
    
    // Cập nhật UI
    document.getElementById('currentPeriodRevenue').textContent = formatVND(currentPeriodRevenue);
    document.getElementById('previousPeriodRevenue').textContent = formatVND(previousPeriodRevenue);
    
    const growthElement = document.getElementById('revenueGrowth');
    growthElement.textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    growthElement.className = growth >= 0 ? 'text-success' : 'text-danger';
    
    // Tạo biểu đồ
    createRevenueChart(revenueData, filter);
}

// Tạo biểu đồ doanh thu
function createRevenueChart(data, filter) {
    const sortedData = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped">
                <thead class="table-dark">
                    <tr>
                        <th>Thời gian</th>
                        <th>Doanh thu</th>
                        <th>Biểu đồ</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const maxRevenue = Math.max(...Object.values(data));
    
    sortedData.slice(-12).forEach(([period, revenue]) => {
        const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
        let displayPeriod = period;
        
        if (filter === 'monthly') {
            const [year, month] = period.split('-');
            displayPeriod = `${month}/${year}`;
        }
        
        html += `
            <tr>
                <td>${displayPeriod}</td>
                <td><strong>${formatVND(revenue)}</strong></td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-success" style="width: ${percentage}%"></div>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    
    if (sortedData.length === 0) {
        html = '<p class="text-muted text-center">Chưa có dữ liệu doanh thu</p>';
    }
    
    document.getElementById('revenueChart').innerHTML = html;
}

// Xuất báo cáo
function exportStatistics() {
    // Hiển thị modal chọn định dạng xuất
    showExportModal();
}

// Hiển thị modal chọn định dạng xuất báo cáo
function showExportModal() {
    const modalHTML = `
        <div class="modal fade" id="exportModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-download me-2"></i>Xuất báo cáo thống kê
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Chọn định dạng xuất:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="exportFormat" id="exportExcel" value="excel" checked>
                                <label class="form-check-label" for="exportExcel">
                                    <i class="fas fa-file-excel text-success me-2"></i>Excel (.xlsx) - Khuyến nghị
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="exportFormat" id="exportCSV" value="csv">
                                <label class="form-check-label" for="exportCSV">
                                    <i class="fas fa-file-csv text-info me-2"></i>CSV (.csv) - Dữ liệu thô
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="exportFormat" id="exportJSON" value="json">
                                <label class="form-check-label" for="exportJSON">
                                    <i class="fas fa-file-code text-warning me-2"></i>JSON (.json) - Dữ liệu kỹ thuật
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nội dung báo cáo:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="includeInventory" checked>
                                <label class="form-check-label" for="includeInventory">
                                    Thống kê tồn kho
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="includeTopProducts" checked>
                                <label class="form-check-label" for="includeTopProducts">
                                    Top sản phẩm bán chạy
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="includeTopCustomers" checked>
                                <label class="form-check-label" for="includeTopCustomers">
                                    Khách hàng VIP
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="includeRevenue" checked>
                                <label class="form-check-label" for="includeRevenue">
                                    Doanh thu theo thời gian
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                        <button type="button" class="btn btn-success" onclick="executeExport()">
                            <i class="fas fa-download me-1"></i>Xuất báo cáo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào DOM nếu chưa có
    if (!document.getElementById('exportModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Hiển thị modal
    new bootstrap.Modal(document.getElementById('exportModal')).show();
}

// Thực hiện xuất báo cáo
function executeExport() {
    const format = document.querySelector('input[name="exportFormat"]:checked').value;
    const includeInventory = document.getElementById('includeInventory').checked;
    const includeTopProducts = document.getElementById('includeTopProducts').checked;
    const includeTopCustomers = document.getElementById('includeTopCustomers').checked;
    const includeRevenue = document.getElementById('includeRevenue').checked;
    
    // Thu thập dữ liệu
    const reportData = collectReportData(includeInventory, includeTopProducts, includeTopCustomers, includeRevenue);
    
    // Xuất theo định dạng được chọn
    switch (format) {
        case 'excel':
            exportToExcel(reportData);
            break;
        case 'csv':
            exportToCSV(reportData);
            break;
        case 'json':
            exportToJSON(reportData);
            break;
    }
    
    // Đóng modal
    bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
}

// Thu thập dữ liệu báo cáo
function collectReportData(includeInventory, includeTopProducts, includeTopCustomers, includeRevenue) {
    const data = {
        metadata: {
            title: 'Báo cáo thống kê hệ thống',
            generatedAt: new Date().toLocaleString('vi-VN'),
            generatedBy: 'Admin Panel',
            period: document.getElementById('revenueFilter') ? document.getElementById('revenueFilter').value : 'monthly'
        },
        sections: {}
    };
    
    if (includeInventory) {
        const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
        let totalValue = 0;
        let lowStock = 0;
        let outOfStock = 0;
        
        const inventoryDetails = products.map(product => {
            const stock = product.stock || 0;
            const value = stock * (product.price || 0);
            totalValue += value;
            
            if (stock === 0) outOfStock++;
            else if (stock <= 5) lowStock++;
            
            return {
                name: product.title,
                stock: stock,
                price: product.price || 0,
                value: value,
                status: stock === 0 ? 'Hết hàng' : stock <= 5 ? 'Sắp hết' : 'Đủ hàng'
            };
        });
        
        data.sections.inventory = {
            summary: {
                totalProducts: products.length,
                lowStockProducts: lowStock,
                outOfStockProducts: outOfStock,
                totalValue: totalValue
            },
            details: inventoryDetails
        };
    }
    
    if (includeTopProducts) {
        const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
        const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
        const productSales = {};
        
        Object.keys(allOrders).forEach(username => {
            const userOrders = allOrders[username] || [];
            userOrders.forEach(order => {
                if (order.status === 'completed') {
                    order.items.forEach(item => {
                        if (!productSales[item.id]) {
                            productSales[item.id] = {
                                name: item.title,
                                quantity: 0,
                                revenue: 0
                            };
                        }
                        productSales[item.id].quantity += item.quantity;
                        productSales[item.id].revenue += item.price * item.quantity;
                    });
                }
            });
        });
        
        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b.quantity - a.quantity)
            .slice(0, 10)
            .map(([id, data], index) => ({
                rank: index + 1,
                name: data.name,
                quantitySold: data.quantity,
                revenue: data.revenue
            }));
        
        data.sections.topProducts = topProducts;
    }
    
    if (includeTopCustomers) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
        
        const customerStats = users
            .filter(user => user.username !== 'admin' && user.role !== 'admin')
            .map(customer => {
                const userOrders = allOrders[customer.username] || [];
                let totalSpent = 0;
                let totalOrders = 0;
                
                userOrders.forEach(order => {
                    if (order.status === 'completed') {
                        totalOrders++;
                        const orderTotal = order.items.reduce((sum, item) => 
                            sum + (item.price * item.quantity), 0);
                        totalSpent += orderTotal;
                    }
                });
                
                return {
                    name: customer.name,
                    username: customer.username,
                    totalOrders: totalOrders,
                    totalSpent: totalSpent,
                    avgOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
                };
            })
            .filter(customer => customer.totalSpent > 0)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
            .map((customer, index) => ({
                rank: index + 1,
                ...customer
            }));
        
        data.sections.topCustomers = customerStats;
    }
    
    if (includeRevenue) {
        const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
        const filter = document.getElementById('revenueFilter') ? document.getElementById('revenueFilter').value : 'monthly';
        const revenueData = {};
        
        Object.keys(allOrders).forEach(username => {
            const userOrders = allOrders[username] || [];
            userOrders.forEach(order => {
                if (order.status === 'completed' && order.date) {
                    const orderDate = new Date(order.date);
                    const orderTotal = order.items.reduce((sum, item) => 
                        sum + (item.price * item.quantity), 0);
                    
                    let periodKey = '';
                    if (filter === 'daily') {
                        periodKey = orderDate.toISOString().split('T')[0];
                    } else if (filter === 'monthly') {
                        periodKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                    } else if (filter === 'yearly') {
                        periodKey = orderDate.getFullYear().toString();
                    }
                    
                    if (!revenueData[periodKey]) {
                        revenueData[periodKey] = 0;
                    }
                    revenueData[periodKey] += orderTotal;
                }
            });
        });
        
        const revenueArray = Object.entries(revenueData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([period, revenue]) => ({
                period: period,
                revenue: revenue
            }));
        
        data.sections.revenue = {
            filter: filter,
            data: revenueArray
        };
    }
    
    return data;
}

// Xuất Excel (HTML table format)
function exportToExcel(data) {
    let html = `
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; }
                table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { background-color: #4CAF50; color: white; text-align: center; padding: 20px; }
                .section-title { background-color: #2196F3; color: white; padding: 10px; margin: 20px 0 10px 0; }
                .number { text-align: right; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${data.metadata.title}</h1>
                <p>Tạo lúc: ${data.metadata.generatedAt}</p>
            </div>
    `;
    
    // Thống kê tồn kho
    if (data.sections.inventory) {
        html += `
            <div class="section-title">THỐNG KÊ TỒN KHO</div>
            <table>
                <tr><th>Chỉ số</th><th>Giá trị</th></tr>
                <tr><td>Tổng sản phẩm</td><td class="number">${data.sections.inventory.summary.totalProducts}</td></tr>
                <tr><td>Sắp hết hàng</td><td class="number">${data.sections.inventory.summary.lowStockProducts}</td></tr>
                <tr><td>Hết hàng</td><td class="number">${data.sections.inventory.summary.outOfStockProducts}</td></tr>
                <tr><td>Tổng giá trị tồn kho</td><td class="number">${formatVND(data.sections.inventory.summary.totalValue)}</td></tr>
            </table>
            
            <h3>Chi tiết tồn kho</h3>
            <table>
                <tr><th>Sản phẩm</th><th>Tồn kho</th><th>Giá</th><th>Giá trị</th><th>Trạng thái</th></tr>
        `;
        
        data.sections.inventory.details.forEach(item => {
            html += `<tr>
                <td>${item.name}</td>
                <td class="number">${item.stock}</td>
                <td class="number">${formatVND(item.price)}</td>
                <td class="number">${formatVND(item.value)}</td>
                <td>${item.status}</td>
            </tr>`;
        });
        
        html += '</table>';
    }
    
    // Top sản phẩm
    if (data.sections.topProducts) {
        html += `
            <div class="section-title">TOP SẢN PHẨM BÁN CHẠY</div>
            <table>
                <tr><th>Hạng</th><th>Sản phẩm</th><th>Số lượng bán</th><th>Doanh thu</th></tr>
        `;
        
        data.sections.topProducts.forEach(item => {
            html += `<tr>
                <td class="number">${item.rank}</td>
                <td>${item.name}</td>
                <td class="number">${item.quantitySold}</td>
                <td class="number">${formatVND(item.revenue)}</td>
            </tr>`;
        });
        
        html += '</table>';
    }
    
    // Top khách hàng
    if (data.sections.topCustomers) {
        html += `
            <div class="section-title">KHÁCH HÀNG VIP</div>
            <table>
                <tr><th>Hạng</th><th>Tên khách hàng</th><th>Số đơn hàng</th><th>Tổng chi tiêu</th><th>Trung bình/đơn</th></tr>
        `;
        
        data.sections.topCustomers.forEach(item => {
            html += `<tr>
                <td class="number">${item.rank}</td>
                <td>${item.name}</td>
                <td class="number">${item.totalOrders}</td>
                <td class="number">${formatVND(item.totalSpent)}</td>
                <td class="number">${formatVND(item.avgOrderValue)}</td>
            </tr>`;
        });
        
        html += '</table>';
    }
    
    // Doanh thu
    if (data.sections.revenue) {
        html += `
            <div class="section-title">DOANH THU THEO ${data.sections.revenue.filter.toUpperCase()}</div>
            <table>
                <tr><th>Thời gian</th><th>Doanh thu</th></tr>
        `;
        
        data.sections.revenue.data.forEach(item => {
            html += `<tr>
                <td>${item.period}</td>
                <td class="number">${formatVND(item.revenue)}</td>
            </tr>`;
        });
        
        html += '</table>';
    }
    
    html += '</body></html>';
    
    // Tạo file và download
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('Báo cáo Excel đã được xuất thành công!');
}

// Xuất CSV
function exportToCSV(data) {
    let csv = `Báo cáo thống kê hệ thống\n`;
    csv += `Tạo lúc: ${data.metadata.generatedAt}\n\n`;
    
    // Thống kê tồn kho
    if (data.sections.inventory) {
        csv += `THỐNG KÊ TỒN KHO\n`;
        csv += `Chỉ số,Giá trị\n`;
        csv += `Tổng sản phẩm,${data.sections.inventory.summary.totalProducts}\n`;
        csv += `Sắp hết hàng,${data.sections.inventory.summary.lowStockProducts}\n`;
        csv += `Hết hàng,${data.sections.inventory.summary.outOfStockProducts}\n`;
        csv += `Tổng giá trị tồn kho,${data.sections.inventory.summary.totalValue}\n\n`;
        
        csv += `Chi tiết tồn kho\n`;
        csv += `Sản phẩm,Tồn kho,Giá,Giá trị,Trạng thái\n`;
        data.sections.inventory.details.forEach(item => {
            csv += `"${item.name}",${item.stock},${item.price},${item.value},"${item.status}"\n`;
        });
        csv += `\n`;
    }
    
    // Top sản phẩm
    if (data.sections.topProducts) {
        csv += `TOP SẢN PHẨM BÁN CHẠY\n`;
        csv += `Hạng,Sản phẩm,Số lượng bán,Doanh thu\n`;
        data.sections.topProducts.forEach(item => {
            csv += `${item.rank},"${item.name}",${item.quantitySold},${item.revenue}\n`;
        });
        csv += `\n`;
    }
    
    // Top khách hàng
    if (data.sections.topCustomers) {
        csv += `KHÁCH HÀNG VIP\n`;
        csv += `Hạng,Tên khách hàng,Số đơn hàng,Tổng chi tiêu,Trung bình/đơn\n`;
        data.sections.topCustomers.forEach(item => {
            csv += `${item.rank},"${item.name}",${item.totalOrders},${item.totalSpent},${item.avgOrderValue}\n`;
        });
        csv += `\n`;
    }
    
    // Doanh thu
    if (data.sections.revenue) {
        csv += `DOANH THU THEO ${data.sections.revenue.filter.toUpperCase()}\n`;
        csv += `Thời gian,Doanh thu\n`;
        data.sections.revenue.data.forEach(item => {
            csv += `${item.period},${item.revenue}\n`;
        });
    }
    
    // Tạo file và download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('Báo cáo CSV đã được xuất thành công!');
}

// Xuất JSON
function exportToJSON(data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('Báo cáo JSON đã được xuất thành công!');
}
            html += `
                <div class="stat-item">
                    <div class="stat-number">${data.quantity}</div>
                    <div class="stat-label">${data.title}</div>
                    <small class="text-muted">${formatVND(data.revenue)}</small>
                </div>
            `;
        ;
    
    
    document.getElementById('bestSellingProducts').innerHTML = html;


function loadStockStatus() {
    console.log('Loading stock status...');
    const products = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY)) || [];
    
    console.log('Products for stock analysis:', products.length);
    
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10);
    const outOfStock = products.filter(p => p.stock === 0);
    const inStock = products.filter(p => p.stock > 10);
    
    console.log('Stock analysis:', {
        inStock: inStock.length,
        lowStock: lowStock.length,
        outOfStock: outOfStock.length,
        total: products.length
    });
    
    const html = `
        <div class="stat-item">
            <div class="stat-number text-success">${inStock.length}</div>
            <div class="stat-label">Còn hàng (>10)</div>
            <small class="text-muted">${inStock.map(p => p.title.substring(0, 30) + '...').join(', ')}</small>
        </div>
        <div class="stat-item">
            <div class="stat-number text-warning">${lowStock.length}</div>
            <div class="stat-label">Sắp hết hàng (≤10)</div>
            <small class="text-muted">${lowStock.map(p => `${p.title.substring(0, 20)}... (${p.stock})`).join(', ')}</small>
        </div>
        <div class="stat-item">
            <div class="stat-number text-danger">${outOfStock.length}</div>
            <div class="stat-label">Hết hàng (=0)</div>
            <small class="text-muted">${outOfStock.length > 0 ? outOfStock.map(p => p.title.substring(0, 30) + '...').join(', ') : 'Không có sản phẩm hết hàng'}</small>
        </div>
        <div class="stat-item">
            <div class="stat-number text-info">${products.length}</div>
            <div class="stat-label">Tổng sản phẩm</div>
        </div>
    `;
    
    document.getElementById('stockStatus').innerHTML = html;
    console.log('Stock status loaded successfully');
}

function loadMonthlyRevenue() {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || {};
    
    // Group orders by month từ dữ liệu thực
    const monthlyData = {};
    
    console.log('Processing monthly revenue from orders:', Object.keys(allOrders).length, 'users');
    
    Object.keys(allOrders).forEach(username => {
        const userOrders = allOrders[username] || [];
        console.log(`Processing ${userOrders.length} orders for user: ${username}`);
        
        userOrders.forEach(order => {
            const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Chỉ tính đơn hàng hoàn thành
            if (order.status === 'completed' || !order.status) {
                let orderDate;
                
                // Xử lý ngày tháng linh hoạt
                if (order.date) {
                    // Nếu là ISO string hoặc có thể parse được
                    orderDate = new Date(order.date);
                    
                    // Nếu parse không thành công, thử parse theo format locale
                    if (isNaN(orderDate.getTime())) {
                        // Thử parse theo format dd/mm/yyyy, hh:mm:ss
                        const dateParts = order.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                        if (dateParts) {
                            orderDate = new Date(dateParts[3], dateParts[2] - 1, dateParts[1]);
                        } else {
                            // Fallback: sử dụng ngày hiện tại
                            orderDate = new Date();
                        }
                    }
                } else {
                    // Fallback: sử dụng ngày hiện tại
                    orderDate = new Date();
                }
                
                // Tạo key theo định dạng YYYY-MM
                const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                
                console.log(`Order date: ${order.date} -> Parsed: ${orderDate} -> Month key: ${monthKey}`);
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        revenue: 0,
                        orders: 0,
                        month: orderDate.getMonth() + 1,
                        year: orderDate.getFullYear()
                    };
                }
                
                monthlyData[monthKey].revenue += orderTotal;
                monthlyData[monthKey].orders += 1;
            }
        });
    });
    
    console.log('Monthly data processed:', monthlyData);
    
    // Create enhanced table representation
    let html = '';
    
    if (Object.keys(monthlyData).length > 0) {
        html = '<div class="table-responsive">';
        html += '<table class="table table-sm table-striped">';
        html += '<thead class="table-dark"><tr><th>Tháng/Năm</th><th>Số đơn hàng</th><th>Doanh thu</th><th>Trung bình/đơn</th></tr></thead><tbody>';
        
        // Sắp xếp theo thời gian (mới nhất trước)
        Object.entries(monthlyData)
            .sort(([a], [b]) => b.localeCompare(a))
            .forEach(([monthKey, data]) => {
                const avgPerOrder = data.orders > 0 ? data.revenue / data.orders : 0;
                const monthName = new Date(data.year, data.month - 1).toLocaleDateString('vi-VN', { 
                    month: 'long', 
                    year: 'numeric' 
                });
                
                html += `
                    <tr>
                        <td><strong>${monthName}</strong></td>
                        <td><span class="badge bg-info">${data.orders}</span></td>
                        <td><span class="text-success fw-bold">${formatVND(data.revenue)}</span></td>
                        <td><span class="text-muted">${formatVND(avgPerOrder)}</span></td>
                    </tr>
                `;
            });
        
        html += '</tbody></table></div>';
        
        // Thêm tổng kết
        const totalRevenue = Object.values(monthlyData).reduce((sum, data) => sum + data.revenue, 0);
        const totalOrders = Object.values(monthlyData).reduce((sum, data) => sum + data.orders, 0);
        
        html += `
            <div class="mt-3 p-3 bg-light rounded">
                <div class="row text-center">
                    <div class="col-md-4">
                        <h6 class="text-muted mb-1">Tổng doanh thu</h6>
                        <h5 class="text-success mb-0">${formatVND(totalRevenue)}</h5>
                    </div>
                    <div class="col-md-4">
                        <h6 class="text-muted mb-1">Tổng đơn hàng</h6>
                        <h5 class="text-info mb-0">${totalOrders}</h5>
                    </div>
                    <div class="col-md-4">
                        <h6 class="text-muted mb-1">Trung bình/đơn</h6>
                        <h5 class="text-warning mb-0">${formatVND(totalOrders > 0 ? totalRevenue / totalOrders : 0)}</h5>
                    </div>
                </div>
            </div>
        `;
    } else {
        html = `
            <div class="text-center py-4">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <h6 class="text-muted">Chưa có dữ liệu doanh thu</h6>
                <p class="text-muted small">Doanh thu sẽ được hiển thị khi có đơn hàng hoàn thành</p>
            </div>
        `;
    }
    
    document.getElementById('monthlyRevenue').innerHTML = html;
}

/***********************
 * DEBUG & UTILITY FUNCTIONS
 ***********************/
function resetAdminData() {
    if (confirm('Bạn có chắc chắn muốn reset tất cả dữ liệu? Điều này sẽ xóa:\n\n• Tất cả danh mục và sản phẩm\n• Tất cả đơn hàng\n• Tất cả người dùng (trừ admin)\n\nHành động này không thể hoàn tác!')) {
        // Reset categories and products
        localStorage.removeItem(CATEGORIES_KEY);
        localStorage.removeItem(ADMIN_PRODUCTS_KEY);
        
        // Reset orders
        localStorage.removeItem('orders');
        
        // Reset users (keep only admin)
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const adminUsers = users.filter(user => user.username === 'admin' || user.role === 'admin');
        localStorage.setItem('users', JSON.stringify(adminUsers));
        
        // Reset brands
        localStorage.removeItem('brands');
        
        // Clear current user session (if not admin)
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.username !== 'admin' && currentUser.role !== 'admin') {
            localStorage.removeItem('currentUser');
        }
        
        // Reinitialize data
        initializeAdminData();
        
        // Wait a bit then reload all sections
        setTimeout(() => {
            // Refresh all admin sections
            loadDashboard();
            loadCategories();
            loadProducts();
            loadOrders();
            loadCustomers();
            loadStatistics();
            loadBrands();
        }, 500);
        
        alert('✅ Tất cả dữ liệu đã được reset thành công!\n\n📊 Dữ liệu mặc định đã được tạo lại.');
    }
}

// Export functions to window
window.resetAdminData = resetAdminData;
window.handleImageUpload = handleImageUpload;
window.exportStatistics = exportStatistics;
window.executeExport = executeExport;
window.loadRevenueStatistics = loadRevenueStatistics;

// Thêm event listener cho thumbnail URL input
document.addEventListener('DOMContentLoaded', function() {
    // Event listener cho việc nhập URL trực tiếp
    const thumbnailInput = document.getElementById('productThumbnail');
    if (thumbnailInput) {
        thumbnailInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url && (url.startsWith('http') || url.startsWith('data:'))) {
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('previewImg');
                if (preview && previewImg) {
                    previewImg.src = url;
                    preview.style.display = 'block';
                    
                    // Ẩn preview nếu ảnh không load được
                    previewImg.onerror = function() {
                        preview.style.display = 'none';
                    };
                }
            } else if (!url) {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.style.display = 'none';
                }
            }
        });
    }
});

// Function to manually import all products from defaultProducts
function forceImportAllProducts() {
    if (typeof defaultProducts !== 'undefined' && defaultProducts && defaultProducts.length > 0) {
        console.log('Force importing all', defaultProducts.length, 'products from defaultProducts...');
        
        const adminProducts = defaultProducts.map(product => ({
            ...product,
            stock: product.stock || Math.floor(Math.random() * 100) + 10,
            sold: Math.floor(Math.random() * 50),
            status: 'active',
            images: product.images || [product.thumbnail],
            description: product.description || `Mô tả cho ${product.title}`,
            brand: product.brand || '',
            review: product.review || 0
        }));
        
        localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(adminProducts));
        console.log('SUCCESS: Force imported all', adminProducts.length, 'products');
        
        // Refresh displays
        loadProducts();
        loadDashboardData();
        loadStatistics();
        
        alert(`Đã import thành công ${adminProducts.length} sản phẩm từ defaultProducts!`);
    } else {
        alert('Không tìm thấy defaultProducts! Hãy đảm bảo lst-products.js đã được load.');
        console.error('defaultProducts not available:', typeof defaultProducts);
    }
}

// Function to migrate old order data to new format
window.forceImportAllProducts = forceImportAllProducts;

/***********************
 * UTILITY FUNCTIONS
 ***********************/
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function getCategoryName(categoryValue) {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [];
    const category = categories.find(c => c.value === categoryValue);
    return category ? category.name : categoryValue;
}

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
// Show error toast notification
function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show position-fixed" 
             style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
            <i class="fas fa-exclamation-circle me-2"></i>
            <strong>Lỗi!</strong><br>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds (longer for error messages)
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}