#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,                    
    pub next: Option<Box<ListNode>>  
}


impl ListNode {
    #[inline]  
    fn new(val: i32) -> Self {
        ListNode {
            next: None, 
            val         
        }
    }
}

pub fn reverse_between(head: Option<Box<ListNode>>, left: i32, right: i32) -> Option<Box<ListNode>> {
    // Nếu vị trí left và right bằng nhau, không cần đảo ngược
    if left == right {
        return head;
    }

    
   
    let mut dummy = Box::new(ListNode::new(0)); // Tạo một dummy node  val =0 để left bằng 1 thì có thể trỏ đến dummy.next
    dummy.next = head;  // Dummy node sẽ trỏ đến head của danh sách
    let mut dummy_ref = &mut dummy; // Con trỏ dummy_ref có thể thay đổi giá trị của dummy để thay đổi danh sách
  
    for _ in 1..left {   // Di chuyển con trỏ (left-1) lần để đến node trước vị trí cần đảo ngược
        dummy_ref = dummy_ref.next.as_mut().unwrap(); 
    }

    
  
    
    let mut current = dummy_ref.next.take();   // current: node hiện tại đang xét
    let mut prev = None; // prev: node trước đó (sẽ trở thành next sau khi đảo)
    
   
    for _ in 0..=(right - left) {// vòng lặp để đảo ngược các node từ left đến right số lần bằng right-left 
        // Lưu node tiếp theo
        let next = current.as_mut().unwrap().next.take();// tạo next để giữ node 
        
        current.as_mut().unwrap().next = prev;  // Đảo chiều mũi tên: current trỏ về prev thay vì next 
        
        prev = current; // cập nhập prev thành current chậm hơn 1 bước với current để tiếp tục đảo ngược
        current = next; // cập nhập current thành next nhanh hơn 1 bước với prev để tiếp tục đảo ngược
  
   }

    
    let mut tail = prev.as_mut().unwrap(); 
    while tail.next.is_some() {  // lặp tới node cuối cùng của phần đã đảo ngược
        tail = tail.next.as_mut().unwrap(); // next đến cuối danh sách đã đảo
    }
    // Nối đuôi với phần còn lại của danh sách
    tail.next = current; // theo đề bài thì thằng curent sau khi lặp đang ở node sau right mà thằng tail đang ở node cuối của phần đã đảo ngược nên chỉ cần nối tail với current là xong
   
    dummy_ref.next = prev; // thằng dummy_ref đang ở node trước left nên chỉ cần nối nó với prev là xong vì prev là node cuối của phần đã đảo ngược 

    // Trả về danh sách đã đảo ngược (bỏ qua dummy node)
    dummy.next
}

#[cfg(test)]
mod test {
    use super::*;

    // Hàm tiện ích để tạo danh sách liên kết từ vector
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
    fn test_reverse_between() {
        // Test case 1: [1,2,3,4,5] với left=2, right=4 -> [1,4,3,2,5]
        let input1 = create_linked_list(vec![1,2,3,4,5]);
        let expected1 = create_linked_list(vec![1,4,3,2,5]);
        assert_eq!(reverse_between(input1, 2, 4), expected1);

        // Test case 2: [5] với left=1, right=1 -> [5]
        let input2 = create_linked_list(vec![5]);
        let expected2 = create_linked_list(vec![5]);
        assert_eq!(reverse_between(input2, 1, 1), expected2);
    }
}