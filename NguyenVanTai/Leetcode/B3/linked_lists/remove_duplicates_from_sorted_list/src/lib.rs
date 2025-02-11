// Given the head of a sorted linked list, delete all duplicates such that each element appears only once. Return the linked list sorted as well.

 

// Example 1:


// Input: head = [1,1,2]
// Output: [1,2]
// Example 2:


// Input: head = [1,1,2,3,3]
// Output: [1,2,3]
 

// Constraints:

// The number of nodes in the list is in the range [0, 300].
// -100 <= Node.val <= 100
// The list is guaranteed to be sorted in ascending order.


#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,                    // Giá trị của node
    pub next: Option<Box<ListNode>>  // Con trỏ đến node tiếp theo
}

// methods tạo mới cho struct ListNode
impl ListNode {
    #[inline]  
    fn new(val: i32) -> Self {
        ListNode {
            next: None,  
            val         
        }
    }
}


pub fn delete_duplicates(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    if head.is_none() {
        return None;
    }

    let mut head = head;  // láy head nhưng mutable
    let mut current = head.as_mut();  // Con trỏ để duyệt danh sách

    while let Some(cur) = current {
        // nếu cur và cur.next có giá trị giống nhau và cur.val == cur.next.val dùng as_ref() để tham chiếu, unwrap để lấy giá trị ra khỏi Option
        while cur.next.is_some() && cur.val == cur.next.as_ref().unwrap().val {
            // gán giá trị của cur.next bằng giá trị của cur.next.next.take()
            // để loại node trùng do đã kiểm tra ở trên  
            // dùng unwrap để lấy giá trị ra khỏi Option
            cur.next = cur.next.as_mut().unwrap().next.take();
        }
        // Di chuyển đến node tiếp theo
        current = cur.next.as_mut();
    }

    head  // Trả về danh sách đã được xử lý
}


#[cfg(test)]
mod test {
    use super::*;

    fn create_linked_list(vec: Vec<i32>) -> Option<Box<ListNode>> {
        // Tạo node giả với giá trị 0 để bắt đầu từ đầu 
        // Dùng Box để cấp phát bộ nhớ trên heap
        let mut dummy = Box::new(ListNode::new(0));
    
        // Tạo con trỏ current để duyệt danh sách
        let mut current = &mut dummy;
    
        // Duyệt qua từng phần tử trong vector
        for &val in vec.iter() {
            // Tạo node mới với giá trị từ vector
            // Đóng gói trong Some và Box để quản lý bộ nhớ
            current.next = Some(Box::new(ListNode::new(val)));
    
            // Di chuyển con trỏ current đến node vừa tạo
            // unwrap() để lấy giá trị từ Option
            current = current.next.as_mut().unwrap();
        }
    
        // Trả về phần danh sách thực, bỏ qua node dummy
        dummy.next
    }

    #[test]
    fn test_delete_duplicates() {
        // Test case 1
        let input1 = create_linked_list(vec![1, 1, 2]);
        let expected1 = create_linked_list(vec![1, 2]);
        assert_eq!(delete_duplicates(input1), expected1);

        // Test case 2
        let input2 = create_linked_list(vec![1, 1, 2, 3, 3]);
        let expected2 = create_linked_list(vec![1, 2, 3]);
        assert_eq!(delete_duplicates(input2), expected2);

        // Test case 3
        assert_eq!(delete_duplicates(None), None);
    }
}