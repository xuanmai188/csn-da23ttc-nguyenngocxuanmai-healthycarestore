// Function to get products from admin or use default
function getProducts() {
  const adminProducts = JSON.parse(localStorage.getItem("adminProducts"));
  
  // If data was reset, return empty array (no sample products)
  if (localStorage.getItem('preventSampleData') === 'true') {
    return [];
  }
  
  if (adminProducts && adminProducts.length > 0) {
    // Filter products that are in stock and active (hide out of stock products)
    return adminProducts.filter(p => p.stock > 0 && (p.status === 'active' || !p.status)).map(addUsageData);
  }
  return defaultProducts.filter(p => p.stock > 0).map(addUsageData);
}

// Function to add usage data to products
function addUsageData(product) {
  // Add usage tags based on category and product name
  let usages = [];
  
  // Based on category
  switch(product.category) {
    case "Nutritious cereals":
      usages.push("nutrition", "health", "organic");
      break;
    case "Pulses":
      usages.push("nutrition", "cooking", "health");
      break;
    case "Spices and Condiments":
      usages.push("cooking");
      break;
    case "Cooking oils":
      usages.push("health", "beauty", "organic");
      break;
    case "Rice":
      usages.push("nutrition", "cooking");
      break;
    case "Flours & Meals":
      usages.push("nutrition", "cooking", "organic");
      break;
    case "Fresh Vegetables":
      usages.push("nutrition", "cooking", "health", "organic");
      break;
  }
  
  // Based on product name keywords
  const title = product.title.toLowerCase();
  if (title.includes('hữu cơ') || title.includes('organic')) {
    usages.push("organic");
  }
  if (title.includes('vitamin') || title.includes('bổ dưỡng')) {
    usages.push("nutrition", "health");
  }
  if (title.includes('tinh dầu') || title.includes('cocoon')) {
    usages.push("beauty");
  }
  
  // Remove duplicates
  usages = [...new Set(usages)];
  
  return {
    ...product,
    usages: usages
  };
}

// Function to refresh products (gọi khi cần cập nhật)
function refreshProducts() {
  if (typeof window !== 'undefined') {
    window.products = getProducts();
  }
  return getProducts();
}

var defaultProducts = [
  {
    id: 1,
    title: "Ngũ cốc ăn sáng hữu cơ giàu chất xơ Cascadian Farm, không biến đổi gen, 14,6 oz.",
    description: "<ul><li>Được thành lập tại Skagit Valley, WA</li><li>30 g ngũ cốc nguyên hạt mỗi khẩu phần</li><li>Ít nhất 48 g được khuyến nghị hàng ngày</li><li>10 g chất xơ mỗi khẩu phần</li><li>3,5 g tổng chất béo mỗi khẩu phần</li><li>Được chứng nhận bởi Dự án Không biến đổi gen</li><li>Hữu cơ USDA</li><li>Kosher</li><li>Được chứng nhận hữu cơ bởi Oregon Tilth</li></ul><p>Những miếng lúa mì nguyên hạt hữu cơ, cụm granola và những sợi cám giòn tan - một cách tuyệt vời để bắt đầu ngày mới!<br></p>",
    price: 215000,
    discountPercentage: 397000,
    review: 30,
    stock: 95,
    brand: "Cascadian Farm",
    category: "Nutritious cereals",
    thumbnail: "./data/products/1/thumbnail.jpeg",
    images: [
      "./data/products/1/1.jpeg",
      "./data/products/1/2.jpeg",
      "./data/products/1/3.jpeg",
      "./data/products/1/thumbnail.jpeg",
    ],
  },
  {
    id: 2,
    title: "Đậu lăng Great Value, 450g",
    description: "<b>Đậu lăng Great Value, 450g:</b> <ul> <li>Đậu lăng khô</li> <li>110 calo mỗi khẩu phần</li> <li>Không chứa natri, cholesterol, chất béo bão hòa hoặc chất béo chuyển hóa</li> <li>4g chất xơ mỗi khẩu phần</li> <li>Khoảng 13 khẩu phần mỗi hộp</li> </ul>",
    price: 35000,
    review: 44,
    stock: 34,
    brand: "Great Value",
    category: "Pulses",
    thumbnail: "./data/products/2/thumbnail.webp",
    images: [
      "./data/products/2/1.jpeg",
      "./data/products/2/2.jpeg",
      "./data/products/2/3.webp",
      "./data/products/2/thumbnail.webp",
    ],
  },
  {
    id: 3,
    title: "Bột nghệ 115g",
    description: '<table class="table"><tbody><tr><th>Trọng lượng</th><td>100 g</td></tr></tbody></table>',
    price: 20000,
    discountPercentage: 25000,
    review: 9,
    stock: 36,
    brand: "",
    category: "Spices and Condiments",
    thumbnail: "./data/products/3/thumbnail.jpg",
    images: [
      "./data/products/3/1.jpeg",
      "./data/products/3/2.jpeg",
      "./data/products/3/3.jpeg",
      "./data/products/3/thumbnail.jpg",
    ],
  },
  {
    id: 4,
    title: "Bột ớt đỏ 115g",
    description: '<table class="table"><tbody><tr><th>Trọng lượng</th><td>100 g</td></tr></tbody></table>',
    price: 46000,
    discountPercentage: 52000,
    review: 9,
    stock: 28,
    brand: "",
    category: "Spices and Condiments",
    thumbnail: "./data/products/4/thumbnail.webp",
    images: [
      "./data/products/4/1.webp",
      "./data/products/4/2.jpeg",
      "./data/products/4/3.jpeg",
      "./data/products/4/4.webp",
    ],
  },
  {
    id: 5,
    title: "Vitamin tổng hợp Nature's Way Complete Daily Multivitamin của Úc, 200 viên",
    description: '<p>Natures Way Complete Daily Multivitamin được nghiên cứu và sản xuất trên dây chuyền công nghệ tiên tiến, hiện đại của hãng Natures Way, một thương hiệu chăm sóc sức khỏe nổi tiếng của Úc. Sản phẩm bổ sung nhiều loại vitamin và khoáng chất, hỗ trợ duy trì năng lượng, tăng cường trao đổi chất và cải thiện hệ miễn dịch cho cơ thể.</p><ul><li>Thiamine Nitrate 700 mcg, tương đương với Thiamine (Vitamin B1) 567.4 mcg</li><li>Riboflavin (Vitamin B2): 1.3 mg</li><li>Biotin: 30 mcg</li><li>Không chứa gluten</li><li>Không có hương vị nhân tạo hay chất bảo quản</li><li>Hũ 14 oz</li></ul>',
    price: 340000,
    discountPercentage: 580000,
    review: 9,
    stock: 15,
    brand: "",
    category: "Cooking oils",
    thumbnail: "./data/products/5/thumbnail.webp",
    images: [
      "./data/products/5/1.webp",
      "./data/products/5/2.webp",
      "./data/products/5/3.webp",
    ],
  },
  {
    id: 6,
    title: "Bột mì KAMUT Khorasan hữu cơ, 1 Pound — Không biến đổi gen, Kosher, Nguyên chất, Thuần chay",
    description: '<p>Bột mì hữu cơ KAMUT của Food To Live được làm từ hạt KAMUT chất lượng cao. Loại lúa mì này có nguồn gốc từ thời cổ đại, và người ta nói rằng các pharaoh của Ai Cập cổ đại đã từng thưởng thức bánh mì làm từ loại lúa mì này. Lúa mì KAMUT hữu cơ ngày càng trở nên phổ biến hơn hiện nay. <br> <br> Lợi ích của bột mì hữu cơ KAMUT đến từ các chất dinh dưỡng mà nó chứa. Về mặt kỹ thuật, KAMUT là một loại lúa mì. Tuy nhiên, KAMUT hữu cơ bổ dưỡng hơn nhiều. Nó cũng có hàm lượng chất xơ cao hơn và một số chất dinh dưỡng quý giá: Kẽm, Sắt, Mangan, Magiê, vitamin nhóm B, Vitamin E. <br> <br> Bạn có thể thưởng thức sản phẩm này giống như bất kỳ loại bột mì nào khác. Bột Kamut hữu cơ là sự thay thế hoàn hảo cho lúa mì vì nó có các đặc tính tương tự.</p><ul> <li>✔️GIÀU PROTEIN VÀ CHẤT XƠ: Bột Kamut hữu cơ có lượng protein nhiều hơn 30% so với lúa mì và rất nhiều chất xơ.</li> <li>✔️NGON VÀ CÓ VỊ HẠNH NHÂN: Bột kamut hữu cơ xay có vị rất ngon và sẽ làm tăng hương vị cho bất kỳ món nướng nào.</li> <li>✔️TĂNG CƯỜNG DINH DƯỠNG: Bột Kamut hữu cơ Food To Live rất giàu vitamin B, mangan và sắt.</li> <li>✔️LÀM SẠCH LÚA MÌ TUYỆT VỜI: Sử dụng bột kamut hữu cơ như một lựa chọn thay thế bổ dưỡng hơn cho lúa mì.</li> <li>✔️SẢN PHẨM HỮU CƠ CỦA MỸ: Bột Kamut hữu cơ từ Food to Live là 100% không biến đổi gen và không chứa độc tố.</li> </ul>',
    price: 413000,
    discountPercentage: 420000,
    review: 9,
    stock: 22,
    brand: "",
    category: "Flours & Meals",
    thumbnail: "./data/products/6/thumbnail.jpeg",
    images: [
      "./data/products/6/1.jpeg",
      "./data/products/6/2.jpeg",
      "./data/products/6/3.jpeg",
      "./data/products/6/4.jpeg",
    ],
  },
  {
    id: 7,
    title: "Gạo hạt dài Great Value, 5 lbs (khoảng 2,3 kg)",
    description: '<p>Hãy chế biến một bữa ăn ngon miệng và bổ dưỡng mà bạn sẽ yêu thích với Gạo hạt dài tăng cường dinh dưỡng Great Value. Gạo tăng cường dinh dưỡng được chế biến với nhiều vitamin và chất dinh dưỡng hơn gạo truyền thống, và gạo hạt dài có chỉ số đường huyết thấp hơn gạo hạt ngắn. Thêm một chút nghệ tây để có món ăn kèm thơm ngon, đậm đà hoặc thêm đậu phụ, thịt lợn, thịt gà hoặc bít tết để có một bữa ăn giàu protein. Mỗi túi 5 pound chứa khoảng 50 khẩu phần, vì vậy bạn sẽ có đủ để chế biến tất cả các công thức nấu ăn yêu thích của mình. Hãy làm theo hướng dẫn dễ đọc ở mặt sau của bao bì để chế biến món Gạo hạt dài tăng cường dinh dưỡng Great Value thơm ngon của chúng tôi.</p><p>Các sản phẩm Great Value cung cấp cho các gia đình những lựa chọn thực phẩm và đồ dùng gia đình chất lượng cao với giá cả phải chăng. Với nhiều loại sản phẩm trải rộng từ thực phẩm đến đồ dùng gia đình, chúng tôi cung cấp cho bạn nhiều sản phẩm đáp ứng nhu cầu của gia đình bạn.</p> Sản phẩm của chúng tôi có sẵn trực tuyến và tại các cửa hàng Walmart trên toàn quốc, giúp bạn dễ dàng mua sắm và tiết kiệm tiền cùng một lúc.</p><ul> <li>Ít chất béo bão hòa, cholesterol và natri</li> <li>Tốt cho tim mạch và không chứa gluten</li> <li>Được chứng nhận Kosher</li> <li>Không có hương vị hoặc màu nhân tạo</li> <li>Giàu vitamin B1, sắt photphat, axit folic và niacin</li> <li>Có thể nấu bằng nồi cơm điện hoặc trên bếp</li></li> </ul>',
    price: 72000,
    discountPercentage: 77000,
    review: 9,
    stock: 45,
    brand: "",
    category: "Rice",
    thumbnail: "./data/products/7/thumbnail.webp",
    images: [
      "./data/products/7/1.webp",
      "./data/products/7/2.webp",
      "./data/products/7/thumbnail.webp",
    ],
  },
  {
    id: 8,
    title: "Củ hành tây đỏ tươi to",
    description: '',
    price: 26000,
    review: 9,
    stock: 67,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/8/thumbnail.jpg",
    images: [],
  },
  {
    id: 9,
    title: "Dưa chuột tươi",
    description: '',
    price: 26000,
    review: 9,
    stock: 43,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/9/thumbnail.jpg",
    images: [],
  },
  {
    id: 10,
    title: "Tinh dầu bưởi Cocoon",
    description: '<p> Serum dưỡng tóc Cocoon 140ml - Giải pháp cho mái tóc chắc khỏe và mềm mượt!</p>',
    price: 123000,
    review: 9,
    stock: 18,
    brand: "",
    category: "Cooking oils",
    thumbnail: "./data/products/10/thumbnail.webp",
    images: [
      "./data/products/10/1.webp",
      "./data/products/10/2.webp",
      "./data/products/10/3.webp",
      "./data/products/10/thumbnail.webp",
    ],
  },
  {
    id: 11,
    title: "Thân chuối tươi",
    description: '',
    price: 27000,
    review: 9,
    stock: 32,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/11/thumbnail.jpg",
    images: [],
  },
  {
    id: 12,
    title: "Hành tây đỏ nhỏ tươi",
    description: '',
    price: 20000,
    review: 9,
    stock: 55,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/12/thumbnail.jpg",
    images: [],
  },
  {
    id: 13,
    title: "Mướp đắng tươi",
    description: '',
    price: 17000,
    review: 9,
    stock: 41,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/13/thumbnail.jpg",
    images: [],
  },
  {
    id: 14,
    title: "Đậu bắp tươi",
    description: '',
    price: 11000,
    review: 9,
    stock: 29,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/14/thumbnail.jpg",
    images: [],
  },
  {
    id: 15,
    title: "Khoai tây tươi",
    description: '',
    price: 35000,
    review: 9,
    stock: 38,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/15/thumbnail.jpg",
    images: [],
  },
  {
    id: 16,
    title: "Tỏi sống",
    description: '',
    price: 15000,
    review: 9,
    stock: 62,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/16/thumbnail.jpg",
    images: [],
  },
  {
    id: 17,
    title: "Củ tỏi",
    description: '',
    price: 12000,
    review: 9,
    stock: 48,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/17/thumbnail.jpg",
    images: [],
  },
  {
    id: 18,
    title: "Bông cải xanh",
    description: '',
    price: 37000,
    review: 9,
    stock: 25,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/18/thumbnail.jpg",
    images: [],
  },
  {
    id: 19,
    title: "Mít xanh",
    description: '',
    price: 40000,
    review: 9,
    stock: 33,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/19/thumbnail.jpg",
    images: [],
  },
  {
    id: 20,
    title: "Gừng tươi",
    description: '',
    price: 26000,
    review: 9,
    stock: 44,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/20/thumbnail.jpg",
    images: [],
  },
  {
    id: 21,
    title: "Cần tây",
    description: '',
    price: 24000,
    review: 9,
    stock: 37,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/21/thumbnail.jpg",
    images: [],
  },
  {
    id: 22,
    title: "Cà chua tươi",
    description: '',
    price: 18000,
    review: 9,
    stock: 51,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/22/thumbnail.jpg",
    images: [],
  },
  {
    id: 23,
    title: "Khoai mỡ",
    description: '',
    price: 22000,
    review: 9,
    stock: 39,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/23/thumbnail.jpg",
    images: [],
  },
  {
    id: 24,
    title: "Ớt Kashmiri",
    description: '',
    price: 45000,
    review: 9,
    stock: 16,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/24/thumbnail.jpg",
    images: [],
  },
  {
    id: 25,
    title: "Đậu Hà Lan xanh IQF",
    description: '',
    price: 66000,
    review: 9,
    stock: 21,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/25/thumbnail.jpg",
    images: [],
  },
  {
    id: 26,
    title: "Atiso tươi",
    description: '',
    price: 77000,
    review: 9,
    stock: 14,
    brand: "",
    category: "Fresh Vegetables",
    thumbnail: "./data/products/26/thumbnail.jpg",
    images: [],
  },
];

// Use the dynamic products function
var products = getProducts();

// Refresh products when page loads
document.addEventListener('DOMContentLoaded', function() {
  products = refreshProducts();
});