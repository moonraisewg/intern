// Given the root of a binary tree, return the zigzag level order traversal of its nodes' values. (i.e., from left to right, then right to left for the next level and alternate between).

 

// Example 1:


// Input: root = [3,9,20,null,null,15,7]
// Output: [[3],[20,9],[15,7]]
// Example 2:

// Input: root = [1]
// Output: [[1]]
// Example 3:

// Input: root = []
// Output: []

use std::cell::RefCell;
use std::rc::Rc;
use std::collections::VecDeque;

#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}

impl TreeNode {
    #[inline]
    pub fn new(val: i32) -> Self {
        TreeNode {
            val,
            left: None,
            right: None,
        }
    }
}

pub fn zigzag_level_order(root: Option<Rc<RefCell<TreeNode>>>) -> Vec<Vec<i32>> {
    // Khởi tạo vector để lưu kết quả cuối cùng
    // Mỗi phần tử trong vector là một tầng của cây
    let mut result: Vec<Vec<i32>> = Vec::new();
    
    // Kiểm tra trường hợp cây rỗng
    if root.is_none() {
        return result;
    }

    // Khởi tạo hàng đợi (queue) để thực hiện duyệt BFS
    // VecDeque cho phép thêm/xóa ở cả hai đầu với độ phức tạp O(1)
    let mut queue = VecDeque::new();
    // Thêm nút gốc vào hàng đợi
    queue.push_back(root.unwrap());
    
    // Biến này dùng để theo dõi hướng duyệt của mỗi tầng
    // true: duyệt từ trái sang phải
    // false: duyệt từ phải sang trái
    let mut left_to_right = true;
    
    // Tiếp tục duyệt khi hàng đợi còn phần tử
    while !queue.is_empty() {
        // Lấy số lượng nút ở tầng hiện tại
        // Quan trọng: cần lưu lại size vì queue sẽ thay đổi trong quá trình duyệt
        let level_size = queue.len();
        
        // Vector tạm để lưu các giá trị của tầng hiện tại
        // Khởi tạo với capacity đúng để tối ưu bộ nhớ
        let mut current_level = Vec::with_capacity(level_size);
        
        // Duyệt qua tất cả các nút ở tầng hiện tại
        for _ in 0..level_size {
            // Lấy và xử lý nút đầu tiên trong hàng đợi
            if let Some(node) = queue.pop_front() {
                // Mượn tham chiếu đến nút hiện tại
                let node_ref = node.borrow();
                // Thêm giá trị của nút vào tầng hiện tại
                current_level.push(node_ref.val);
                
                // Thêm các nút con vào hàng đợi (luôn theo thứ tự trái -> phải)
                // Điều này quan trọng để duy trì thứ tự đúng cho các tầng tiếp theo
                if let Some(left) = node_ref.left.clone() {
                    queue.push_back(left);
                }
                if let Some(right) = node_ref.right.clone() {
                    queue.push_back(right);
                }
            }
        }
        
        // Nếu đang ở hướng phải sang trái (left_to_right = false)
        // thì đảo ngược thứ tự các phần tử trong tầng hiện tại
        if !left_to_right {
            current_level.reverse();
        }
        
        // Thêm tầng hiện tại vào kết quả cuối cùng
        result.push(current_level);
        
        // Đổi hướng duyệt cho tầng tiếp theo
        left_to_right = !left_to_right;
    }
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_node(val: i32) -> Option<Rc<RefCell<TreeNode>>> {
        Some(Rc::new(RefCell::new(TreeNode::new(val))))
    }

    #[test]
    fn test_example_1() {
      
        let root = create_node(3);
        let node9 = create_node(9);
        let node20 = create_node(20);
        let node15 = create_node(15);
        let node7 = create_node(7);

        if let Some(root_ref) = &root {
            let mut root_node = root_ref.borrow_mut();
            root_node.left = node9;
            root_node.right = node20.clone();
        }

        if let Some(node20_ref) = &node20 {
            let mut node20_node = node20_ref.borrow_mut();
            node20_node.left = node15;
            node20_node.right = node7;
        }

        assert_eq!(
            zigzag_level_order(root),
            vec![vec![3], vec![20, 9], vec![15, 7]]
        );
    }

    #[test]
    fn test_example_2() {
        let root = create_node(1);
        assert_eq!(zigzag_level_order(root), vec![vec![1]]);
    }

    #[test]
    fn test_example_3() {
        assert_eq!(zigzag_level_order(None), Vec::<Vec<i32>>::new());
    }
}