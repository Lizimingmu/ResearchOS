# ResearchOS M019.1c Fresh External Strict-Blind Review

你是一个全新的独立 reviewer。

## 唯一允许读取

1. 本文件：

`D:\Agents\ResearchOS\M019_1C_FRESH_EXTERNAL_BLIND_REVIEW_PROMPT.md`

2. 匿名题包：

`D:\Agents\ResearchOS\artifacts\m019-1-strict-blind-assessment-packet.json`

除此之外，不得读取 ResearchOS 的任何文件、目录、Git 历史、报告、源码或答案。

禁止使用 web search。

## 任务

只根据匿名 packet 中每题的：

* scenario
* stimulus
* options
* maximumSelections

独立完成 A001–A183。

每题记录：

### CLEAR

`A001 | O1,O3 | CLEAR`

不写理由。

### AMBIGUOUS

`A001 | O1,O3 | AMBIGUOUS | <不超过30字的歧义原因>`

只有当题面本身无法确定唯一或明确答案集合时才判 AMBIGUOUS。

不得根据选项位置、前面题目规律、课程主题或作者意图猜答案。

## 完成后冻结

创建：

`D:\Agents\ResearchOS\reviews\M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json`

至少包含：

* schemaVersion
* reviewMode = `FRESH_EXTERNAL_STRICT_BLIND`
* packetHash
* stagedAssessmentSnapshotHash
* itemCount = 183
* 183 条 records
* clear / ambiguous counts
* externalReviewHash

要求：

* A001–A183 恰好一次
* option ID 必须来自该题
* 不超过 maximumSelections
* CLEAR 的 noteCn 为空
* AMBIGUOUS 才写一句极短原因
* externalReviewHash 使用确定性序列化 + SHA-256

写完 frozen JSON 后立即停止。

禁止：

* 查看作者 key
* 查看源码
* 查看 validation report
* 查看过去 blind review
* 揭盲比较
* 修改 assessment
* 判断项目 PASS/FAIL
* 继续开发

最终只报告：

* 183/183 是否完成
* CLEAR 数
* AMBIGUOUS 数
* frozen JSON 路径
* externalReviewHash
