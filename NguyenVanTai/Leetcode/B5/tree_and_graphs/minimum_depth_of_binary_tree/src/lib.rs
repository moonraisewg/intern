// Given a binary tree, find its minimum depth.

// The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.

// Note: A leaf is a node with no children.

 

// Example 1:


// Input: root = [3,9,20,null,null,15,7]
// Output: 2


// Example 2:
// Input: root = [2,null,3,null,4,null,5,null,6]
// Output: 5
 

// Constraints:

// The number of nodes in the tree is in the range [0, 105].
// -1000 <= Node.val <= 1000


use std::collections::VecDeque;

// Định nghĩa cấu trúc của một nút trong cây nhị phân
#[derive(Debug, PartialEq, Eq)]
pub struct TreeNode {
    pub val: i32,
    pub left: Option<Box<TreeNode>>,
    pub right: Option<Box<TreeNode>>,
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

// Hàm tìm độ sâu nhỏ nhất của cây nhị phân
pub fn min_depth(root: Option<Box<TreeNode>>) -> i32 {
    // Nếu cây rỗng, trả về 0
    if root.is_none() {
        return 0;
    }

    // Khởi tạo hàng đợi để lưu trữ các nút cùng với độ sâu hiện tại của chúng
    let mut queue = VecDeque::new();
    // Đưa nút gốc vào hàng đợi với độ sâu là 1
    queue.push_back((root, 1));

    // Duyệt cây bằng cách sử dụng hàng đợi
    while let Some((node, depth)) = queue.pop_front() {
        if let Some(node) = node {
            // Kiểm tra nếu nút đó là nút lá (không có con trái và con phải)
            if node.left.is_none() && node.right.is_none() {
                // Trả về độ sâu hiện tại
                return depth;
            }
            // Nếu có con trái, thêm con trái vào hàng đợi với độ sâu tăng thêm 1
            if node.left.is_some() {
                queue.push_back((node.left, depth + 1));
            }
            // Nếu có con phải, thêm con phải vào hàng đợi với độ sâu tăng thêm 1
            if node.right.is_some() {
                queue.push_back((node.right, depth + 1));
            }
        }
    }

    // Trả về 0 nếu không tìm thấy nút lá (trường hợp này không xảy ra vì cây không rỗng)
    0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_min_depth_example1() {
        // Example 1:
        // Input: root = [3,9,20,null,null,15,7]
        // Output: 2
        let root = Some(Box::new(TreeNode {
            val: 3,
            left: Some(Box::new(TreeNode {
                val: 9,
                left: None,
                right: None,
            })),
            right: Some(Box::new(TreeNode {
                val: 20,
                left: Some(Box::new(TreeNode {
                    val: 15,
                    left: None,
                    right: None,
                })),
                right: Some(Box::new(TreeNode {
                    val: 7,
                    left: None,
                    right: None,
                })),
            })),
        }));
        assert_eq!(min_depth(root), 2);
    }

    #[test]
    fn test_min_depth_example2() {
        // Example 2:
        // Input: root = [2,null,3,null,4,null,5,null,6]
        // Output: 5
        let root = Some(Box::new(TreeNode {
            val: 2,
            left: None,
            right: Some(Box::new(TreeNode {
                val: 3,
                left: None,
                right: Some(Box::new(TreeNode {
                    val: 4,
                    left: None,
                    right: Some(Box::new(TreeNode {
                        val: 5,
                        left: None,
                        right: Some(Box::new(TreeNode {
                            val: 6,
                            left: None,
                            right: None,
                        })),
                    })),
                })),
            })),
        }));
        assert_eq!(min_depth(root), 5);
    }

}