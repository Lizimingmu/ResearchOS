# OpenCode M015 Master Prompt

_Re-run this same prompt after interruption; the checkpoint determines where to resume._

---

~~~text
在 ResearchOS 项目根目录执行或恢复 M015。

必须先完整读取：
1. AGENTS.md
2. .agent/TESTING_POLICY.md
3. .agent/PRODUCT_CONSTITUTION.md
4. .agent/SCIENTIFIC_GATES.md
5. .agent/M015_PERSONAL_CONTENT_STUDIO_PLAN.md
6. .agent/M015_EXECUTION_RUNBOOK.md
7. .agent/M015_RUN_STATE.json

使用当前 OpenCode 默认配置模型。每次进程只执行或恢复一个分段：严格按 M015_RUN_STATE.json 选择第一个未完成段，完成该段后退出，由外部看门狗启动下一次进程。每段开始前写 in_progress 并增加 attempts；通过验收、报告和本地 Git checkpoint 后才能写 completed。若进程中断，检查当前段报告、diff 和断点后续做，禁止盲目重做。任何失败必须写明命令、错误和剩余工作；可恢复错误留在当前段供看门狗有限重试，不可恢复或安全相关错误标为 failed / stopped_on_failure 并退出。禁止跳段、削弱门禁或伪报 PASS。

全程仅后台运行。禁止启动 ResearchOS、Tauri、安装器、Obsidian或浏览器窗口，禁止操作鼠标键盘、焦点、DPI、显示器、剪贴板或用户进程。禁止发现、读取或写入真实 Obsidian Vault；所有 Obsidian 测试只能使用 run state 指定的项目内 `.tmp/m015-fake-vault` 路径。Git 仅允许执行 runbook 的本地分段 checkpoint 协议；禁止 push/fetch/pull/reset/clean/rebase/merge/amend，禁止打包、M012、真实科研内容生成或状态提升、166 张隔离卡修改、生产数据、凭据或个人文件访问。

不要要求睡眠中的用户确认。遇到需要前台、真实 Vault、网络凭据、科学判断或架构歧义的情况，安全记录 checkpoint 后停止。本次只处理一个分段；完成后输出简短结果并退出。S7 全部可用后台门禁通过后，将 runStatus 写为 awaiting_codex_review，更新 IMPLEMENTATION_REPORT 和必要 changeset，然后停止等待 Codex。
~~~
