// Given the root of a binary tree, return the length of the diameter of the tree.

// The diameter of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the root.

// The length of a path between two nodes is represented by the number of edges between them.

 

// Example 1:


// Input: root = [1,2,3,4,5]
// Output: 3
// Explanation: 3 is the length of the path [4,2,1,3] or [5,2,1,3].
// Example 2:

// Input: root = [1,2]
// Output: 1
 

// Constraints:

// The number of nodes in the tree is in the range [1, 104].
// -100 <= Node.val <= 100

use std::cell::RefCell;
use std::rc::Rc;
#[derive(Debug, PartialEq, Eq)]
pub struct NutCay {
    pub gia_tri: i32,                               
    pub nut_trai: Option<Rc<RefCell<NutCay>>>,     
    pub nut_phai: Option<Rc<RefCell<NutCay>>>,    
}

impl NutCay {
    #[inline]
    pub fn tao_nut_moi(gia_tri: i32) -> Self {
        NutCay {
            gia_tri,            
            nut_trai: None,     
            nut_phai: None,     
        }
    }
}

pub struct GiaiPhap {}

impl GiaiPhap {
    pub fn duong_kinh_cay_nhi_phan(goc: Option<Rc<RefCell<NutCay>>>) -> i32 {
        // Biến để lưu đường kính lớn nhất tìm được
        let mut duong_kinh_lon_nhat = 0;
        
        // Hàm đệ quy để tính chiều cao của cây
        fn tinh_chieu_cao(
            nut: &Option<Rc<RefCell<NutCay>>>, 
            duong_kinh_lon_nhat: &mut i32
        ) -> i32 {
            match nut {
                // Trường hợp nút rỗng
                None => -1,
                
                // Trường hợp nút có giá trị
                Some(nut_hien_tai) => {
                    // Mượn tham chiếu đến nút hiện tại
                    let nut_hien_tai = nut_hien_tai.borrow();
                    
                    // Đệ quy để tính chiều cao của cây con trái và phải
                    let chieu_cao_trai = tinh_chieu_cao(&nut_hien_tai.nut_trai, duong_kinh_lon_nhat);
                    let chieu_cao_phai = tinh_chieu_cao(&nut_hien_tai.nut_phai, duong_kinh_lon_nhat);
                    
                    // Cập nhật đường kính lớn nhất nếu tìm thấy đường đi dài hơn
                    // Đường kính = chiều cao trái + chiều cao phải + 2 (số cạnh)
                    *duong_kinh_lon_nhat = (*duong_kinh_lon_nhat)
                        .max(chieu_cao_trai + chieu_cao_phai + 2);
                    
                    // Trả về chiều cao của cây con hiện tại
                    // = max(chiều cao trái, chiều cao phải) + 1
                    chieu_cao_trai.max(chieu_cao_phai) + 1
                }
            }
        }
        
        // Bắt đầu tính từ gốc của cây
        tinh_chieu_cao(&goc, &mut duong_kinh_lon_nhat);
        
        // Trả về kết quả cuối cùng
        duong_kinh_lon_nhat
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    //tạo nút cây mới
    fn tao_nut(gia_tri: i32) -> Option<Rc<RefCell<NutCay>>> {
        Some(Rc::new(RefCell::new(NutCay::tao_nut_moi(gia_tri))))
    }

    //tạo cây với các nút con
    fn tao_cay_voi_con(
        gia_tri: i32,
        con_trai: Option<Rc<RefCell<NutCay>>>,
        con_phai: Option<Rc<RefCell<NutCay>>>
    ) -> Option<Rc<RefCell<NutCay>>> {
        let nut = tao_nut(gia_tri).unwrap();
        nut.borrow_mut().nut_trai = con_trai;
        nut.borrow_mut().nut_phai = con_phai;
        Some(nut)
    }
    #[test]
    fn test_vi_du_1() {
        // Input: root = [1,2,3,4,5]
        // Output: 3
        
        let nut_4 = tao_nut(4);
        let nut_5 = tao_nut(5);
        let nut_2 = tao_cay_voi_con(2, nut_4, nut_5);
        let nut_3 = tao_nut(3);
        let goc = tao_cay_voi_con(1, nut_2, nut_3);

        assert_eq!(GiaiPhap::duong_kinh_cay_nhi_phan(goc), 3);
    }

    #[test]
    fn test_vi_du_2() {
        // Input: root = [1,2]
        // Output: 1
        
        let nut_2 = tao_nut(2);
        let goc = tao_cay_voi_con(1, nut_2, None);

        assert_eq!(GiaiPhap::duong_kinh_cay_nhi_phan(goc), 1);
    }
}