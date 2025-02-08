//Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

// You may assume that each input would have exactly one solution, and you may not use the same element twice.

// You can return the answer in any order.

 

// Example 1:

// Input: nums = [2,7,11,15], target = 9
// Output: [0,1]
// Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
// Example 2:

// Input: nums = [3,2,4], target = 6
// Output: [1,2]
// Example 3:

// Input: nums = [3,3], target = 6
// Output: [0,1]
 

// Constraints:

// 2 <= nums.length <= 104
// -109 <= nums[i] <= 109
// -109 <= target <= 109
// Only one valid answer exists.

use std::collections::HashMap;

fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map = HashMap::new();
    
    for (i, &num) in nums.iter().enumerate() {
        let complement = target - num;
        
        if let Some(&index) = map.get(&complement) {
            return vec![index as i32, i as i32];
        }
        
        map.insert(num, i);
    }
    
    vec![] 
}

fn main() {
    fn Example1(){
        let nums = vec![2, 7, 11, 15];
        let target = 9;
        let result = two_sum(nums, target);
        println!("{:?}", result); // Output: [0, 1]

    }
    fn Example2(){
        let nums = vec![3, 2, 4];
        let target = 6;
        let result = two_sum(nums, target);
        println!("{:?}", result); // Output: [1, 2]
    }
    fn Example3(){
        let nums = vec![3, 3];
        let target = 6;
        let result = two_sum(nums, target);
        println!("{:?}", result); // Output: [0, 1]
    }
    Example1();
    Example2();
    Example3();
    
   
}