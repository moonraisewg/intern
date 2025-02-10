// Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.

 

// Example 1:

// Input: nums = [3,0,1]

// Output: 2

// Explanation:

// n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number in the range since it does not appear in nums.

// Example 2:

// Input: nums = [0,1]

// Output: 2

// Explanation:

// n = 2 since there are 2 numbers, so all numbers are in the range [0,2]. 2 is the missing number in the range since it does not appear in nums.

// Example 3:

// Input: nums = [9,6,4,2,3,5,7,0,1]

// Output: 8

// Explanation:

// n = 9 since there are 9 numbers, so all numbers are in the range [0,9]. 8 is the missing number in the range since it does not appear in nums.


fn missing_number(nums: Vec<i32>) -> i32 {
    let n = nums.len() as i32;
    let expected_sum = n * (n + 1) / 2;
    let actual_sum: i32 = nums.iter().sum();
    // Số còn thiếu chính là hiệu của tổng kỳ vọng và tổng thực tế
    expected_sum - actual_sum
}

fn main() {
    // Test cases
    let test1 = vec![3, 0, 1];
    let test2 = vec![0, 1];
    let test3 = vec![9, 6, 4, 2, 3, 5, 7, 0, 1];

    println!("Test 1: {}", missing_number(test1)); // Should print: 2
    println!("Test 2: {}", missing_number(test2)); // Should print: 2
    println!("Test 3: {}", missing_number(test3)); // Should print: 8
}