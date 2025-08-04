<h1 align="center">Moonraise Lab</h1>

## Moonraise Git flow

Đây là quy trình làm việc với git cho đội ngũ nhân viên của Moonraise. Nó có thể được thay đổi để phù hợp với từng dự án.

### Changelog

04-08-2025: Fist release.

### Use Case

- Đã tạo Repository trên Bitbucket（hoặc Github, Gitlab ....）.
- Branch mặc định của Repository thường là master.
- Đã thiết lập quyền cho người có quyền merge.
- Developer đã có quyền truy cập, tạo nhánh mới, push code, tạo pull request đối với Repository.
- Branch master, develop phải được bảo vệ bằng chức năng protected branchs (cấu hình để không push trực tiếp từ local lên các branch này).

### Các nhánh chính

Repo trung tâm sẽ có hai nhánh chính luôn ở trạng thái code mới, chính xác nhất và ổn định nhất:

- `master`
- `develop`

Khi source code trong nhánh develop đã ổn định và sẵn sàng để được release, tất cả các thay đổi sẽ được hợp nhất(merged) trở lại vào `master` và sẽ được gắn liền với một số hiệu phiên bản.

### Quy trình git

- `một tính năng sẽ tương ứng với 1 branch (nhánh), có thể có nhiều commit trong 1 branch.`
- `ví dụ bạn được giao tính năng làm api get list user.`

1. Dev hãy checkout sang develop và đồng bộ code local với code remote:
   ```sh
   $ git checkout develop # <--- Kiểm tra xem đang ở nhánh develop hay chưa $git branch
   ```
   ```sh
   $ git pull origin develop
   ```
2. Tạo nhánh (branch) tương ứng với task đã nhận theo công thức sau:
   ```sh
   $ git checkout -b feat/get-users # <--- tên nhánh sẽ theo công thức feat/{name}
   ```
3. Bắt đầu code, sau khi code xong:
   - xóa console.log
   - check lint, nếu có lỗi lint thì fix
   - sau khi kiểm tra xong 2 điều kiện trên thì
   ```sh
   $ git add .
   $ git commit -m "feat: done get list user" # <--- nội dung comment sẽ là {feat/{name} abc...}
   ```
4. Push code lên remote.
   ```sh
   $ git push origin feat/get-users
   ```
5. Sau khi push thành công thì lên web `bitbucket | gitlab | github` để tạo pull request.

   - Tạo pull request là hành động yêu cầu hợp nhất nhánh này vào nhánh khác.
   - Cụ thể là trong dự án thì khi tạo pull request sẽ là tạo từ hợp nhất từ nhánh feat/get-users vào nhánh develop.
   - from feat/get-users to develop.

     5.1 Trường hợp khi taọ pull-request nhưng bị báo conflict (nghĩa là nhánh của bạn đang làm bị xung đột với nhánh chính).

   ```sh
   $ git checkout develop
   ```

   ```sh
   $ git pull origin develop
   ```

   ```sh
   $ git checkout feat/get-users
   ```

   ```sh
   $ git merge develop
   ```

   - Sau khi hợp nhất nhánh develop vào nhánh của mình thì coder sẽ phải đi sửa những file bị conflict
   - Sau khi sửa xong tất cả các file bị conflict thì:

   ```sh
   $ git add .
   ```

   ```sh
   $ git commit -m "fix(conlict): get-users fix conflict"
   ```

   ```sh
   $ git push origin feat/get-users
   ```

6. Sau khi tạo xong thì gửi link URL của pull-request cho reviewer (người review code) trên Trello hoặc Backlog (công cụ quản lý task) để tiến hành review code.

   6.1. Trong trường hợp reviewer có yêu cầu chỉnh sửa, hãy thực hiện lại bước 3 và bước 4. Sau khi thực hiện xong thì báo lại reviewer

7. Nếu người reviewer đồng ý với pull-request thì pull-request đấy sẽ được reviewer merge. (Hoàn thành task)

### Nguyên tắc

- Mỗi pull-request tương ứng với một task.
- Mỗi một pull-request sẽ không hạn chế số lượng commit
- Đối với branch, hãy đặt branch name theo định dạng `[Task type]/[Task Id or]` (Ví dụ: `feat/1234`, `bug/4567`,...) nếu không có task id (issue id) thì dùng name summary cho task (ví dụ `feat/get-users`)
- Đối với commit message, trong trường hợp pull-request đó chỉ có 1 commit thì có thể đặt commit message tương tự như trên là `[Task type]/[Task Id] [Task description]`
- Pull-request title phải đặt sao cho tương ứng với title của task trên Trello hoặc Bitbucket.
- Ở phần description thêm link tài liệu của task.
- Tại môi trường local(nghĩa là trên máy tính của mình), nghiêm cấm tuyệt đối không được thay đổi code khi ở branch master và develop. Chỉ được pull code từ remote về 2 nhánh đó.

### Một số gợi ý giúp triển khai tốt hơn

1. Cách đặt tên nhánh

- Đối với task
  - `feat/{name_task}`hoặc `feature/{name_task}`
- Đối với bug trong quá trình phát triển (nghĩa là ở môi trường dev hoặc stagging)
  - `fix/{name_task}` hoặc `bugfix/{name_task}`
- Đối với bug trên production (nghĩa là trên mội trường đã phát hành sản phẩm đến tay người dùng)
  - `hotfix/{name_task}`
