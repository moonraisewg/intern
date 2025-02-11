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
    pub val: i32,
    pub next: Option<Box<ListNode>>
}

impl ListNode {
    #[inline]
    fn  new (val: i32)-> Self {
        ListNode {
            next: None,
            val
        }
    }
    
}

pub fn delete_duplicates(head:  Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    if head.is_none() {
        return None;
    }

    let mut head = head;
    let mut current = head.as_mut();

    while let Some(cur) =current {
        while cur.next.is_some() && cur.val == cur.next.as_ref().unwrap().val {
              cur.next = cur.next.as_mut().unwrap().next.take();
            
        }

        current = cur.next.as_mut();
        
    }

    head
}

#[cfg(test)]
mod  test {

    use super::*;

    fn create_linked_list(vec: Vec<i32>) -> Option<Box<ListNode>> {
        let mut dummy  = Box::new(ListNode::new(0));
        let mut current = &mut dummy ;

        for &val in vec.iter() {
            current.next = Some(Box::new(ListNode::new(val)));
            current = current.next.as_mut().unwrap();

        }

        dummy.next
    }

    #[test]

    // test case 1
    fn test_delete_duplicates() {
        let input1 = create_linked_list(vec![1, 1, 2]);
        let expected1 = create_linked_list(vec![1, 2]);
        assert_eq!(delete_duplicates(input1),expected1);

        // test case 2
        let input2 = create_linked_list(vec![1, 1, 2, 3, 3]);
        let expected2 = create_linked_list(vec![1, 2, 3]);
        assert_eq!(delete_duplicates(input2), expected2);

        // test case 3
        assert_eq!(delete_duplicates(None), None);
    }
}
