// You are given the root node of a binary search tree (BST) and a value to insert into the tree. Return the root node of the BST after the insertion. It is guaranteed that the new value does not exist in the original BST.

// Notice that there may exist multiple valid ways for the insertion, as long as the tree remains a BST after insertion. You can return any of them.

 

// Example 1:


// Input: root = [4,2,7,1,3], val = 5
// Output: [4,2,7,1,3,5]
// Explanation: Another accepted tree is:

// Example 2:

// Input: root = [40,20,60,10,30,50,70], val = 25
// Output: [40,20,60,10,30,50,70,null,null,25]
// Example 3:

// Input: root = [4,2,7,1,3,null,null,null,null,null,null], val = 5
// Output: [4,2,7,1,3,5]
 

// Constraints:

// The number of nodes in the tree will be in the range [0, 104].
// -108 <= Node.val <= 108
// All the values Node.val are unique.
// -108 <= val <= 108
// It's guaranteed that val does not exist in the original BST.

use std::cell::RefCell;
use std::rc::Rc;

// Định nghĩa cấu trúc TreeNode cho cây nhị phân tìm kiếm (BST)
// - val: giá trị của nút
// - left: con trỏ đến nút con bên trái (giá trị nhỏ hơn)
// - right: con trỏ đến nút con bên phải (giá trị lớn hơn)
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

pub fn insert_into_bst(
    root: Option<Rc<RefCell<TreeNode>>>, // Nút gốc của cây
    val: i32                             // Giá trị cần chèn
) -> Option<Rc<RefCell<TreeNode>>> {
    // TRƯỜNG HỢP CƠ SỞ:
    // Nếu cây rỗng (root = None) hoặc đã tìm được vị trí cần chèn
    // thì tạo một nút mới với giá trị val và trả về
    if root.is_none() {
        return Some(Rc::new(RefCell::new(TreeNode::new(val))));
    }

    // Lấy tham chiếu đến nút gốc hiện tại
    // unwrap() an toàn vì đã kiểm tra None ở trên
    let root_ref = root.as_ref().unwrap();
    // Mượn giá trị của nút hiện tại để so sánh
    let root_val = root_ref.borrow().val;

    // LOGIC CHÈN:
    // So sánh giá trị cần chèn với giá trị nút hiện tại
    // để quyết định đi về nhánh trái hay phải
    if val < root_val {
        // Nếu val nhỏ hơn giá trị hiện tại:
        // 1. Lấy cây con trái ra khỏi nút hiện tại (using take())
        let left = root_ref.borrow_mut().left.take();
        // 2. Đệ quy để chèn val vào cây con trái
        let new_left = insert_into_bst(left, val);
        // 3. Cập nhật lại cây con trái với kết quả mới
        root_ref.borrow_mut().left = new_left;
    } else {
        // Nếu val lớn hơn giá trị hiện tại:
        // 1. Lấy cây con phải ra khỏi nút hiện tại
        let right = root_ref.borrow_mut().right.take();
        // 2. Đệ quy để chèn val vào cây con phải
        let new_right = insert_into_bst(right, val);
        // 3. Cập nhật lại cây con phải với kết quả mới
        root_ref.borrow_mut().right = new_right;
    }

    // Trả về cây đã được cập nhật
    // Giữ nguyên cấu trúc của cây, chỉ thay đổi các liên kết cần thiết
    root
}


#[cfg(test)]
mod tests {
    use super::*;

    fn create_node(val: i32) -> Option<Rc<RefCell<TreeNode>>> {
        Some(Rc::new(RefCell::new(TreeNode::new(val))))
    }

    #[test]
    fn test_example_1() {
        // Tạo cây: [4,2,7,1,3]
        let root = create_node(4);
        let node2 = create_node(2);
        let node7 = create_node(7);
        let node1 = create_node(1);
        let node3 = create_node(3);

        // Kết nối các nút
        if let Some(root_ref) = &root {
            let mut root_node = root_ref.borrow_mut();
            root_node.left = node2.clone();
            root_node.right = node7;
        }

        if let Some(node2_ref) = &node2 {
            let mut node2_node = node2_ref.borrow_mut();
            node2_node.left = node1;
            node2_node.right = node3;
        }

        // Chèn giá trị 5
        let result = insert_into_bst(root, 5);

        assert!(result.is_some());
        let result_ref = result.unwrap();
        assert_eq!(result_ref.borrow().val, 4);
        assert_eq!(result_ref.borrow().right.as_ref().unwrap().borrow().left.as_ref().unwrap().borrow().val, 5);
    }

    #[test]
    fn test_example_2() {
        let root = create_node(40);
        let node20 = create_node(20);
        let node60 = create_node(60);
        let node10 = create_node(10);
        let node30 = create_node(30);
        let node50 = create_node(50);
        let node70 = create_node(70);

        if let Some(root_ref) = &root {
            let mut root_node = root_ref.borrow_mut();
            root_node.left = node20.clone();
            root_node.right = node60.clone();
        }

        if let Some(node20_ref) = &node20 {
            let mut node20_node = node20_ref.borrow_mut();
            node20_node.left = node10;
            node20_node.right = node30;
        }

        if let Some(node60_ref) = &node60 {
            let mut node60_node = node60_ref.borrow_mut();
            node60_node.left = node50;
            node60_node.right = node70;
        }

        let result = insert_into_bst(root, 25);

        assert!(result.is_some());
        let result_ref = result.unwrap();
        assert_eq!(result_ref.borrow().val, 40);
        assert_eq!(
            result_ref.borrow().left.as_ref().unwrap().borrow().right.as_ref().unwrap().borrow().left.as_ref().unwrap().borrow().val,
            25
        );
    }

    #[test]
    fn test_example_3() {
        
        let root = create_node(4);
        let node2 = create_node(2);
        let node7 = create_node(7);
        let node1 = create_node(1);
        let node3 = create_node(3);

 
        if let Some(root_ref) = &root {
            let mut root_node = root_ref.borrow_mut();
            root_node.left = node2.clone();
            root_node.right = node7;
        }

        if let Some(node2_ref) = &node2 {
            let mut node2_node = node2_ref.borrow_mut();
            node2_node.left = node1;
            node2_node.right = node3;
        }

      
        let result = insert_into_bst(root, 5);

        assert!(result.is_some());
        let result_ref = result.unwrap();
        assert_eq!(result_ref.borrow().val, 4);
        assert_eq!(result_ref.borrow().right.as_ref().unwrap().borrow().left.as_ref().unwrap().borrow().val, 5);
    }


    #[test]
    fn test_empty_tree() {
        let result = insert_into_bst(None, 5);
        assert!(result.is_some());
        assert_eq!(result.unwrap().borrow().val, 5);
    }
}