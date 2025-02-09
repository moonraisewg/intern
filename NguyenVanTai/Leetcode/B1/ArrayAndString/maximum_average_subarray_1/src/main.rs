// You are given an integer array nums consisting of n elements, and an integer k.

// Find a contiguous subarray whose length is equal to k that has the maximum average value and return this value. Any answer with a calculation error less than 10-5 will be accepted.

 

// Example 1:

// Input: nums = [1,12,-5,-6,50,3], k = 4
// Output: 12.75000
// Explanation: Maximum average is (12 - 5 - 6 + 50) / 4 = 51 / 4 = 12.75
// Example 2:

// Input: nums = [5], k = 1
// Output: 5.00000
 

// Constraints:

// n == nums.length
// 1 <= k <= n <= 105
// -104 <= nums[i] <= 104

fn find_max_average(nums: Vec<i32>, k: i32) -> f64 {
    let mut sum: i32 = nums[0..k as usize].iter().sum();
    let mut max_sum = sum;

    
    for i in k as usize..nums.len() { 
        sum = sum + nums[i] - nums[i - k as usize];
        max_sum = max_sum.max(sum);
    }

   
    max_sum as f64 / k as f64
}
fn main() {
    // Test cases
    let nums1 = vec![1, 12, -5, -6, 50, 3];
    let k1 = 4;
    println!("Test case 1: {}", find_max_average(nums1, k1)); 

    let nums2 = vec![5];
    let k2 = 1;
    println!("Test case 2: {}", find_max_average(nums2, k2)); 
}