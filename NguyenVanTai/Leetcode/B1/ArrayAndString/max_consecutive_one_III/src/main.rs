// Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.

 

// Example 1:

// Input: nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2
// Output: 6
// Explanation: [1,1,1,0,0,1,1,1,1,1,1]
// Bolded numbers were flipped from 0 to 1. The longest subarray is underlined.
// Example 2:

// Input: nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3
// Output: 10
// Explanation: [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1]
// Bolded numbers were flipped from 0 to 1. The longest subarray is underlined.
 

// Constraints:

// 1 <= nums.length <= 105
// nums[i] is either 0 or 1.
// 0 <= k <= nums.length


fn longest_ones(nums: Vec<i32>, k: i32) -> i32 {
    let mut left = 0; 
    let mut zeros = 0; 
    let mut max_length = 0; 

    // Duyệt qua mảng bên phải
    for right in 0..nums.len() {
        // Nếu phần tử hiện tại là 0, tăng biến đếm zeros
        if nums[right] == 0 {
            zeros += 1;
        }

        // Nếu số lượng số 0 vượt quá k, thu hẹp cửa sổ từ bên trái
        while zeros > k {
            if nums[left] == 0 {
                zeros -= 1;
            }
            left += 1;
        }

        max_length = max_length.max((right - left + 1) as i32);
    }

    max_length
}

fn main() {
    // Test cases
    let nums1 = vec![1,1,1,0,0,0,1,1,1,1,0];
    let k1 = 2;
    println!("Test case 1: {}", longest_ones(nums1, k1)); // Expected: 6

    let nums2 = vec![0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1];
    let k2 = 3;
    println!("Test case 2: {}", longest_ones(nums2, k2)); // Expected: 10
}