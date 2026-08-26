# Review Result

ACCEPT

M016-01 至 M016-05 的后台发布候选门禁通过。

- v0.12.0 九处产品版本声明一致；状态 schema 4、SQLite `user_version` 2 未改变。
- M015 Personal Content Studio、版本化 overlay、patch/history/rollback 与显式有限 Obsidian 批次被纳入候选版；未修改或提升科研内容，166 张外部卡继续隔离。
- Codex 独立复验：前端 89/89、M015 审计 31/31、handoff validator PASS；OpenCode Rust 27/27。Codex 的离线 Rust 复跑因本地缓存缺少 `urlencoding` 而未进入编译，未进行联网重试。
- 两份 v0.12.0 工件的实际字节数与 SHA256 均匹配元数据及 `SHA256SUMS.txt`；所有旧版 exe/installer 的实际 SHA256 也与原清单一致。
- 候选源码实现提交为 `e2c10c2`，验收标签为 `v0.12.0-rc1`。
- 本结论只接受后台 release candidate。打包应用前台、安装器行为、真实 Vault 与用户手工检查仍为 `NOT RUN`，不得描述为已验证。
