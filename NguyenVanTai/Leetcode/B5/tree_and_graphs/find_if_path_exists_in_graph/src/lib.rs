// There is a bi-directional graph with n vertices, where each vertex is labeled from 0 to n - 1 (inclusive). The edges in the graph are represented as a 2D integer array edges, where each edges[i] = [ui, vi] denotes a bi-directional edge between vertex ui and vertex vi. Every vertex pair is connected by at most one edge, and no vertex has an edge to itself.

// You want to determine if there is a valid path that exists from vertex source to vertex destination.

// Given edges and the integers n, source, and destination, return true if there is a valid path from source to destination, or false otherwise.

 

// Example 1:


// Input: n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2
// Output: true
// Explanation: There are two paths from vertex 0 to vertex 2:
// - 0 → 1 → 2
// - 0 → 2
// Example 2:


// Input: n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5
// Output: false
// Explanation: There is no path from vertex 0 to vertex 5.
 

// Constraints:

// 1 <= n <= 2 * 105
// 0 <= edges.length <= 2 * 105
// edges[i].length == 2
// 0 <= ui, vi <= n - 1
// ui != vi
// 0 <= source, destination <= n - 1
// There are no duplicate edges.
// There are no self edges.

use std::collections::HashMap;
use std::collections::HashSet;

pub fn valid_path(n: i32, edges: Vec<Vec<i32>>, source: i32, destination: i32) -> bool {
    // Bước 1: Tạo adjacency list (danh sách kề) để biểu diễn đồ thị
    let mut graph: HashMap<i32, Vec<i32>> = HashMap::new();
    
    // Bước 2: Xây dựng đồ thị từ danh sách cạnh
    for edge in edges {
        // Thêm cạnh theo hai chiều vì đây là đồ thị vô hướng
        graph.entry(edge[0]).or_insert(Vec::new()).push(edge[1]);
        graph.entry(edge[1]).or_insert(Vec::new()).push(edge[0]);
    }
    
    // Bước 3: Tạo một HashSet để theo dõi các đỉnh đã thăm
    let mut visited: HashSet<i32> = HashSet::new();
    
    // Bước 4: Gọi hàm DFS để tìm đường đi
    dfs(&graph, source, destination, &mut visited)
}

// Hàm DFS để tìm đường đi từ current đến destination
fn dfs(
    graph: &HashMap<i32, Vec<i32>>, 
    current: i32, 
    destination: i32, 
    visited: &mut HashSet<i32>
) -> bool {
    // Nếu đỉnh hiện tại là đích, trả về true
    if current == destination {
        return true;
    }
    
    // Đánh dấu đỉnh hiện tại đã được thăm
    visited.insert(current);
    
    // Duyệt qua tất cả các đỉnh kề với đỉnh hiện tại
    if let Some(neighbors) = graph.get(&current) {
        for &next in neighbors {
            // Nếu đỉnh kề chưa được thăm, tiếp tục tìm đường đi
            if !visited.contains(&next) {
                if dfs(graph, next, destination, visited) {
                    return true;
                }
            }
        }
    }
    
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
    
        let n = 3;
        let edges = vec![vec![0,1], vec![1,2], vec![2,0]];
        let source = 0;
        let destination = 2;
        assert_eq!(valid_path(n, edges, source, destination), true);
    }

    #[test]
    fn test_example_2() {

        let n = 6;
        let edges = vec![vec![0,1], vec![0,2], vec![3,5], vec![5,4], vec![4,3]];
        let source = 0;
        let destination = 5;
        assert_eq!(valid_path(n, edges, source, destination), false);
    }

}