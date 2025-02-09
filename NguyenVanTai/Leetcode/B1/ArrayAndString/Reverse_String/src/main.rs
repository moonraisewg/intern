fn reverse_string(s: &mut Vec<char>) {
    let mut left = 0;
    let mut right = s.len() - 1;
    
    while left < right {
        s.swap(left, right);
        left += 1;
        right -= 1;
    }
}

fn main() {
    // Test case 1
    let mut s1 = vec!['h', 'e', 'l', 'l', 'o'];
    println!("Before: {:?}", s1);
    reverse_string(&mut s1);
    println!("After: {:?}", s1);

    // Test case 2
    let mut s2 = vec!['H', 'a', 'n', 'n', 'a', 'h'];
    println!("Before: {:?}", s2);
    reverse_string(&mut s2);
    println!("After: {:?}", s2);
}
// Hàm reverse_string nhận một tham số kiểu &mut Vec<char> (một vector ký tự có thể thay đổi).
// Sử dụng hai con trỏ:
// left: bắt đầu từ vị trí đầu mảng (index 0)
// right: bắt đầu từ vị trí cuối mảng (length - 1)
// Trong vòng lặp while:
// Hoán đổi ký tự ở vị trí left và right sử dụng phương thức swap
// Tăng left lên 1 và giảm right xuống 1
// Tiếp tục cho đến khi left >= right