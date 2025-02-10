// A pangram is a sentence where every letter of the English alphabet appears at least once.

// Given a string sentence containing only lowercase English letters, return true if sentence is a pangram, or false otherwise.

 

// Example 1:

// Input: sentence = "thequickbrownfoxjumpsoverthelazydog"
// Output: true
// Explanation: sentence contains at least one of every letter of the English alphabet.
// Example 2:

// Input: sentence = "leetcode"
// Output: false
 

// Constraints:

// 1 <= sentence.length <= 1000
// sentence consists of lowercase English letters.


fn is_pangram(sentence: String) -> bool {
    // Tạo một mang 26 cho 26 chu cai
    let mut letters = [false; 26];
    
    // Duyệt mang ki tu
    for c in sentence.chars() {
        // chuyen ky tu thanh index và set true
        letters[(c as u8 - b'a') as usize] = true;
    }
    
    // kt cac chu cai da xuat hien chua
    letters.iter().all(|&x| x)
}

fn main() {
    let test1 = String::from("thequickbrownfoxjumpsoverthelazydog");
    let test2 = String::from("leetcode");
    
    println!("Test 1: {}", is_pangram(test1)); // Should print: true
    println!("Test 2: {}", is_pangram(test2)); // Should print: false
}