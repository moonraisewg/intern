// Given a binary array nums, return the maximum length of a contiguous subarray with an equal number of 0 and 1.

 

// Example 1:

// Input: nums = [0,1]
// Output: 2
// Explanation: [0, 1] is the longest contiguous subarray with an equal number of 0 and 1.
// Example 2:

// Input: nums = [0,1,0]
// Output: 2
// Explanation: [0, 1] (or [1, 0]) is a longest contiguous subarray with equal number of 0 and 1.
 

// Constraints:

// 1 <= nums.length <= 105
// nums[i] is either 0 or 1.

use std::collections::HashMap;

fn find_max_length(nums: Vec<i32>) -> i32 {
    let mut count = 0;
    let mut max_length = 0;
    let mut count_map: HashMap<i32, i32> = HashMap::new();
    
    count_map.insert(0, -1);
    
    for (i, &num) in nums.iter().enumerate() {
        count += if num == 1 { 1 } else { -1 };
        
        if let Some(&prev_index) = count_map.get(&count) {
            max_length = max_length.max(i as i32 - prev_index);
        } else {
            count_map.insert(count, i as i32);
        }
    }
    
    max_length
}

fn main() {
    // Test cases
    let test_cases = vec![
        vec![0, 1],
        vec![0, 1, 0],
        vec![0, 1, 0, 1],
    ];
    
    println!("Kết quả kiểm tra:");
    for (i, nums) in test_cases.iter().enumerate() {
        println!("Test case {}: ", i + 1);
        println!("Input: {:?}", nums);
        println!("Output: {}", find_max_length(nums.clone()));
        println!("------------------------");
    }
}