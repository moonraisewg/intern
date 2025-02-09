// Given an array nums. We define a running sum of an array as runningSum[i] = sum(nums[0]…nums[i]).

// Return the running sum of nums.

 

// Example 1:

// Input: nums = [1,2,3,4]
// Output: [1,3,6,10]
// Explanation: Running sum is obtained as follows: [1, 1+2, 1+2+3, 1+2+3+4].
// Example 2:

// Input: nums = [1,1,1,1,1]
// Output: [1,2,3,4,5]
// Explanation: Running sum is obtained as follows: [1, 1+1, 1+1+1, 1+1+1+1, 1+1+1+1+1].
// Example 3:

// Input: nums = [3,1,2,10,1]
// Output: [3,4,6,16,17]
 

// Constraints:

// 1 <= nums.length <= 1000
// -10^6 <= nums[i] <= 10^6

fn running_sum(nums: Vec<i32>) -> Vec<i32> {
    let mut result = vec![0; nums.len()]; // mảng kq
    let mut sum = 0; // lưu tổng
    
    // Duyệt mảng
    for i in 0..nums.len() {
        sum += nums[i]; // Cộng dồn
        result[i] = sum; // trả kq
    }
    
    result
}

fn main() {
    // Test cases
    let nums1 = vec![1,2,3,4];
    println!("Test case 1: {:?}", running_sum(nums1)); // Expected: [1,3,6,10]
    
    let nums2 = vec![1,1,1,1,1];
    println!("Test case 2: {:?}", running_sum(nums2)); // Expected: [1,2,3,4,5]
    
    let nums3 = vec![3,1,2,10,1];
    println!("Test case 3: {:?}", running_sum(nums3)); // Expected: [3,4,6,16,17]
}