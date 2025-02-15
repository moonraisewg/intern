// You are given an absolute path for a Unix-style file system, which always begins with a slash '/'. Your task is to transform this absolute path into its simplified canonical path.

// The rules of a Unix-style file system are as follows:

// A single period '.' represents the current directory.
// A double period '..' represents the previous/parent directory.
// Multiple consecutive slashes such as '//' and '///' are treated as a single slash '/'.
// Any sequence of periods that does not match the rules above should be treated as a valid directory or file name. For example, '...' and '....' are valid directory or file names.
// The simplified canonical path should follow these rules:

// The path must start with a single slash '/'.
// Directories within the path must be separated by exactly one slash '/'.
// The path must not end with a slash '/', unless it is the root directory.
// The path must not have any single or double periods ('.' and '..') used to denote current or parent directories.
// Return the simplified canonical path.

 

// Example 1:

// Input: path = "/home/"

// Output: "/home"

// Explanation:

// The trailing slash should be removed.

// Example 2:

// Input: path = "/home//foo/"

// Output: "/home/foo"

// Explanation:

// Multiple consecutive slashes are replaced by a single one.

// Example 3:

// Input: path = "/home/user/Documents/../Pictures"

// Output: "/home/user/Pictures"

// Explanation:

// A double period ".." refers to the directory up a level (the parent directory).

// Example 4:

// Input: path = "/../"

// Output: "/"

// Explanation:

// Going one level up from the root directory is not possible.

// Example 5:

// Input: path = "/.../a/../b/c/../d/./"

// Output: "/.../b/d"

// Explanation:

// "..." is a valid name for a directory in this problem.

use std::fmt::format;



pub fn simplify_path(path: String) -> String {
    // tạo stack lưu trữ các phần của đường dẫn 
    let mut stack: Vec<&str> = Vec::new();

    // chia duong dan thanh cac phaanf dua tren dau /
    for part in path.split('/') {
        match part {
            // neu phan la "..",  thi quay lai thu muc cha 
            // neu stack khong rong, pop phan tu cuoi cung ra khoi stack

            ".." => {
                if !stack.is_empty(){
                    stack.pop();
                }
            }, // neu pan tu la dau "." hoac chuoi rong, ta bo qua no 
            "." | "" => {},
            // neu phan la ten thu muc hop le, push vao stack 
            _ => stack.push(part),

        }
    }

    // tao duong dan chuan hoa tu cac phan trong stack 
    let result = format!("/{}", stack.join("/"));

    // return ve duong dan chuan hoa 
    result
} 

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_example_1 () {
        assert_eq!(simplify_path("/home".to_string()),"/home")
    }
    #[test]
    fn test_example_2() {
        assert_eq!(simplify_path("/home//foo/".to_string()), "/home/foo");
    }

    #[test]
    fn test_example_3() {
        assert_eq!(simplify_path("/home/user/Documents/../Pictures".to_string()), "/home/user/Pictures");
    }

    #[test]
    fn test_example_4() {
        assert_eq!(simplify_path("/../".to_string()), "/");
    }

    #[test]
    fn test_example_5() {
        assert_eq!(simplify_path("/.../a/../b/c/../d/./".to_string()), "/.../b/d");
    }


}