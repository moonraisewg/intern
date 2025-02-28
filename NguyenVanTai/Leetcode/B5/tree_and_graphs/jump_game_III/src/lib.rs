// Given an array of non-negative integers arr, you are initially positioned at start index of the array. When you are at index i, you can jump to i + arr[i] or i - arr[i], check if you can reach any index with value 0.

// Notice that you can not jump outside of the array at any time.

 

// Example 1:

// Input: arr = [4,2,3,0,3,1,2], start = 5
// Output: true
// Explanation: 
// All possible ways to reach at index 3 with value 0 are: 
// index 5 -> index 4 -> index 1 -> index 3 
// index 5 -> index 6 -> index 4 -> index 1 -> index 3 
// Example 2:

// Input: arr = [4,2,3,0,3,1,2], start = 0
// Output: true 
// Explanation: 
// One possible way to reach at index 3 with value 0 is: 
// index 0 -> index 4 -> index 1 -> index 3
// Example 3:

// Input: arr = [3,0,2,1,2], start = 2
// Output: false
// Explanation: There is no way to reach at index 1 with value 0.
 

// Constraints:

// 1 <= arr.length <= 5 * 104
// 0 <= arr[i] < arr.length
// 0 <= start < arr.length

use std::collections::VecDeque;

pub fn can_reach(arr: Vec<i32>, start: usize) -> bool {
    let n = arr.len();
    let mut visited = vec![false; n];
    let mut queue = VecDeque::new();
    
    // Thêm vị trí bắt đầu vào hàng đợi
    queue.push_back(start);
    visited[start] = true;
    
    // BFS
    while let Some(index) = queue.pop_front() {
        // Nếu giá trị tại chỉ số hiện tại là 0, trả về true
        if arr[index] == 0 {
            return true;
        }
        
        // Tính các chỉ số có thể nhảy tới
        let forward = index + arr[index] as usize;
        let backward = index as isize - arr[index] as isize;
        
        // Kiểm tra chỉ số nhảy tới có hợp lệ và chưa thăm
        if forward < n && !visited[forward] {
            visited[forward] = true;
            queue.push_back(forward);
        }
        
        if backward >= 0 && !visited[backward as usize] {
            visited[backward as usize] = true;
            queue.push_back(backward as usize);
        }
    }
    
    false // Không tìm thấy chỉ số nào có giá trị là 0
}

// Test cases
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        let arr = vec![4,2,3,0,3,1,2];
        let start = 5;
        assert_eq!(can_reach(arr, start), true);
    }

    #[test]
    fn test_example_2() {
        let arr = vec![4,2,3,0,3,1,2];
        let start = 0;
        assert_eq!(can_reach(arr, start), true);
    }

    #[test]
    fn test_example_3() {
        let arr = vec![3,0,2,1,2];
        let start = 2;
        assert_eq!(can_reach(arr, start), false);
    }
}