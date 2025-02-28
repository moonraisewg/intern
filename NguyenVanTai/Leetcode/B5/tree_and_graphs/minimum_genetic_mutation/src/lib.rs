use std::collections::{HashSet, VecDeque};

// A gene string can be represented by an 8-character long string, with choices from 'A', 'C', 'G', and 'T'.

// Suppose we need to investigate a mutation from a gene string startGene to a gene string endGene where one mutation is defined as one single character changed in the gene string.

// For example, "AACCGGTT" --> "AACCGGTA" is one mutation.
// There is also a gene bank bank that records all the valid gene mutations. A gene must be in bank to make it a valid gene string.

// Given the two gene strings startGene and endGene and the gene bank bank, return the minimum number of mutations needed to mutate from startGene to endGene. If there is no such a mutation, return -1.

// Note that the starting point is assumed to be valid, so it might not be included in the bank.

 

// Example 1:

// Input: startGene = "AACCGGTT", endGene = "AACCGGTA", bank = ["AACCGGTA"]
// Output: 1
// Example 2:

// Input: startGene = "AACCGGTT", endGene = "AAACGGTA", bank = ["AACCGGTA","AACCGCTA","AAACGGTA"]
// Output: 2
 

// Constraints:

// 0 <= bank.length <= 10
// startGene.length == endGene.length == bank[i].length == 8
// startGene, endGene, and bank[i] consist of only the characters ['A', 'C', 'G', 'T'].

pub fn min_mutation(startGene: String, endGene: String, bank: Vec<String>) -> i32 {
    // Tạo tập hợp các gene hợp lệ từ bank để dễ dàng kiểm tra
    let bank_set: HashSet<String> = bank.into_iter().collect();
    
    // Nếu endGene không có trong bank, trả về -1
    if !bank_set.contains(&endGene) {
        return -1;
    }
    
    // Các ký tự có thể thay đổi
    let genes = ['A', 'C', 'G', 'T'];
    
    // Queue để lưu các gene cần duyệt: (gene, số bước)
    let mut queue = VecDeque::new();
    queue.push_back((startGene.clone(), 0));
    
    // Tập hợp các gene đã thăm
    let mut visited = HashSet::new();
    visited.insert(startGene);
    
    // BFS
    while let Some((current_gene, steps)) = queue.pop_front() {
        // Nếu gene hiện tại là endGene, trả về số bước
        if current_gene == endGene {
            return steps;
        }
        
        // Thử thay đổi từng ký tự trong gene hiện tại
        let mut gene_chars: Vec<char> = current_gene.chars().collect();
        for i in 0..gene_chars.len() {
            let original_char = gene_chars[i];
            for &gene in &genes {
                if gene != original_char {
                    gene_chars[i] = gene;
                    let new_gene: String = gene_chars.iter().collect();
                    // Nếu gene mới hợp lệ và chưa thăm
                    if bank_set.contains(&new_gene) && !visited.contains(&new_gene) {
                        visited.insert(new_gene.clone());
                        queue.push_back((new_gene, steps + 1));
                    }
                }
            }
            gene_chars[i] = original_char; // Khôi phục ký tự gốc
        }
    }
    
    -1 // Không tìm thấy đường đi
}

// Test cases
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example_1() {
        let startGene = "AACCGGTT".to_string();
        let endGene = "AACCGGTA".to_string();
        let bank = vec!["AACCGGTA".to_string()];
        assert_eq!(min_mutation(startGene, endGene, bank), 1);
    }

    #[test]
    fn test_example_2() {
        let startGene = "AACCGGTT".to_string();
        let endGene = "AAACGGTA".to_string();
        let bank = vec!["AACCGGTA".to_string(), "AACCGCTA".to_string(), "AAACGGTA".to_string()];
        assert_eq!(min_mutation(startGene, endGene, bank), 2);
    }

    #[test]
    fn test_no_valid_mutation() {
        let startGene = "AACCGGTT".to_string();
        let endGene = "AAACGGTA".to_string();
        let bank = vec!["AACCGGTA".to_string(), "AACCGCTA".to_string()];
        assert_eq!(min_mutation(startGene, endGene, bank), -1);
    }
}