// You are given an m x n matrix maze (0-indexed) with empty cells (represented as '.') and walls (represented as '+'). You are also given the entrance of the maze, where entrance = [entrancerow, entrancecol] denotes the row and column of the cell you are initially standing at.

// In one step, you can move one cell up, down, left, or right. You cannot step into a cell with a wall, and you cannot step outside the maze. Your goal is to find the nearest exit from the entrance. An exit is defined as an empty cell that is at the border of the maze. The entrance does not count as an exit.

// Return the number of steps in the shortest path from the entrance to the nearest exit, or -1 if no such path exists.

 

// Example 1:


// Input: maze = [["+","+",".","+"],[".",".",".","+"],["+","+","+","."]], entrance = [1,2]
// Output: 1
// Explanation: There are 3 exits in this maze at [1,0], [0,2], and [2,3].
// Initially, you are at the entrance cell [1,2].
// - You can reach [1,0] by moving 2 steps left.
// - You can reach [0,2] by moving 1 step up.
// It is impossible to reach [2,3] from the entrance.
// Thus, the nearest exit is [0,2], which is 1 step away.
// Example 2:


// Input: maze = [["+","+","+"],[".",".","."],["+","+","+"]], entrance = [1,0]
// Output: 2
// Explanation: There is 1 exit in this maze at [1,2].
// [1,0] does not count as an exit since it is the entrance cell.
// Initially, you are at the entrance cell [1,0].
// - You can reach [1,2] by moving 2 steps right.
// Thus, the nearest exit is [1,2], which is 2 steps away.
// Example 3:


// Input: maze = [[".","+"]], entrance = [0,0]
// Output: -1
// Explanation: There are no exits in this maze.
 

// Constraints:

// maze.length == m
// maze[i].length == n
// 1 <= m, n <= 100
// maze[i][j] is either '.' or '+'.
// entrance.length == 2
// 0 <= entrancerow < m
// 0 <= entrancecol < n
// entrance will always be an empty cell.

//1. Phân tích bài toán:
// Input:
// Mê cung (maze) là ma trận m x n
// '.' là ô trống có thể đi
// '+' là tường không thể đi
// Điểm vào (entrance) là tọa độ [row, col]
// Output: Số bước đi ngắn nhất để đến exit, hoặc -1 nếu không tìm thấy
// Exit: Là ô trống ở biên của mê cung (không tính điểm vào)
// Di chuyển: 4 hướng (lên, xuống, trái, phải)
// 2. Giải pháp:
// Sử dụng BFS (Breadth-First Search) để tìm đường đi ngắn nhất
// BFS sẽ duyệt theo từng lớp, đảm bảo tìm được đường đi ngắn nhất
use std::collections::VecDeque;

pub fn nearest_exit(maze: Vec<Vec<char>>, entrance: Vec<i32>) -> i32 {
    let rows = maze.len() as i32;
    let cols = maze[0].len() as i32;
    
    // Queue để lưu các ô cần duyệt: (row, col, steps)
    let mut queue = VecDeque::new();
    // Ma trận đánh dấu các ô đã thăm
    let mut visited = vec![vec![false; cols as usize]; rows as usize];
    
    // Thêm điểm vào vào queue và đánh dấu đã thăm
    let (start_row, start_col) = (entrance[0], entrance[1]);
    queue.push_back((start_row, start_col, 0));
    visited[start_row as usize][start_col as usize] = true;
    
    // Các hướng di chuyển: lên, xuống, trái, phải
    let directions = [(0, 1), (0, -1), (1, 0), (-1, 0)];
    
    // BFS
    while let Some((row, col, steps)) = queue.pop_front() {
        // Nếu đây là exit (ở biên và không phải điểm vào)
        if (row == 0 || row == rows - 1 || col == 0 || col == cols - 1) &&
           (row != start_row || col != start_col) {
            return steps;
        }
        
        // Thử các hướng di chuyển có thể
        for (dx, dy) in directions.iter() {
            let new_row = row + dx;
            let new_col = col + dy;
            
            // Kiểm tra điều kiện hợp lệ
            if new_row >= 0 && new_row < rows && 
               new_col >= 0 && new_col < cols && 
               maze[new_row as usize][new_col as usize] == '.' &&
               !visited[new_row as usize][new_col as usize] {
                // Đánh dấu đã thăm và thêm vào queue
                visited[new_row as usize][new_col as usize] = true;
                queue.push_back((new_row, new_col, steps + 1));
            }
        }
    }
    
    -1 // Không tìm thấy exit
}

// Test cases
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        let maze = vec![
            vec!['+','+','.','+'],
            vec!['.','.','.','+'],
            vec!['+','+','+','.']
        ];
        let entrance = vec![1,2];
        assert_eq!(nearest_exit(maze, entrance), 1);
    }

    #[test]
    fn test_example_2() {
        let maze = vec![
            vec!['+','+','+'],
            vec!['.','.', '.'],
            vec!['+','+','+']
        ];
        let entrance = vec![1,0];
        assert_eq!(nearest_exit(maze, entrance), 2);
    }

    #[test]
    fn test_example_3() {
        let maze = vec![vec!['.','+']];
        let entrance = vec![0,0];
        assert_eq!(nearest_exit(maze, entrance), -1);
    }
}