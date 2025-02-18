// Given the root of a binary tree, return the sum of values of its deepest leaves.
 

// Example 1:


// Input: root = [1,2,3,4,5,null,6,7,null,null,null,null,8]
// Output: 15
// Example 2:

// Input: root = [6,7,8,2,7,1,3,9,null,1,4,null,null,null,5]
// Output: 19
 

// Constraints:

// The number of nodes in the tree is in the range [1, 104].
// 1 <= Node.val <= 100


// Hint 1
// Traverse the tree to find the max depth.

// Hint 2
// Traverse the tree again to compute the sum required.

use std::cell::RefCell;
use std::rc::Rc;
// - val: giá trị của node
// - left: con trỏ đến node con bên trái
// - right: con trỏ đến node con bên phải
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
    pub val: i32,
    pub left: Option<Rc<RefCell<TreeNode>>>,
    pub right: Option<Rc<RefCell<TreeNode>>>,
}

// Triển khai phương thức khởi tạo cho TreeNode
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

// Hàm chính để tính tổng các node  lá ở độ sâu lớn nhất
pub fn deepest_leaves_sum(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
    // Kiểm tra trường hợp cơ sở: nếu cây rỗng thì trả về 0
    if root.is_none() {
        return 0;
    }

    // Hàm đệ quy để tìm độ sâu lớn nhất của cây
    fn find_max_depth(node: &Option<Rc<RefCell<TreeNode>>>) -> i32 {
        match node {
            // Trường hợp cơ sở: nếu node là None, độ sâu = 0
            None => 0,
            // Trường hợp đệ quy: 
            Some(n) => {
                let node = n.borrow();  // Mượn tham chiếu đến node hiện tại
                // Lấy độ sâu lớn nhất giữa cây con trái và phải
                // Cộng thêm 1 để tính cả node hiện tại
                1 + find_max_depth(&node.left).max(find_max_depth(&node.right))
            }
        }
    }

    // Hàm đệ quy để tính tổng các node lá ở độ sâu cụ thể
    fn sum_at_depth(
        node: &Option<Rc<RefCell<TreeNode>>>,  // Node hiện tại
        current_depth: i32,                     // Độ sâu hiện tại
        target_depth: i32                       // Độ sâu mục tiêu cần tính tổng
    ) -> i32 {
        match node {
            // Trường hợp cơ sở: nếu node là None, trả về 0
            None => 0,
            // Trường hợp đệ quy:
            Some(n) => {
                let node = n.borrow();  // Mượn tham chiếu đến node hiện tại
                
                // Nếu đã đến độ sâu mục tiêu, trả về giá trị của node hiện tại
                if current_depth == target_depth {
                    return node.val;
                }
                
                // Nếu chưa đến độ sâu mục tiêu, tiếp tục đệ quy xuống các node con
                // và cộng kết quả từ cả hai nhánh
                sum_at_depth(&node.left, current_depth + 1, target_depth)
                    + sum_at_depth(&node.right, current_depth + 1, target_depth)
            }
        }
    }

    // Bước 1: Tìm độ sâu lớn nhất của cây
    let max_depth = find_max_depth(&root);
    
    // Bước 2: Tính tổng các nút lá ở độ sâu lớn nhất
    // Bắt đầu từ độ sâu 1 (gốc) và tìm đến độ sâu lớn nhất
    sum_at_depth(&root, 1, max_depth)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_node(val: i32) -> Option<Rc<RefCell<TreeNode>>> {
        Some(Rc::new(RefCell::new(TreeNode::new(val))))
    }

    #[test]
    fn test_example_1() {
        
        let root = create_node(1);
        let node2 = create_node(2);
        let node3 = create_node(3);
        let node4 = create_node(4);
        let node5 = create_node(5);
        let node6 = create_node(6);
        let node7 = create_node(7);
        let node8 = create_node(8);

        // Kết nối các nút
        if let Some(root_ref) = &root {
            let mut root_node = root_ref.borrow_mut();
            root_node.left = node2.clone();
            root_node.right = node3.clone();
        }

        if let Some(node2_ref) = &node2 {
            let mut node2_node = node2_ref.borrow_mut();
            node2_node.left = node4.clone();
            node2_node.right = node5.clone();
        }

        if let Some(node3_ref) = &node3 {
            let mut node3_node = node3_ref.borrow_mut();
            node3_node.right = node6.clone();
        }

        if let Some(node4_ref) = &node4 {
            let mut node4_node = node4_ref.borrow_mut();
            node4_node.left = node7.clone();
        }

        if let Some(node6_ref) = &node6 {
            let mut node6_node = node6_ref.borrow_mut();
            node6_node.right = node8.clone();
        }

        assert_eq!(deepest_leaves_sum(root), 15); // 7 + 8 = 15
    }

    #[test]
    fn test_example_2() {
        
        let root = create_node(6);
        let node7_1 = create_node(7);
        let node8 = create_node(8);
        let node2 = create_node(2);
        let node7_2 = create_node(7);
        let node1_1 = create_node(1);
        let node9 = create_node(9);
        let node1_2 = create_node(1);
        let node5 = create_node(5);

        // Kết nối các nút
        if let Some(root_ref) = &root {
            let mut root_node = root_ref.borrow_mut();
            root_node.left = node7_1.clone();
            root_node.right = node8.clone();
        }

        if let Some(node7_1_ref) = &node7_1 {
            let mut node7_1_node = node7_1_ref.borrow_mut();
            node7_1_node.left = node2.clone();
            node7_1_node.right = node7_2.clone();
        }

        if let Some(node8_ref) = &node8 {
            let mut node8_node = node8_ref.borrow_mut();
            node8_node.right = node1_1.clone();
        }

        if let Some(node2_ref) = &node2 {
            let mut node2_node = node2_ref.borrow_mut();
            node2_node.left = node9.clone();
        }

        if let Some(node7_2_ref) = &node7_2 {
            let mut node7_2_node = node7_2_ref.borrow_mut();
            node7_2_node.left = node1_2.clone();
        }

        if let Some(node1_1_ref) = &node1_1 {
            let mut node1_1_node = node1_1_ref.borrow_mut();
            node1_1_node.right = node5.clone();
        }

        assert_eq!(deepest_leaves_sum(root), 19); // 9 + 1 + 5 = 19
    }
}