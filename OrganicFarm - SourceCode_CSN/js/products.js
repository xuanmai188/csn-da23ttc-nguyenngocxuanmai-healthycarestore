// Use products from lst-products.js

function showSP(category_arr = [], price_arr = [], usage_arr = []) {
  const all_item = document.getElementById("all_item");
  all_item.innerHTML = "";
  
  // Get current products (from admin or default) - always fresh
  let currentProducts = refreshProducts();
  
  // Apply sorting
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    currentProducts = sortProducts(currentProducts, sortSelect.value);
  }
  
  let displayedCount = 0;

  for (let i = 0; i < currentProducts.length; i++) {
    const product = currentProducts[i];

    // Lọc theo category nếu có
    if (category_arr.length > 0 && !category_arr.includes(product.category)) {
      continue;
    }

    // Lọc theo giá nếu có
    if (price_arr.length > 0) {
      let priceMatch = false;
      for (let priceRange of price_arr) {
        const [min, max] = priceRange.split('-').map(Number);
        if (product.price >= min && product.price <= max) {
          priceMatch = true;
          break;
        }
      }
      if (!priceMatch) continue;
    }

    // Lọc theo công dụng nếu có
    if (usage_arr.length > 0) {
      const productUsages = product.usages || [];
      let usageMatch = false;
      for (let usage of usage_arr) {
        if (productUsages.includes(usage)) {
          usageMatch = true;
          break;
        }
      }
      if (!usageMatch) continue;
    }

    displayedCount++;

    // ===== XỬ LÝ GIÁ =====
    const priceText = product.price.toLocaleString("vi-VN") + " đ";

    let discountHTML = "";
    if (
      product.discountPercentage &&
      product.discountPercentage > product.price
    ) {
      discountHTML = `
        <span class="price-original">
          ${product.discountPercentage.toLocaleString("vi-VN")} đ
        </span>
      `;
    }

    // ===== XỬ LÝ TAGS CÔNG DỤNG =====
    let usageTagsHTML = "";
    if (product.usages && product.usages.length > 0) {
      const usageLabels = {
        'nutrition': 'Bổ dưỡng',
        'cooking': 'Nấu ăn', 
        'health': 'Sức khỏe',
        'beauty': 'Làm đẹp',
        'organic': 'Hữu cơ'
      };
      
      usageTagsHTML = `
        <div class="usage-tags mb-2">
          ${product.usages.slice(0, 2).map(usage => 
            `<span class="badge bg-success me-1">${usageLabels[usage] || usage}</span>`
          ).join('')}
        </div>
      `;
    }

    // ===== XỬ LÝ ĐÁNH GIÁ =====
    const reviews = getProductReviews(product.id);
    const avgRating = calculateAverageRating(reviews);
    const reviewCount = reviews.length;
    
    let ratingHTML = "";
    if (reviewCount > 0) {
      ratingHTML = `
        <div class="product-rating mb-2">
          <div class="d-flex align-items-center">
            ${generateStarsHTML(avgRating)}
            <span class="ms-2 text-muted small">(${reviewCount})</span>
          </div>
        </div>
      `;
    } else {
      ratingHTML = `
        <div class="product-rating mb-2">
          <span class="text-muted small">Chưa có đánh giá</span>
        </div>
      `;
    }

    all_item.innerHTML += `
      <div class="product-card">
        <div class="product-image-wrapper">
          <img src="${product.thumbnail}" 
               alt="${product.title}" 
               class="product-image"
               onerror="this.src='./img/default-product.jpg'">
        </div>

        <div class="product-content">
          <a href="./detail.html?id=${product.id}" class="product-title">
            ${product.title}
          </a>

          ${usageTagsHTML}
          ${ratingHTML}

          <div class="product-price">
            <span class="price-current">
              ${priceText}
            </span>
            ${discountHTML}
          </div>

          <div class="product-actions">
            <a class="btn-buy" href="detail.html?id=${product.id}">
              <i class="fas fa-shopping-cart me-2"></i>Mua ngay
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Update product count in heading
  const productCountElement = document.querySelector('.heading h2 span');
  if (productCountElement) {
    const totalProducts = refreshProducts().length;
    if (category_arr.length > 0 || price_arr.length > 0 || usage_arr.length > 0) {
      productCountElement.textContent = `Sản phẩm (${displayedCount}/${totalProducts})`;
    } else {
      productCountElement.textContent = `Sản phẩm (${displayedCount})`;
    }
  }

  // Hiển thị thông báo nếu không có sản phẩm
  if (displayedCount === 0) {
    all_item.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">Không tìm thấy sản phẩm nào</h5>
        <p class="text-muted">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        <button class="btn btn-outline-primary" onclick="clearFilters()">
          <i class="fas fa-refresh me-2"></i>Xóa tất cả bộ lọc
        </button>
      </div>
    `;
  }
}

// New unified filter function
function applyFilters() {
  // Get category filters
  var categoryElements = document.getElementsByClassName('category');
  var category_arr = [];
  for (let i = 0; i < categoryElements.length; i++) {
    if (categoryElements[i].checked) category_arr.push(categoryElements[i].value);
  }

  // Get price filters
  var priceElements = document.getElementsByClassName('price-filter');
  var price_arr = [];
  for (let i = 0; i < priceElements.length; i++) {
    if (priceElements[i].checked) price_arr.push(priceElements[i].value);
  }

  // Get usage filters
  var usageElements = document.getElementsByClassName('usage-filter');
  var usage_arr = [];
  for (let i = 0; i < usageElements.length; i++) {
    if (usageElements[i].checked) usage_arr.push(usageElements[i].value);
  }

  showSP(category_arr, price_arr, usage_arr);
}

function chonSP() {
  applyFilters();
}

function clearFilters() {
  // Uncheck all category checkboxes
  var checkboxes = document.getElementsByClassName('category');
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = false;
  }
  
  // Uncheck all price checkboxes
  var priceCheckboxes = document.getElementsByClassName('price-filter');
  for (let i = 0; i < priceCheckboxes.length; i++) {
    priceCheckboxes[i].checked = false;
  }
  
  // Uncheck all usage checkboxes
  var usageCheckboxes = document.getElementsByClassName('usage-filter');
  for (let i = 0; i < usageCheckboxes.length; i++) {
    usageCheckboxes[i].checked = false;
  }
  
  // Reset sort
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.value = "default";
  }
  
  // Clear search input
  const searchInput = document.getElementById("txtSearch");
  if (searchInput) {
    searchInput.value = "";
  }
  
  // Clear search counter
  document.getElementById("search-counter").innerHTML = "";
  
  // Show all products
  showSP();
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  var category_arr = [];
  if (category) {
    category_arr.push(category);
    
    // Tự động check checkbox tương ứng
    const checkbox = document.querySelector(`input[value="${category}"]`);
    if (checkbox) {
      checkbox.checked = true;
    }
  }
  showSP(category_arr);
  
  // Add real-time search
  const searchInput = document.getElementById("txtSearch");
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      // Debounce search
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        onSearch();
      }, 300);
    });
  }
}

// Add sorting functionality
function applySorting() {
  applyFilters(); // This will re-render with current filters and sorting
}

function sortProducts(products, sortType) {
  const sortedProducts = [...products];
  
  switch(sortType) {
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sortedProducts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    case 'name-desc':
      return sortedProducts.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
    default:
      return sortedProducts; // Default order
  }
}

// Add product count display
function updateProductCount() {
  const currentProducts = refreshProducts();
  const productCountElement = document.querySelector('.heading h2 span');
  if (productCountElement) {
    productCountElement.textContent = `Sản phẩm (${currentProducts.length})`;
  }
}

init();

function onSearch() {
  const query = document.getElementById("txtSearch").value.trim().toLowerCase();

  const all_item = document.getElementById("all_item");
  all_item.innerHTML = "";

  let counter = 0;
  
  // Get current products (from admin or default) - always fresh
  const currentProducts = refreshProducts();

  // Get current filters
  var categoryElements = document.getElementsByClassName('category');
  var category_arr = [];
  for (let i = 0; i < categoryElements.length; i++) {
    if (categoryElements[i].checked) category_arr.push(categoryElements[i].value);
  }

  var priceElements = document.getElementsByClassName('price-filter');
  var price_arr = [];
  for (let i = 0; i < priceElements.length; i++) {
    if (priceElements[i].checked) price_arr.push(priceElements[i].value);
  }

  var usageElements = document.getElementsByClassName('usage-filter');
  var usage_arr = [];
  for (let i = 0; i < usageElements.length; i++) {
    if (usageElements[i].checked) usage_arr.push(usageElements[i].value);
  }

  // Nếu không nhập gì → hiển thị lại với filters hiện tại
  if (!query) {
    showSP(category_arr, price_arr, usage_arr);
    document.getElementById("search-counter").innerHTML = "";
    return;
  }

  for (let i = 0; i < currentProducts.length; i++) {
    const sp = currentProducts[i];

    // Apply search filter
    if (!sp.title.toLowerCase().includes(query)) {
      continue;
    }

    // Apply category filter
    if (category_arr.length > 0 && !category_arr.includes(sp.category)) {
      continue;
    }

    // Apply price filter
    if (price_arr.length > 0) {
      let priceMatch = false;
      for (let priceRange of price_arr) {
        const [min, max] = priceRange.split('-').map(Number);
        if (sp.price >= min && sp.price <= max) {
          priceMatch = true;
          break;
        }
      }
      if (!priceMatch) continue;
    }

    // Apply usage filter
    if (usage_arr.length > 0) {
      const productUsages = sp.usages || [];
      let usageMatch = false;
      for (let usage of usage_arr) {
        if (productUsages.includes(usage)) {
          usageMatch = true;
          break;
        }
      }
      if (!usageMatch) continue;
    }

    counter++;

    // ===== XỬ LÝ GIÁ =====
    const price = sp.price.toLocaleString("vi-VN") + " đ";

    let discountHTML = "";
    if (sp.discountPercentage && sp.discountPercentage > sp.price) {
      discountHTML = `
        <span class="price-original">
          ${sp.discountPercentage.toLocaleString("vi-VN")} đ
        </span>
      `;
    }

    // ===== XỬ LÝ TAGS CÔNG DỤNG =====
    let usageTagsHTML = "";
    if (sp.usages && sp.usages.length > 0) {
      const usageLabels = {
        'nutrition': 'Bổ dưỡng',
        'cooking': 'Nấu ăn', 
        'health': 'Sức khỏe',
        'beauty': 'Làm đẹp',
        'organic': 'Hữu cơ'
      };
      
      usageTagsHTML = `
        <div class="usage-tags mb-2">
          ${sp.usages.slice(0, 2).map(usage => 
            `<span class="badge bg-success me-1">${usageLabels[usage] || usage}</span>`
          ).join('')}
        </div>
      `;
    }

    // ===== XỬ LÝ ĐÁNH GIÁ =====
    const reviews = getProductReviews(sp.id);
    const avgRating = calculateAverageRating(reviews);
    const reviewCount = reviews.length;
    
    let ratingHTML = "";
    if (reviewCount > 0) {
      ratingHTML = `
        <div class="product-rating mb-2">
          <div class="d-flex align-items-center">
            ${generateStarsHTML(avgRating)}
            <span class="ms-2 text-muted small">(${reviewCount})</span>
          </div>
        </div>
      `;
    } else {
      ratingHTML = `
        <div class="product-rating mb-2">
          <span class="text-muted small">Chưa có đánh giá</span>
        </div>
      `;
    }

    all_item.innerHTML += `
      <div class="product-card">
        <div class="product-image-wrapper">
          <img src="${sp.thumbnail}" 
               alt="${sp.title}" 
               class="product-image"
               onerror="this.src='./img/default-product.jpg'">
        </div>

        <div class="product-content">
          <a href="./detail.html?id=${sp.id}" class="product-title">
            ${sp.title}
          </a>

          ${usageTagsHTML}

          <div class="product-price">
            <span class="price-current">${price}</span>
            ${discountHTML}
          </div>

          <div class="product-actions">
            <a class="btn-buy" href="detail.html?id=${sp.id}">
              <i class="fas fa-shopping-cart me-2"></i>Mua ngay
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Hiển thị kết quả tìm kiếm
  if (counter > 0) {
    document.getElementById("search-counter").innerHTML =
      `<div class="alert alert-success search-counter">
        <i class="fas fa-search me-2"></i>Tìm thấy <strong>${counter}</strong> sản phẩm cho từ khóa "<strong>${query}</strong>"
      </div>`;
  } else {
    document.getElementById("search-counter").innerHTML =
      `<div class="alert alert-warning search-counter">
        <i class="fas fa-exclamation-triangle me-2"></i>Không tìm thấy sản phẩm nào cho từ khóa "<strong>${query}</strong>"
      </div>`;
    
    all_item.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">Không tìm thấy sản phẩm nào</h5>
        <p class="text-muted">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
        <button class="btn btn-outline-primary" onclick="clearFilters()">
          <i class="fas fa-refresh me-2"></i>Xóa tất cả bộ lọc
        </button>
      </div>
    `;
  }
}

/***********************
 * REVIEW HELPER FUNCTIONS
 ***********************/

// Get product reviews from localStorage
function getProductReviews(productId) {
  const allReviews = JSON.parse(localStorage.getItem("productReviews")) || {};
  return allReviews[productId] || [];
}

// Calculate average rating
function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
}

// Generate stars HTML
function generateStarsHTML(rating) {
  let html = '';
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += '<i class="fas fa-star text-warning"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      html += '<i class="fas fa-star-half-alt text-warning"></i>';
    } else {
      html += '<i class="far fa-star text-warning"></i>';
    }
  }
  return html;
}