// Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.

 

// Example 1:

// Input: nums = [-4,-1,0,3,10]
// Output: [0,1,9,16,100]
// Explanation: After squaring, the array becomes [16,1,0,9,100].
// After sorting, it becomes [0,1,9,16,100].
// Example 2:

// Input: nums = [-7,-3,2,3,11]
// Output: [4,9,9,49,121]
 

// Constraints:

// 1 <= nums.length <= 104
// -104 <= nums[i] <= 104
// nums is sorted in non-decreasing order.


fn sorted_squares(nums: Vec<i32>) -> Vec<i32> {
    let n = nums.len();
    let mut result = vec![0; n];
    let mut left = 0;
    let mut right = n - 1;
    let mut current = n - 1;

    while left <= right {
        let left_square = nums[left] * nums[left];
        let right_square = nums[right] * nums[right];

        if left_square > right_square {
            result[current] = left_square;
            left += 1;
        } else {
            result[current] = right_square;
            right -= 1;
        }
        
        if current > 0 {
            current -= 1;
        }
    }

    result
}

fn main() {
    // Test case 1
    let nums1 = vec![-4, -1, 0, 3, 10];
    println!("Input 1: {:?}", nums1);
    println!("Output 1: {:?}", sorted_squares(nums1));

    // Test case 2
    let nums2 = vec![-7, -3, 2, 3, 11];
    println!("Input 2: {:?}", nums2);
    println!("Output 2: {:?}", sorted_squares(nums2));
}