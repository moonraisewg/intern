// Given a string s of lower and upper case English letters.

// A good string is a string which doesn't have two adjacent characters s[i] and s[i + 1] where:

// 0 <= i <= s.length - 2
// s[i] is a lower-case letter and s[i + 1] is the same letter but in upper-case or vice-versa.
// To make the string good, you can choose two adjacent characters that make the string bad and remove them. You can keep doing this until the string becomes good.

// Return the string after making it good. The answer is guaranteed to be unique under the given constraints.

// Notice that an empty string is also good.

 

// Example 1:

// Input: s = "leEeetcode"
// Output: "leetcode"
// Explanation: In the first step, either you choose i = 1 or i = 2, both will result "leEeetcode" to be reduced to "leetcode".
// Example 2:

// Input: s = "abBAcC"
// Output: ""
// Explanation: We have many possible scenarios, and all lead to the same answer. For example:
// "abBAcC" --> "aAcC" --> "cC" --> ""
// "abBAcC" --> "abBA" --> "aA" --> ""
// Example 3:

// Input: s = "s"
// Output: "s"


pub fn make_good_simple(s: String) -> String {
    let mut chars: Vec<char> = s.chars().collect(); // chuyển string nhập vào thành vectorcác ký tụ
    let mut i = 0;
    
    while i < chars.len().saturating_sub(1) {
        // Lấy ký tự hiện tại và ký tự kế tiếp
        let current = chars[i];
        let next = chars[i + 1];
        
        // Kiểm tra cặp ký tự xấu
        if is_bad_pair(current, next) {
            // Xóa cả hai ký tự
            chars.remove(i);
            chars.remove(i);
            // Quay lại vị trí trước (nếu có thể) để kiểm tra lại
            i = if i > 0 { i - 1 } else { 0 };
        } else {
            i += 1;
        }
    }
    
    chars.into_iter().collect()
}

// Hàm kiểm tra cặp ký tự xấu
fn is_bad_pair(a: char, b: char) -> bool {
    (a.is_lowercase() && b.is_uppercase() && a.to_ascii_uppercase() == b) ||
    (a.is_uppercase() && b.is_lowercase() && a.to_ascii_lowercase() == b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        // Test 1
        let input = "leEeetcode".to_string();
        let expected = "leetcode";
        let result = make_good_simple(input);
        assert_eq!(result, expected);
    }

    #[test]
    fn test_example_2() {
        // Test 2
        let input = "abBAcC".to_string();
        let expected = "";
        let result = make_good_simple(input);
        assert_eq!(result, expected);
    }

    #[test]
    fn test_example_3() {
        // Test 3
        let input = "s".to_string();
        let expected = "s";
        let result = make_good_simple(input);
        assert_eq!(result, expected);
    }
}