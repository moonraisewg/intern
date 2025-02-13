// Design an algorithm that collects daily price quotes for some stock and returns the span of that stock's price for the current day.

// The span of the stock's price in one day is the maximum number of consecutive days (starting from that day and going backward) for which the stock price was less than or equal to the price of that day.

// For example, if the prices of the stock in the last four days is [7,2,1,2] and the price of the stock today is 2, then the span of today is 4 because starting from today, the price of the stock was less than or equal 2 for 4 consecutive days.
// Also, if the prices of the stock in the last four days is [7,34,1,2] and the price of the stock today is 8, then the span of today is 3 because starting from today, the price of the stock was less than or equal 8 for 3 consecutive days.
// Implement the StockSpanner class:

// StockSpanner() Initializes the object of the class.
// int next(int price) Returns the span of the stock's price given that today's price is price.
 

// Example 1:

// Input
// ["StockSpanner", "next", "next", "next", "next", "next", "next", "next"]
// [[], [100], [80], [60], [70], [60], [75], [85]]
// Output
// [null, 1, 1, 1, 2, 1, 4, 6]

// Explanation
// StockSpanner stockSpanner = new StockSpanner();
// stockSpanner.next(100); // return 1
// stockSpanner.next(80);  // return 1
// stockSpanner.next(60);  // return 1
// stockSpanner.next(70);  // return 2
// stockSpanner.next(60);  // return 1
// stockSpanner.next(75);  // return 4, because the last 4 prices (including today's price of 75) were less than or equal to today's price.
// stockSpanner.next(85);  // return 6
 

// Constraints:

// 1 <= price <= 105
// At most 104 calls will be made to next.


// hiểu đơn giản là 
// Ngày 1: giá = 100

// Span = 1 (chỉ tính ngày hiện tại vì không có ngày nào trước đó)
// Ngày 2: giá = 80

// Span = 1 (vì 80 < 100)
// Ngày 3: giá = 60

// Span = 1 (vì 60 < 80)
// Ngày 4: giá = 70

// Span = 2 (đếm được 2 ngày: 70 và 60)
// Ngày 5: giá = 60

// Span = 1 (chỉ tính ngày hiện tại vì 60 < 70)
// Ngày 6: giá = 75

// Span = 4 (đếm được 4 ngày: 75, 60, 70, 60)
// Ngày 7: giá = 85

// Span = 6 (đếm được 6 ngày: 85, 75, 60, 70, 60, 80)


struct StockSpanner {
    // Stack lưu cặp (giá, span)
    stack: Vec<(i32, i32)>,
}

impl StockSpanner {
    fn new() -> Self {
        StockSpanner {
            stack: Vec::new()
        }
    }
    
    fn next(&mut self, price: i32) -> i32 {
        let mut span = 1;  // tính ngày

        // check rỗng, check giá  <= giá hiện tại
        while !self.stack.is_empty() && self.stack.last().unwrap().0 <= price {
            // Lấy ra và xóa phần tử top của stack
            // p: giá của ngày trước
            // s: span của ngày trước
            let (p, s) = self.stack.pop().unwrap();
            // Cộng dồn span của ngày trước vào span hiện tại
            span += s;
        }
        // Thêm cặp (giá hiện tại, tổng span) vào stack
        self.stack.push((price, span));
        
        // Trả về span tổng
        span
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_case() {
        let mut spanner = StockSpanner::new();
        
        
        assert_eq!(spanner.next(100), 1); // Ngày đầu tiên
        assert_eq!(spanner.next(80), 1);  // 80 < 100
        assert_eq!(spanner.next(60), 1);  // 60 < 80
        assert_eq!(spanner.next(70), 2);  // đếm được 70, 60
        assert_eq!(spanner.next(60), 1);  // 60 < 70
        assert_eq!(spanner.next(75), 4);  // đếm được 75, 60, 70, 60
        assert_eq!(spanner.next(85), 6);  // đếm được 85, 75, 60, 70, 60, 80
    }
}