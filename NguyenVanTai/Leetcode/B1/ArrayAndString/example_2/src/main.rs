use std::collections::HashMap;

fn kth_distinct(arr: Vec<String>, k: i32) -> String {
    let mut count_map: HashMap<String, i32> = HashMap::new();
    
    for s in arr.iter() {
        *count_map.entry(s.clone()).or_insert(0) += 1;
    }
    
    let mut distinct_count = 0;
    
    for s in arr.iter() {
        if count_map.get(s) == Some(&1) {
            distinct_count += 1;
            if distinct_count == k {
                return s.clone();
            }
        }
    }
    
    String::from("")
}

fn main() {
    // Test case 1
    let arr1 = vec!["d".to_string(), "b".to_string(), "c".to_string(), 
                    "b".to_string(), "c".to_string(), "a".to_string()];
    println!("Test 1: {}", kth_distinct(arr1, 2)); 
    
    // Test case 2
    let arr2 = vec!["aaa".to_string(), "aa".to_string(), "a".to_string()];
    println!("Test 2: {}", kth_distinct(arr2, 1)); 
    
    // Test case 3
    let arr3 = vec!["a".to_string(), "b".to_string(), "a".to_string()];
    println!("Test 3: {}", kth_distinct(arr3, 3)); 
}