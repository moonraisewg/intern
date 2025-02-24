// You are given an m x n binary matrix grid. An island is a group of 1's (representing land) connected 
// 4-directionally (horizontal or vertical.) You may assume all four edges of the grid are surrounded by water.

// The area of an island is the number of cells with a value 1 in the island.

// Return the maximum area of an island in grid. If there is no island, return 0.

 

// Example 1:


// Input: grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],
// [0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],
// [0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]
// Output: 6
// Explanation: The answer is not 11, because the island must be connected 4-directionally.
// Example 2:

// Input: grid = [[0,0,0,0,0,0,0,0]]
// Output: 0
 

// Constraints:

// m == grid.length
// n == grid[i].length
// 1 <= m, n <= 50
// grid[i][j] is either 0 or 1.

pub fn max_area_of_island(grid: Vec<Vec<i32>>) -> i32 {
    // Lấy kích thước của grid
    let rows = grid.len();
    let cols = grid[0].len();
    
    // Tạo ma trận visited để đánh dấu các ô đã thăm
    let mut visited = vec![vec![false; cols]; rows];
    
    // Biến lưu diện tích lớn nhất
    let mut max_area = 0;
    
    // Duyệt qua từng ô trong grid
    for i in 0..rows {
        for j in 0..cols {
            // Nếu ô chưa được thăm và là đất liền (1)
            if !visited[i][j] && grid[i][j] == 1 {
                // Tính diện tích của đảo bắt đầu từ ô này
                let area = dfs(&grid, &mut visited, i, j);
                // Cập nhật diện tích lớn nhất
                max_area = max_area.max(area);
            }
        }
    }
    
    max_area
}

// Hàm DFS để tính diện tích của một đảo
fn dfs(grid: &Vec<Vec<i32>>, visited: &mut Vec<Vec<bool>>, row: usize, col: usize) -> i32 {
    // Kích thước của grid
    let rows = grid.len();
    let cols = grid[0].len();
    
    // Nếu ô nằm ngoài grid hoặc đã thăm hoặc là nước (0)
    if row >= rows || col >= cols || visited[row][col] || grid[row][col] == 0 {
        return 0;
    }
    
    // Đánh dấu ô hiện tại đã thăm
    visited[row][col] = true;
    
    // Tính tổng diện tích bằng 1 (ô hiện tại) + diện tích của 4 ô xung quanh
    let mut area = 1;
    
    // Kiểm tra 4 ô xung quanh
    // Ô phía trên
    if row > 0 {
        area += dfs(grid, visited, row - 1, col);
    }
    // Ô phía dưới
    area += dfs(grid, visited, row + 1, col);
    // Ô bên trái
    if col > 0 {
        area += dfs(grid, visited, row, col - 1);
    }
    // Ô bên phải
    area += dfs(grid, visited, row, col + 1);
    
    area
}

// Test cases
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        let grid = vec![
            vec![0,0,1,0,0,0,0,1,0,0,0,0,0],
            vec![0,0,0,0,0,0,0,1,1,1,0,0,0],
            vec![0,1,1,0,1,0,0,0,0,0,0,0,0],
            vec![0,1,0,0,1,1,0,0,1,0,1,0,0],
            vec![0,1,0,0,1,1,0,0,1,1,1,0,0],
            vec![0,0,0,0,0,0,0,0,0,0,1,0,0],
            vec![0,0,0,0,0,0,0,1,1,1,0,0,0],
            vec![0,0,0,0,0,0,0,1,1,0,0,0,0]
        ];
        assert_eq!(max_area_of_island(grid), 6);
    }

    #[test]
    fn test_example_2() {
        let grid = vec![vec![0,0,0,0,0,0,0,0]];
        assert_eq!(max_area_of_island(grid), 0);
    }
}