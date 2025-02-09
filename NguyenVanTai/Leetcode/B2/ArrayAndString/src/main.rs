
// Given an array of string words, return all strings in words that is a substring of another word. You can return the answer in any order.

// A substring is a contiguous sequence of characters within a string

 

// Example 1:

// Input: words = ["mass","as","hero","superhero"]
// Output: ["as","hero"]
// Explanation: "as" is substring of "mass" and "hero" is substring of "superhero".
// ["hero","as"] is also a valid answer.
// Example 2:

// Input: words = ["leetcode","et","code"]
// Output: ["et","code"]
// Explanation: "et", "code" are substring of "leetcode".
// Example 3:

// Input: words = ["blue","green","bu"]
// Output: []
// Explanation: No string of words is substring of another string.
 

// Constraints:

// 1 <= words.length <= 100
// 1 <= words[i].length <= 30
// words[i] contains only lowercase English letters.
// All the strings of words are unique.

fn string_matching(words: Vec<String>) -> Vec<String> {
    let mut result = Vec::new();
    
    for i in 0..words.len() {
        let current = &words[i];
        
        for j in 0..words.len() {
            if i != j {

                if words[j].contains(current) {
                    result.push(current.clone());
                    break;
                }
            }
        }
    }
    
    result
}

fn main() {
    // Test cases
    let test1 = vec![
        "mass".to_string(),
        "as".to_string(),
        "hero".to_string(),
        "superhero".to_string(),
    ];
    println!("Test 1 result: {:?}", string_matching(test1));

    let test2 = vec![
        "leetcode".to_string(),
        "et".to_string(),
        "code".to_string(),
    ];
    println!("Test 2 result: {:?}", string_matching(test2));

    let test3 = vec![
        "blue".to_string(),
        "green".to_string(),
        "bu".to_string(),
    ];
    println!("Test 3 result: {:?}", string_matching(test3));
}