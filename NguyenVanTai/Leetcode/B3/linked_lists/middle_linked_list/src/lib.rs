// Given the head of a singly linked list, return the middle node of the linked list.

// If there are two middle nodes, return the second middle node.

 

// Example 1:


// Input: head = [1,2,3,4,5]
// Output: [3,4,5]
// Explanation: The middle node of the list is node 3.
// Example 2:


// Input: head = [1,2,3,4,5,6]
// Output: [4,5,6]
// Explanation: Since the list has two middle nodes with values 3 and 4, we return the second one.


#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>
}

impl ListNode {
    #[inline]
    fn new(val: i32) -> Self {    // tạo contructor 
        ListNode {
            val,          // giá trị lưu trong node 
            next: None    // con trỏ next trỏ đến node tiếp theo
        }
    }
}
pub struct Solution {}

impl Solution {
    // Phương pháp 1: Đếm số node, sau đó di chuyển đến node giữa 
    pub fn middle_node_count(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut count = 0;  // Tạo biến đếm node
        let mut current = head.clone(); // Tạo con trỏ để không thay đổi giá trị nhâjp vào
        while let Some(node) = current {
            count += 1;   // tăng biến đếm trong vòng lặp để đếm số node
            current = node.next;  // gán giá trị kiểu như i++ trong java
        }

        // di chuyển đến node giữa
        let middle = count / 2;  // lấy tổng chia 2 là ra node giữa
        let mut current = head; //Reset con trỏ về đầu
        for _ in 0..middle { // tạo vòng lặp để di chuyển đến node giữa số lần lấy từ middle 
            current = current.unwrap().next; // mỗi lần lặp di chuyển đến node tiếp theo đến khi hết số lần của middle là ra node giữa
        }

        current // trả về giá trị node giữa
    }
// Phương pháp 2: Dùng 2 con trỏ chậm và và nhanh
    pub fn middle_node_two_pointers(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut slow = &head; 
        let mut fast = &head;
        
        while fast.is_some() && fast.as_ref().unwrap().next.is_some() {
            slow = &slow.as_ref().unwrap().next; // chậm thì nhảy 1 bước 
            fast = &fast.as_ref().unwrap().next.as_ref().unwrap().next; // nhanh thì nhảy 2 bước
            // lúc con trỏ nhanh về đích thì con trỏ chạm đang ở giữa rồi,vì nó đi chậm hơn 1 nửa so với con kia 
        }
        
        slow.clone()
    }


    // phương pháp 3 : Dùng vector để lưu tất cả các node, sau đó lấy node giữa
    pub fn middle_node_vector(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut nodes = Vec::new();  // dùng vector lưu các node
        let mut current = head; // con trỏ duyệt sanh sách
        
        while let Some(node) = current {   // truyền vào node kiểu Option<Box<ListNode>>
            nodes.push(node.clone());  // push node vào vector
            current = node.next;  // duyệt node tiếp theo
        }
        
        nodes.get(nodes.len() / 2).cloned() // đoạn này sẽ lấy node giữa chẳng hạn 6 node thì lấy node thứ 3.node đi từ 0 nên lấy số 4;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_linked_list(vec: Vec<i32>) -> Option<Box<ListNode>> {
        let mut dummy = Box::new(ListNode::new(0));  // Node giả để dễ thêm node
        let mut current = &mut dummy;                // Con trỏ để duyệt

        // Thêm các node vào danh sách
        for &val in vec.iter() {
            current.next = Some(Box::new(ListNode::new(val))); // Tạo node mới
            current = current.next.as_mut().unwrap();          // Di chuyển con trỏ
        }
        
        dummy.next                         // Trả về danh sách thực (bỏ qua dummy)
    }

    #[test]
    fn test_all_approaches() {
        // Test case 1: odd length [1,2,3,4,5]
        let list1 = create_linked_list(vec![1, 2, 3, 4, 5]);
        assert_eq!(Solution::middle_node_count(list1.clone()).unwrap().val, 3);
        assert_eq!(Solution::middle_node_two_pointers(list1.clone()).unwrap().val, 3);
        assert_eq!(Solution::middle_node_vector(list1.clone()).unwrap().val, 3);

        // Test case 2: even length [1,2,3,4,5,6]
        let list2 = create_linked_list(vec![1, 2, 3, 4, 5, 6]);
        assert_eq!(Solution::middle_node_count(list2.clone()).unwrap().val, 4);
        assert_eq!(Solution::middle_node_two_pointers(list2.clone()).unwrap().val, 4);
        assert_eq!(Solution::middle_node_vector(list2.clone()).unwrap().val, 4);
    }
}