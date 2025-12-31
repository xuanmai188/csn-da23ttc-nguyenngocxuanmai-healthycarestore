// Hàm format VNĐ
function formatVND(price) {
  return price.toLocaleString("vi-VN") + " đ";
}

// Lấy ID từ URL
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Thay đổi hình thumbnail chính
function changeThumbnail(src) {
  document.getElementById("product-thumbnail").style.backgroundImage = `url(${src})`;
  document.getElementById("product-thumbnail-img").src = src;
}

// Lấy dữ liệu chi tiết sản phẩm và render
function getDetailData() {
  const queryId = getProductId();
  
  // Get current products (from admin or default) - always fresh
  const currentProducts = refreshProducts();
  const product = currentProducts.find((p) => p.id === +queryId);

  if (!product) {
    document.getElementById('contentarea').innerHTML = `
      <div class="card text-center p-4 my-4">
        <h1>404 Not Found</h1>
        <p>This page doesn't exist! <a href="./index.html">Go back home.</a></p>
      </div>`;
    return;
  }

  // Store current product globally for cart functions
  window.currentProduct = product;

  // Giá sản phẩm và giá cũ
  const priceText = formatVND(product.price);
  let discountHTML = "";
  if (product.discountPercentage && product.discountPercentage > product.price) {
    discountHTML = `
      <span class="text-decoration-line-through text-muted ms-2">
        ${formatVND(product.discountPercentage)}
      </span>`;
  }

  document.getElementById("product-price").innerHTML = `
    <span class="new-price">${priceText}</span>
    ${discountHTML}
  `;

  // Hiển thị thông tin tồn kho
  updateStockDisplay(product);

  // Load and display reviews
  loadProductReviews(product.id);

  // Thông tin khác
  document.getElementById("product-category").innerHTML = `
    <a href="./products.html?category=${product.category}">${product.category}</a>
  `;
  
  // Update review display in header
  const reviews = getProductReviews(product.id);
  const avgRating = calculateAverageRating(reviews);
  document.getElementById("product-review").innerHTML = `(${reviews.length} reviews)`;
  
  // Update stars in header
  updateStarsDisplay(document.querySelector('.mb-4 .text-warning'), avgRating);
  
  document.getElementById("product-title").innerText = product.title;
  document.getElementById("product-description").innerHTML =
  product.description || "<p>No content</p>";

  // Hình chính
  document.getElementById("product-thumbnail").style.backgroundImage = `url(${product.thumbnail})`;
  document.getElementById("product-thumbnail-img").src = product.thumbnail;

  // Hình phụ
  let imagesHTML = "";
  product.images.forEach(img => {
    imagesHTML += `<div class="col-3">
      <img style="cursor:pointer" src="${img}" alt="" onclick="changeThumbnail('${img}')">
    </div>`;
  });
  document.getElementById("product-images").innerHTML = imagesHTML;

  // Initialize review system
  initializeReviewSystem(product.id);
}

// Cập nhật hiển thị tồn kho
function updateStockDisplay(product) {
  const stockQuantityElement = document.getElementById("stock-quantity");
  const stockStatusElement = document.getElementById("stock-status");
  const addToCartButton = document.querySelector('button[onclick="addToCart()"]');
  const quantityInput = document.getElementById("product-quantity");
  const plusButton = document.getElementById("button-plus");
  const minusButton = document.getElementById("button-minus");

  const stock = product.stock || 0;
  
  stockQuantityElement.textContent = stock;

  if (stock <= 0) {
    // Hết hàng
    stockStatusElement.textContent = "Hết hàng";
    stockStatusElement.className = "badge bg-danger";
    
    // Disable các controls
    addToCartButton.disabled = true;
    addToCartButton.textContent = "Hết hàng";
    addToCartButton.className = "btn btn-secondary";
    
    quantityInput.disabled = true;
    plusButton.disabled = true;
    minusButton.disabled = true;
    
    quantityInput.value = 0;
  } else if (stock <= 5) {
    // Sắp hết hàng
    stockStatusElement.textContent = "Sắp hết hàng";
    stockStatusElement.className = "badge bg-warning";
    
    // Enable controls
    addToCartButton.disabled = false;
    addToCartButton.textContent = "Thêm vào giỏ hàng";
    addToCartButton.className = "btn btn-success";
    
    quantityInput.disabled = false;
    plusButton.disabled = false;
    minusButton.disabled = false;
    
    // Set max quantity
    quantityInput.max = stock;
  } else {
    // Còn hàng
    stockStatusElement.textContent = "Còn hàng";
    stockStatusElement.className = "badge bg-success";
    
    // Enable controls
    addToCartButton.disabled = false;
    addToCartButton.textContent = "Thêm vào giỏ hàng";
    addToCartButton.className = "btn btn-success";
    
    quantityInput.disabled = false;
    plusButton.disabled = false;
    minusButton.disabled = false;
    
    // Set max quantity
    quantityInput.max = stock;
  }
}

// ==================== tăng/giảm số lượng ====================
function increaseValue() {
  const input = document.getElementById("product-quantity");
  const maxStock = parseInt(input.max) || 1;
  let value = parseInt(input.value, 10) || 1;
  
  if (value < maxStock) {
    input.value = value + 1;
  } else {
    // Hiển thị thông báo khi đạt giới hạn tồn kho
    showStockLimitMessage(maxStock);
  }
}

function decreaseValue() {
  const input = document.getElementById("product-quantity");
  let value = parseInt(input.value, 10) || 1;
  input.value = value > 1 ? value - 1 : 1;
}

// Thêm validation cho input số lượng
function validateQuantityInput() {
  const input = document.getElementById("product-quantity");
  const maxStock = parseInt(input.max) || 1;
  let value = parseInt(input.value, 10) || 1;
  
  // Đảm bảo giá trị trong khoảng hợp lệ
  if (value < 1) {
    input.value = 1;
  } else if (value > maxStock) {
    input.value = maxStock;
    showStockLimitMessage(maxStock);
  }
}

function showStockLimitMessage(maxStock) {
  // Tạo toast notification
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="alert alert-warning alert-dismissible fade show position-fixed" 
         style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>Giới hạn tồn kho!</strong><br>
      Chỉ còn ${maxStock} sản phẩm trong kho.
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

// Hàm thêm vào giỏ hàng (cần được gọi từ auth-cart.js)
function addToCart() {
  if (!window.currentProduct) {
    alert('Không tìm thấy thông tin sản phẩm!');
    return;
  }

  const product = window.currentProduct;
  const quantity = parseInt(document.getElementById("product-quantity").value) || 1;
  
  // Kiểm tra tồn kho
  if (product.stock <= 0) {
    alert('Sản phẩm đã hết hàng!');
    return;
  }
  
  if (quantity > product.stock) {
    alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
    return;
  }

  // Kiểm tra đăng nhập
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
    return;
  }

  // Thêm vào giỏ hàng
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    // Kiểm tra tổng số lượng không vượt quá tồn kho
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      alert(`Không thể thêm ${quantity} sản phẩm. Chỉ còn ${product.stock - existingItem.quantity} sản phẩm có thể thêm vào giỏ hàng!`);
      return;
    }
    existingItem.quantity = newQuantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: quantity,
      maxStock: product.stock
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  
  // Cập nhật UI
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }
  if (typeof renderCart === 'function') {
    renderCart();
  }

  // Hiển thị thông báo thành công
  showSuccessMessage(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
}

function showSuccessMessage(message) {
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


// ==================== Gọi hàm ====================
getDetailData();


/***********************
 * REVIEW SYSTEM
 ***********************/

// Initialize review system
function initializeReviewSystem(productId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  
  if (user) {
    // Show review form for logged in users
    document.getElementById("review-form-section").style.display = "block";
    document.getElementById("login-prompt").style.display = "none";
    
    // Check if user already reviewed this product
    const reviews = getProductReviews(productId);
    const userReview = reviews.find(r => r.username === user.username);
    
    if (userReview) {
      // User already reviewed, show their review in form
      document.getElementById("user-rating").value = userReview.rating;
      document.getElementById("review-comment").value = userReview.comment || "";
      updateRatingStars(userReview.rating);
      
      // Change button text
      document.querySelector("#review-form button").innerHTML = '<i class="fas fa-edit me-2"></i>Cập nhật đánh giá';
    }
  } else {
    // Show login prompt for non-logged users
    document.getElementById("review-form-section").style.display = "none";
    document.getElementById("login-prompt").style.display = "block";
  }
  
  // Initialize rating stars interaction
  initializeRatingStars();
  
  // Initialize review form submission
  initializeReviewForm(productId);
}

// Initialize rating stars interaction
function initializeRatingStars() {
  const stars = document.querySelectorAll('.rating-star');
  
  stars.forEach((star, index) => {
    star.addEventListener('mouseover', () => {
      highlightStars(index + 1);
    });
    
    star.addEventListener('click', () => {
      const rating = index + 1;
      document.getElementById("user-rating").value = rating;
      updateRatingStars(rating);
    });
  });
  
  // Reset on mouse leave
  document.querySelector('.rating-input').addEventListener('mouseleave', () => {
    const currentRating = parseInt(document.getElementById("user-rating").value) || 0;
    updateRatingStars(currentRating);
  });
}

// Highlight stars on hover
function highlightStars(rating) {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.className = 'fas fa-star rating-star active';
    } else {
      star.className = 'far fa-star rating-star';
    }
  });
}

// Update rating stars display
function updateRatingStars(rating) {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.className = 'fas fa-star rating-star active';
    } else {
      star.className = 'far fa-star rating-star';
    }
  });
}

// Initialize review form submission
function initializeReviewForm(productId) {
  const form = document.getElementById("review-form");
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    
    const rating = parseInt(document.getElementById("user-rating").value);
    const comment = document.getElementById("review-comment").value.trim();
    
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }
    
    // Save review
    saveProductReview(productId, {
      username: user.username,
      name: user.name,
      rating: rating,
      comment: comment,
      date: new Date().toISOString()
    });
    
    // Reload reviews
    loadProductReviews(productId);
    
    // Show success message
    showSuccessMessage("Cảm ơn bạn đã đánh giá sản phẩm!");
    
    // Update button text
    document.querySelector("#review-form button").innerHTML = '<i class="fas fa-edit me-2"></i>Cập nhật đánh giá';
  });
}

// Get product reviews from localStorage
function getProductReviews(productId) {
  const allReviews = JSON.parse(localStorage.getItem("productReviews")) || {};
  return allReviews[productId] || [];
}

// Save product review
function saveProductReview(productId, review) {
  let allReviews = JSON.parse(localStorage.getItem("productReviews")) || {};
  
  if (!allReviews[productId]) {
    allReviews[productId] = [];
  }
  
  // Check if user already reviewed
  const existingIndex = allReviews[productId].findIndex(r => r.username === review.username);
  
  if (existingIndex !== -1) {
    // Update existing review
    allReviews[productId][existingIndex] = review;
  } else {
    // Add new review
    allReviews[productId].push(review);
  }
  
  localStorage.setItem("productReviews", JSON.stringify(allReviews));
}

// Load and display product reviews
function loadProductReviews(productId) {
  const reviews = getProductReviews(productId);
  
  // Update summary
  updateReviewSummary(reviews);
  
  // Update reviews list
  displayReviewsList(reviews);
}

// Update review summary
function updateReviewSummary(reviews) {
  const avgRating = calculateAverageRating(reviews);
  const totalReviews = reviews.length;
  
  // Update average rating
  document.getElementById("average-rating").textContent = avgRating.toFixed(1);
  document.getElementById("total-reviews").textContent = totalReviews;
  
  // Update stars
  updateStarsDisplay(document.getElementById("average-stars"), avgRating);
  
  // Update rating breakdown
  updateRatingBreakdown(reviews);
}

// Calculate average rating
function calculateAverageRating(reviews) {
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
}

// Update stars display
function updateStarsDisplay(container, rating) {
  const stars = container.querySelectorAll('i');
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  stars.forEach((star, index) => {
    if (index < fullStars) {
      star.className = 'fas fa-star text-warning';
    } else if (index === fullStars && hasHalfStar) {
      star.className = 'fas fa-star-half-alt text-warning';
    } else {
      star.className = 'far fa-star text-warning';
    }
  });
}

// Update rating breakdown
function updateRatingBreakdown(reviews) {
  const breakdown = [0, 0, 0, 0, 0]; // 1-5 stars
  
  reviews.forEach(review => {
    breakdown[review.rating - 1]++;
  });
  
  const total = reviews.length;
  let html = '';
  
  for (let i = 4; i >= 0; i--) {
    const stars = i + 1;
    const count = breakdown[i];
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    html += `
      <div class="d-flex align-items-center mb-2">
        <span class="me-2" style="min-width: 60px;">${stars} sao</span>
        <div class="rating-bar flex-grow-1 me-2">
          <div class="rating-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="text-muted" style="min-width: 40px;">${count}</span>
      </div>
    `;
  }
  
  document.getElementById("rating-breakdown").innerHTML = html;
}

// Display reviews list
function displayReviewsList(reviews) {
  const container = document.getElementById("reviews-list");
  
  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-comments fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">Chưa có đánh giá nào</h5>
        <p class="text-muted">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
      </div>
    `;
    return;
  }
  
  // Sort reviews by date (newest first)
  const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let html = '<h5 class="mb-3">Đánh giá từ khách hàng</h5>';
  
  sortedReviews.forEach(review => {
    const reviewDate = new Date(review.date).toLocaleDateString('vi-VN');
    const userInitial = review.name.charAt(0).toUpperCase();
    
    html += `
      <div class="review-item">
        <div class="d-flex">
          <div class="user-avatar me-3">
            ${userInitial}
          </div>
          <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-1">${review.name}</h6>
                <div class="review-stars mb-1">
                  ${generateStarsHTML(review.rating)}
                </div>
              </div>
              <span class="review-date">${reviewDate}</span>
            </div>
            ${review.comment ? `<p class="mb-0">${review.comment}</p>` : '<p class="mb-0 text-muted fst-italic">Không có bình luận</p>'}
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Generate stars HTML
function generateStarsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      html += '<i class="fas fa-star"></i>';
    } else {
      html += '<i class="far fa-star"></i>';
    }
  }
  return html;
}