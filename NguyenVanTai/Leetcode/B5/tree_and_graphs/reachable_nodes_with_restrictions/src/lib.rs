// There is an undirected tree with n nodes labeled from 0 to n - 1 and n - 1 edges.

// You are given a 2D integer array edges of length n - 1 where edges[i] = [ai, bi] 
//indicates that there is an edge between nodes ai and bi in the tree. You are also given
// an integer array restricted which represents restricted nodes.

// Return the maximum number of nodes you can reach from node 0 without visiting a restricted node.

// Note that node 0 will not be a restricted node.

 

// Example 1:


// Input: n = 7, edges = [[0,1],[1,2],[3,1],[4,0],[0,5],[5,6]], restricted = [4,5]
// Output: 4
// Explanation: The diagram above shows the tree.
// We have that [0,1,2,3] are the only nodes that can be 
//reached from node 0 without visiting a restricted node.
// Example 2:


// Input: n = 7, edges = [[0,1],[0,2],[0,5],[0,4],[3,2],[6,5]], restricted = [4,2,1]
// Output: 3
// Explanation: The diagram above shows the tree.
// We have that [0,5,6] are the only nodes that can be reached 
//from node 0 without visiting a restricted node.
 

// Constraints:

// 2 <= n <= 105
// edges.length == n - 1
// edges[i].length == 2
// 0 <= ai, bi < n
// ai != bi
// edges represents a valid tree.
// 1 <= restricted.length < n
// 1 <= restricted[i] < n
// All the values of restricted are unique.

use std::collections::{HashMap, HashSet};

pub fn reachable_nodes(n: i32, edges: Vec<Vec<i32>>, restricted: Vec<i32>) -> i32 {
    // Tạo tập hợp các đỉnh bị cấm để dễ dàng kiểm tra
    let restricted_set: HashSet<i32> = restricted.into_iter().collect();
    
    // Tạo danh sách kề để biểu diễn cây
    let mut graph: HashMap<i32, Vec<i32>> = HashMap::new();
    
    // Xây dựng danh sách kề từ danh sách cạnh
    for edge in edges {
        // Thêm cạnh theo hai chiều vì đây là cây vô hướng
        graph.entry(edge[0]).or_insert(Vec::new()).push(edge[1]);
        graph.entry(edge[1]).or_insert(Vec::new()).push(edge[0]);
    }
    
    // Tập hợp các đỉnh đã thăm
    let mut visited: HashSet<i32> = HashSet::new();
    
    // Bắt đầu DFS từ đỉnh 0
    dfs(0, &graph, &restricted_set, &mut visited)
}

// Hàm DFS để đếm số đỉnh có thể đến được
fn dfs(
    current: i32,
    graph: &HashMap<i32, Vec<i32>>,
    restricted: &HashSet<i32>,
    visited: &mut HashSet<i32>
) -> i32 {
    // Nếu đỉnh hiện tại bị cấm hoặc đã thăm, dừng
    if restricted.contains(&current) || visited.contains(&current) {
        return 0;
    }
    
    // Đánh dấu đỉnh hiện tại đã thăm
    visited.insert(current);
    
    // Khởi tạo số đỉnh có thể đến được từ đỉnh hiện tại
    let mut count = 1; // Đếm cả đỉnh hiện tại
    
    // Duyệt qua các đỉnh kề
    if let Some(neighbors) = graph.get(&current) {
        for &next in neighbors {
            count += dfs(next, graph, restricted, visited);
        }
    }
    
    count
}

// Test cases
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        let n = 7;
        let edges = vec![
            vec![0,1], vec![1,2], vec![3,1],
            vec![4,0], vec![0,5], vec![5,6]
        ];
        let restricted = vec![4,5];
        assert_eq!(reachable_nodes(n, edges, restricted), 4);
    }

    #[test]
    fn test_example_2() {
        let n = 7;
        let edges = vec![
            vec![0,1], vec![0,2], vec![0,5],
            vec![0,4], vec![3,2], vec![6,5]
        ];
        let restricted = vec![4,2,1];
        assert_eq!(reachable_nodes(n, edges, restricted), 3);
    }
}