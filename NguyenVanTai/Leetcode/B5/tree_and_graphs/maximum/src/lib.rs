// Given the root of a binary tree, return its maximum depth.

// A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

 

// Example 1:


// Input: root = [3,9,20,null,null,15,7]
// Output: 3
// Example 2:

// Input: root = [1,null,2]
// Output: 2
 

// Constraints:

// The number of nodes in the tree is in the range [0, 104].
// -100 <= Node.val <= 100
use std::rc::Rc; // Rc là viết tắt của Reference Counted. Rc cho phép nhiều tham chiếu đến cùng một dữ liệu trong bộ nhớ heap.
use std::cell::RefCell; // RefCell cho phép thay đổi dữ liệu bên trong một Rc ngay cả khi Rc đó không phải là mutable.
use std::cmp::max; // Hàm max từ thư viện chuẩn, dùng để tìm giá trị lớn nhất giữa hai số.

// Định nghĩa cấu trúc của một nút trong cây nhị phân
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
    pub val: i32, // Giá trị của nút
    pub left: Option<Rc<RefCell<TreeNode>>>, // Con trái của nút, được bọc trong Option để có thể xử lý trường hợp không có con trái
    pub right: Option<Rc<RefCell<TreeNode>>>, // Con phải của nút, tương tự như con trái
}

impl TreeNode {
    // Hàm khởi tạo một nút mới
    #[inline]
    pub fn new(val: i32) -> Self {
        TreeNode {
            val,
            left: None, // Khởi tạo không có con trái
            right: None, // Khởi tạo không có con phải
        }
    }
}

// Hàm tìm độ sâu lớn nhất của cây
pub fn max_depth(root: Option<Rc<RefCell<TreeNode>>>) -> i32 {
    match root {
        None => 0, // Nếu cây rỗng (không có nút gốc), độ sâu là 0
        Some(node) => {
            // Nếu có nút gốc, tiếp tục xử lý
            let left_depth = max_depth(node.borrow().left.clone()); // Tính độ sâu của cây con trái
            let right_depth = max_depth(node.borrow().right.clone()); // Tính độ sâu của cây con phải
            // Độ sâu lớn nhất là lớn hơn giữa hai độ sâu con cộng thêm 1 cho nút hiện tại
            1 + max(left_depth, right_depth)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_max_depth_example1() {
        // Tạo cây nhị phân cho ví dụ 1
        let root = Some(Rc::new(RefCell::new(TreeNode {
            val: 3,
            left: Some(Rc::new(RefCell::new(TreeNode {
                val: 9,
                left: None,
                right: None,
            }))),
            right: Some(Rc::new(RefCell::new(TreeNode {
                val: 20,
                left: Some(Rc::new(RefCell::new(TreeNode {
                    val: 15,
                    left: None,
                    right: None,
                }))),
                right: Some(Rc::new(RefCell::new(TreeNode {
                    val: 7,
                    left: None,
                    right: None,
                }))),
            }))),
        })));
        assert_eq!(max_depth(root), 3); // Kiểm tra kết quả
    }

    #[test]
    fn test_max_depth_example2() {
        // Sửa lại cấu trúc cây cho đúng với ví dụ 2
        let root = Some(Rc::new(RefCell::new(TreeNode {
            val: 1,
            left: None,
            right: Some(Rc::new(RefCell::new(TreeNode {
                val: 2,
                left: None,
                right: None, // Sửa từ Some thành None để đúng với input [1,null,2]
            }))),
        })));
        assert_eq!(max_depth(root), 2); // Kiểm tra kết quả
    }
}