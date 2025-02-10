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
    fn new(val: i32) -> Self {
        ListNode {
            val,
            next: None
        }
    }
}
pub struct Solution {}

impl Solution {
    pub fn middle_node_count(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        // đếm tổng số node 
        let mut count = 0;
        let mut current = head.clone();
        while let Some(node) = current {
            count += 1;
            current = node.next;
        }

        // di chuyển đến node giữa
        let middle = count / 2; 
        let mut current = head;
        for _ in 0..middle {
            current = current.unwrap().next;
        }

        current
    }

    pub fn middle_node_two_pointers(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut slow = &head;
        let mut fast = &head;
        
        while fast.is_some() && fast.as_ref().unwrap().next.is_some() {
            slow = &slow.as_ref().unwrap().next;
            fast = &fast.as_ref().unwrap().next.as_ref().unwrap().next;
        }
        
        slow.clone()
    }

    pub fn middle_node_vector(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut nodes = Vec::new();
        let mut current = head;
        
        while let Some(node) = current {
            nodes.push(node.clone());
            current = node.next;
        }
        
        nodes.get(nodes.len() / 2).cloned()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_linked_list(vec: Vec<i32>) -> Option<Box<ListNode>> {
        let mut dummy = Box::new(ListNode::new(0));
        let mut current = &mut dummy;

        for &val in vec.iter() {
            current.next = Some(Box::new(ListNode::new(val)));
            current = current.next.as_mut().unwrap();
        }
        
        dummy.next
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