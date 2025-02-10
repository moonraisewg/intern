// You are given an integer array matches where matches[i] = [winneri, loseri] indicates that the player winneri defeated player loseri in a match.

// Return a list answer of size 2 where:

// answer[0] is a list of all players that have not lost any matches.
// answer[1] is a list of all players that have lost exactly one match.
// The values in the two lists should be returned in increasing order.

// Note:

// You should only consider the players that have played at least one match.
// The testcases will be generated such that no two matches will have the same outcome.
 

// Example 1:

// Input: matches = [[1,3],[2,3],[3,6],[5,6],[5,7],[4,5],[4,8],[4,9],[10,4],[10,9]]
// Output: [[1,2,10],[4,5,7,8]]
// Explanation:
// Players 1, 2, and 10 have not lost any matches.
// Players 4, 5, 7, and 8 each have lost one match.
// Players 3, 6, and 9 each have lost two matches.
// Thus, answer[0] = [1,2,10] and answer[1] = [4,5,7,8].
// Example 2:

// Input: matches = [[2,3],[1,3],[5,4],[6,4]]
// Output: [[1,2,5,6],[]]
// Explanation:
// Players 1, 2, 5, and 6 have not lost any matches.
// Players 3 and 4 each have lost two matches.
// Thus, answer[0] = [1,2,5,6] and answer[1] = [].

use std::collections::HashMap;

fn find_winners(matches: Vec<Vec<i32>>) -> Vec<Vec<i32>> {
    let mut losses = HashMap::new();
    
    // số nào đứng truoc thì thắng, xong cộng số trận thua cho số sau để phân biệt.
    for match_result in matches.iter() {
        let winner = match_result[0];
        let loser = match_result[1];
        losses.entry(winner).or_insert(0);
        *losses.entry(loser).or_insert(0) += 1;
    }
    
    let mut no_losses = Vec::new();
    let mut one_loss = Vec::new();
    
    // Phân loại và in thông tin chi tiết 
    println!("\nThông tin chi tiết về các trận đấu:");
    println!("-----------------------------------");
    
    for (&player, &loss_count) in losses.iter() {
        match loss_count {
            0 => {
                println!("Người chơi {} chưa thua trận nào", player);
                no_losses.push(player);
            },
            1 => {
                println!("Người chơi {} thua đúng một trận", player);
                one_loss.push(player);
            },
            _ => println!("Người chơi {} thua {} trận", player, loss_count)
        }
    }
    
    // Sắp xếp kết quả
    no_losses.sort_unstable();
    one_loss.sort_unstable();
    
    println!("Kết quả tổng hợp:");
    println!("Danh sách người chơi chưa thua trận nào: {:?}", no_losses);
    println!("Danh sách người chơi thua đúng một trận: {:?}", one_loss);
    
    vec![no_losses, one_loss]
}

fn main() {
    let matches1 = vec![
        vec![1,3], vec![2,3], vec![3,6], vec![5,6], 
        vec![5,7], vec![4,5], vec![4,8], vec![4,9], 
        vec![10,4], vec![10,9]
    ];
    
    println!("Test case 1:");
    let result1 = find_winners(matches1);
    
    println!("\n----------------------------------------\n");
    
    let matches2 = vec![
        vec![2,3], vec![1,3], vec![5,4], vec![6,4]
    ];
    
    println!("Test case 2:");
    let result2 = find_winners(matches2);
}