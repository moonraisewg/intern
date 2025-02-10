# Hướng Dẫn Sử Dụng HashMap trong Rust

## 1. Giới Thiệu
HashMap là một cấu trúc dữ liệu lưu trữ các cặp key-value, trong đó mỗi key là duy nhất. HashMap cung cấp thời gian truy cập trung bình O(1) cho các thao tác cơ bản.

## 2. Cách Sử Dụng Cơ Bản

### 2.1. Khởi Tạo HashMap
```rust
use std::collections::HashMap;

// Cách 1: HashMap rỗng
let mut map: HashMap<String, i32> = HashMap::new();

// Cách 2: HashMap với giá trị ban đầu
let mut scores = HashMap::from([
    ("Team A", 10),
    ("Team B", 20),
]);

2.2. Thêm và Cập Nhật Phần Tử
// Thêm phần tử mới
map.insert("key1", 100);

// Thêm nếu chưa tồn tại
map.entry("key2").or_insert(300);

// Tăng giá trị
*map.entry("key2").or_insert(0) += 1;

2.3. Truy Xuất Phần Tử

// Cách 1: Sử dụng get
if let Some(&value) = map.get("key1") {
    println!("Giá trị: {}", value);
}

// Cách 2: Sử dụng unwrap_or
let value = map.get("key1").unwrap_or(&0);

// Cách 3: Kiểm tra tồn tại
if map.contains_key("key1") {
    println!("Tìm thấy key");
}

3. Các Thao Tác Phổ Biến
3.1. Duyệt HashMap
// Duyệt cả key và value
for (key, value) in &map {
    println!("{}: {}", key, value);
}

// Chỉ duyệt key
for key in map.keys() {
    println!("{}", key);
}

// Chỉ duyệt value
for value in map.values() {
    println!("{}", value);
}

3.2. Xóa Phần Tử// Xóa một phần tử
map.remove("key1");

// Xóa tất cả
map.clear();


4. Ví Dụ Thực Tế
4.1. Đếm Tần Suất Ký Tự

fn count_chars(text: &str) -> HashMap<char, i32> {
    let mut char_count = HashMap::new();
    for c in text.chars() {
        *char_count.entry(c).or_insert(0) += 1;
    }
    char_count
}

5. Best Practices
  1. Sử dụng Entry API cho hiệu suất tốt hơn
  2. Xử lý giá trị không tồn tại một cách an toàn
  3. Sử dụng references khi có thể để tránh clone không cần thiết


6. Lưu Ý Quan Trọng
   HashMap không đảm bảo thứ tự các phần tử
   Key phải implement trait Hash và Eq
   Độ phức tạp trung bình O(1) cho các thao tác cơ bản
   Nên sử dụng entry API để tối ưu hiệu suất
   HashMap tự động mở rộng khi cần thiết
7. Debugging và Troubleshooting
   1.In HashMap để debug:
   println!("HashMap: {:?}", map);

   2. Kiểm tra kích thước:

   println!("Số phần tử: {}", map.len());
   println!("Có rỗng không: {}", map.is_empty());

8. Tài Liệu Tham Khảo   
   https://doc.rust-lang.org/std/collections/struct.HashMap.html
    https://doc.rust-lang.org/book/ch08-03-hash-maps.html

