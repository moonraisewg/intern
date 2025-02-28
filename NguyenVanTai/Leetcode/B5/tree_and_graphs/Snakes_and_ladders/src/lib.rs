// You are given an n x n integer matrix board where the cells are labeled from 1 to n2 in a Boustrophedon style starting from the bottom left of the board (i.e. board[n - 1][0]) and alternating direction each row.

// You start on square 1 of the board. In each move, starting from square curr, do the following:

// Choose a destination square next with a label in the range [curr + 1, min(curr + 6, n2)].
// This choice simulates the result of a standard 6-sided die roll: i.e., there are always at most 6 destinations, regardless of the size of the board.
// If next has a snake or ladder, you must move to the destination of that snake or ladder. Otherwise, you move to next.
// The game ends when you reach the square n2.
// A board square on row r and column c has a snake or ladder if board[r][c] != -1. The destination of that snake or ladder is board[r][c]. Squares 1 and n2 are not the starting points of any snake or ladder.

// Note that you only take a snake or ladder at most once per dice roll. If the destination to a snake or ladder is the start of another snake or ladder, you do not follow the subsequent snake or ladder.

// For example, suppose the board is [[-1,4],[-1,3]], and on the first move, your destination square is 2. You follow the ladder to square 3, but do not follow the subsequent ladder to 4.
// Return the least number of dice rolls required to reach the square n2. If it is not possible to reach the square, return -1.

 

// Example 1:


// Input: board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]
// Output: 4
// Explanation: 
// In the beginning, you start at square 1 (at row 5, column 0).
// You decide to move to square 2 and must take the ladder to square 15.
// You then decide to move to square 17 and must take the snake to square 13.
// You then decide to move to square 14 and must take the ladder to square 35.
// You then decide to move to square 36, ending the game.
// This is the lowest possible number of moves to reach the last square, so return 4.
// Example 2:

// Input: board = [[-1,-1],[-1,3]]
// Output: 1
 

// Constraints:

// n == board.length == board[i].length
// 2 <= n <= 20
// board[i][j] is either -1 or in the range [1, n2].
// The squares labeled 1 and n2 are not the starting points of any snake or ladder.


/*
1. Input: 
   - Ma trận n x n (board)
   - Các ô được đánh số từ 1 đến n^2
   - Giá trị -1: ô thường
   - Giá trị khác -1: điểm đến của rắn hoặc thang

2. Luật chơi:
   - Bắt đầu từ ô 1
   - Mỗi lượt tung xúc xắc (1-6 bước)
   - Nếu gặp rắn/thang phải di chuyển đến điểm đến
   - Kết thúc khi đến ô n^2

3. Output: 
   - Số lần tung xúc xắc ít nhất để đến đích
   - Trả về -1 nếu không thể đến đích
*/
use std::collections::{HashMap, VecDeque};

pub fn snakes_and_ladders(board: Vec<Vec<i32>>) -> i32 {
    let n = board.len();
    let target = (n * n) as i32;
    
    // Hàm chuyển đổi từ số trên bảng sang tọa độ ma trận
    let get_coordinates = |cell: i32| -> (usize, usize) {
        let cell = cell - 1; // Chuyển từ 1-based sang 0-based
        let row = n - 1 - (cell / n as i32) as usize;
        let col = if ((n - 1 - row) % 2 == 0) {
            (cell % n as i32) as usize
        } else {
            (n - 1 - (cell % n as i32) as usize)
        };
        (row, col)
    };

    // BFS để tìm đường đi ngắn nhất
    let mut queue = VecDeque::new();
    let mut visited = HashMap::new();
    
    // Bắt đầu từ ô 1
    queue.push_back(1);
    visited.insert(1, 0); // (ô, số bước)

    while let Some(curr) = queue.pop_front() {
        let steps = *visited.get(&curr).unwrap();
        
        // Đã đến đích
        if curr == target {
            return steps;
        }

        // Thử tất cả các bước có thể (1-6)
        for next in curr + 1..=std::cmp::min(curr + 6, target) {
            let (row, col) = get_coordinates(next);
            
            // Điểm đến sau khi xét rắn/thang
            let destination = if board[row][col] != -1 {
                board[row][col]
            } else {
                next
            };

            // Nếu chưa thăm điểm đến này
            if !visited.contains_key(&destination) {
                visited.insert(destination, steps + 1);
                queue.push_back(destination);
            }
        }
    }

    -1 // Không tìm thấy đường đi
}
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        let board = vec![
            vec![-1,-1,-1,-1,-1,-1],
            vec![-1,-1,-1,-1,-1,-1],
            vec![-1,-1,-1,-1,-1,-1],
            vec![-1,35,-1,-1,13,-1],
            vec![-1,-1,-1,-1,-1,-1],
            vec![-1,15,-1,-1,-1,-1]
        ];
        assert_eq!(snakes_and_ladders(board), 4);
    }

    #[test]
    fn test_example_2() {
        let board = vec![
            vec![-1,-1],
            vec![-1,3]
        ];
        assert_eq!(snakes_and_ladders(board), 1);
    }
}