// Given a string text, you want to use the characters of text to form as many instances of the word "balloon" as possible.

// You can use each character in text at most once. Return the maximum number of instances that can be formed.

 

// Example 1:



// Input: text = "nlaebolko"
// Output: 1
// Example 2:



// Input: text = "loonbalxballpoon"
// Output: 2
// Example 3:

// Input: text = "leetcode"
// Output: 0
 

// Constraints:

// 1 <= text.length <= 104
// text consists of lower case English letters only.


use std::collections::HashMap;

fn max_number_of_balloons(text: String) -> i32 {
    // Tạo HashMap để đếm số lần xuất hiện
    let mut char_count = HashMap::new();
    
    // Đếm số lần 
    for c in text.chars() {
        *char_count.entry(c).or_insert(0) += 1;
    }
    
    // Tạo Hashmap lưu số lần xuất hiện kí tự
    let balloon_chars = HashMap::from([
        ('b', 1),
        ('a', 1),
        ('l', 2), 
        ('o', 2), 
        ('n', 1),
    ]);
    
    // Tính số lượng "balloon" có thể tạo đc
    let mut min_instances = i32::MAX;
    
    
    for (&c, &required_count) in balloon_chars.iter() {
        let available_count = *char_count.get(&c).unwrap_or(&0);
        let instances = (available_count as i32) / required_count;
        min_instances = min_instances.min(instances);
    }
    
    // Trả về kết quả ()
    if min_instances == i32::MAX {
        0
    } else {
        min_instances
    }
}

fn main() {
    let test_cases = vec![
        String::from("nlaebolko"),
        String::from("loonbalxballpoon"),
        String::from("leetcode"),
    ];
    
    println!("Kết quả kiểm tra:");
    for (i, text) in test_cases.iter().enumerate() {
        println!("Test case {}: ", i + 1);
        println!("Input: {}", text);
        println!("Output: {}", max_number_of_balloons(text.clone()));
        println!("------------------------");
    }
}