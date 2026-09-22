import { useAppStore } from "../state/store";

export function KnowledgeMaintenanceNotice() {
  const setView = useAppStore((state) => state.setView);
  return <section className="learning-wait" role="status"><h2>此内容正在等待知识更新审核</h2><p>相关知识或证据已发生变更，新的学习、练习和能力计分暂时停止。已有学习记录保留原知识版本。</p><button onClick={() => setView("content-studio")}>打开内容工作台查看知识维护</button></section>;
}
