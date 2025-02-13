// Giải thích bài toán Next Greater Element I
// Yêu cầu bài toán:
// Cho 2 mảng số nguyên nums1 và nums2, trong đó nums1 là tập con của nums2
// Phần tử lớn hơn kế tiếp của một phần tử x trong mảng là phần tử đầu tiên lớn hơn x ở bên phải của x trong cùng mảng đó
// Nhiệm vụ:
// Với mỗi phần tử nums1[i] trong nums1:

// Tìm vị trí j trong nums2 sao cho nums1[i] = nums2[j]
// Tìm phần tử lớn hơn kế tiếp của nums2[j] trong mảng nums2
// Nếu không tìm thấy phần tử lớn hơn kế tiếp, trả về -1
// Trả về một mảng kết quả có độ dài bằng nums1.length chứa các phần tử lớn hơn kế tiếp tương ứng

// Ví dụ:

// Input: nums1 = [4,1,2], nums2 = [1,3,4,2]
// Output: [-1,3,-1]

// Giải thích:
// - Với 4: không có số nào lớn hơn 4 ở bên phải -> -1
// - Với 1: số lớn hơn kế tiếp là 3 -> 3 
// - Với 2: không có số nào lớn hơn 2 ở bên phải -> -1

// Ràng buộc:
// 1 ≤ nums1.length ≤ nums2.length ≤ 1000
// 0 ≤ nums1[i], nums2[i] ≤ 10^4
// Các số trong nums1 và nums2 là duy nhất
// Mọi số trong nums1 đều xuất hiện trong nums2
// Yêu cầu nâng cao:
// Tìm giải pháp có độ phức tạp O(nums1.length + nums2.length)



