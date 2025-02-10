// Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the letters from magazine and false otherwise.

// Each letter in magazine can only be used once in ransomNote.

 

// Example 1:

// Input: ransomNote = "a", magazine = "b"
// Output: false
// Example 2:

// Input: ransomNote = "aa", magazine = "ab"
// Output: false
// Example 3:

// Input: ransomNote = "aa", magazine = "aab"
// Output: true

use std::collections::HashMap;

fn can_construct(ransom_note: String, magazine: String) -> bool {
    // HashMap để đếm 
    let mut char_count = HashMap::new();
    
    // Đếm
    for c in magazine.chars() {
        *char_count.entry(c).or_insert(0) += 1;
    }
    
    // Kiểm tra
    for c in ransom_note.chars() {
        match char_count.get_mut(&c) {
            Some(count) if *count > 0 => *count -= 1,
            _ => return false,
        }
    }
    
    true
}

fn main() {
    // Test cases
    let test_cases = vec![
        ("a", "b"),
        ("aa", "ab"),
        ("aa", "aab"),
    ];
    
    println!("Kết quả kiểm tra:");
    for (i, (note, mag)) in test_cases.iter().enumerate() {
        println!("Test case {}: ", i + 1);
        println!("Ransom Note: {}", note);
        println!("Magazine: {}", mag);
        println!("Output: {}", can_construct(note.to_string(), mag.to_string()));
        println!("------------------------");
    }
}
