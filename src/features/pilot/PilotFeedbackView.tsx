import { ArrowLeft, Download, RotateCcw, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../state/store";

export function PilotFeedbackView({ onBack }: { onBack?: () => void }) {
  const pilotSessionId = useAppStore((state) => state.pilotSessionId);
  const rawFeedback = useAppStore((state) => state.pilotFeedback);
  const pilotFeedback = rawFeedback ?? [];
  const resetPilotSession = useAppStore((state) => state.resetPilotSession);
  const setView = useAppStore((state) => state.setView);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleExport = () => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `ResearchOS_Pilot_Feedback_${todayStr}.json`;
    const payload = {
      exportVersion: 1,
      exportTimestamp: new Date().toISOString(),
      pilotSessionId,
      totalFeedbackCount: pilotFeedback.length,
      feedbackRecords: pilotFeedback,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmReset = () => {
    resetPilotSession();
    setConfirmResetOpen(false);
  };

  const countByDifficulty = {
    too_easy: pilotFeedback.filter((f) => f.difficulty === "too_easy").length,
    just_right: pilotFeedback.filter((f) => f.difficulty === "just_right").length,
    too_hard: pilotFeedback.filter((f) => f.difficulty === "too_hard").length,
  };

  return (
    <div className="page pilot-feedback-page">
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="subtle" onClick={onBack ?? (() => setView("today"))} title="返回 Today">
            <ArrowLeft size={16} /> 返回
          </button>
          <div>
            <span className="eyebrow">PILOT SUMMARY · 试用反馈与记录</span>
            <h1>试用反馈与数据导出</h1>
            <p>本地离线记录本次 Pilot Session 的所有真实评价，可一键导出为 JSON 格式。</p>
          </div>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "10px" }}>
          <button className="primary" onClick={handleExport} disabled={pilotFeedback.length === 0}>
            <Download size={14} /> 导出 Pilot Feedback ({pilotFeedback.length})
          </button>
          <button className="subtle" style={{ color: "var(--color-danger, #e53e3e)" }} onClick={() => setConfirmResetOpen(true)}>
            <RotateCcw size={14} /> 开始新的 Pilot Session
          </button>
        </div>
      </header>

      <div className="pilot-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Session ID</span>
          <span className="stat-val" style={{ fontSize: "14px", fontFamily: "monospace" }}>{pilotSessionId}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">已提交反馈</span>
          <span className="stat-val">{pilotFeedback.length} 节</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">难度评价分布</span>
          <span className="stat-val" style={{ fontSize: "14px" }}>
            太简单: {countByDifficulty.too_easy} · 合适: {countByDifficulty.just_right} · 太难: {countByDifficulty.too_hard}
          </span>
        </div>
      </div>

      <main className="pilot-feedback-list">
        {pilotFeedback.length === 0 ? (
          <div className="empty-state" style={{ margin: "40px auto", textAlign: "center" }}>
            <MessageSquare size={32} style={{ opacity: 0.4, marginBottom: "12px" }} />
            <h2>暂无反馈记录</h2>
            <p>完成任意一节 Lesson 后，在此处即可查看和导出你的体验评价。</p>
            <button className="primary" onClick={onBack ?? (() => setView("today"))}>
              前往 Today 开始学习
            </button>
          </div>
        ) : (
          <div className="feedback-cards-container">
            {pilotFeedback.map((item, idx) => (
              <article key={item.id || idx} className="pilot-record-card">
                <header className="record-header">
                  <div>
                    <strong>{item.lessonId}</strong>
                    <span className="record-time">{new Date(item.timestamp).toLocaleString("zh-CN")}</span>
                  </div>
                  <span className={`difficulty-badge ${item.difficulty}`}>
                    {item.difficulty === "too_easy" ? "太简单" : item.difficulty === "just_right" ? "合适" : "太难"}
                  </span>
                </header>

                {item.issueTags && item.issueTags.length > 0 && (
                  <div className="record-tags">
                    {item.issueTags.map((t) => (
                      <span key={t} className="record-tag-chip">{t}</span>
                    ))}
                  </div>
                )}

                {item.freeText ? (
                  <p className="record-freetext">“{item.freeText}”</p>
                ) : (
                  <p className="record-freetext empty">（未填写补充说明）</p>
                )}
              </article>
            ))}
          </div>
        )}
      </main>

      {confirmResetOpen && (
        <div className="pilot-modal-overlay" role="dialog" aria-modal="true">
          <div className="pilot-modal-card" style={{ maxWidth: "460px" }}>
            <header className="pilot-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning, #d69e2e)" }}>
                <AlertTriangle size={20} />
                <h2>确认开始新的 Pilot Session？</h2>
              </div>
            </header>
            <div className="pilot-modal-body">
              <p>这将会清空当前的试用进度和本次记录的反馈信息，以便开始一轮全新的试用流程。</p>
              <p style={{ marginTop: "8px", fontSize: "13px", color: "var(--color-muted, #718096)" }}>
                <strong>安全保证：</strong>此操作仅重置 Pilot-specific 临时状态，<strong>绝不会</strong>删除任何论文、项目、文献卡片或知识库版本数据。
              </p>
            </div>
            <footer className="pilot-modal-actions">
              <button className="subtle" onClick={() => setConfirmResetOpen(false)}>取消</button>
              <button className="primary" style={{ backgroundColor: "var(--color-danger, #e53e3e)" }} onClick={handleConfirmReset}>
                确认重置并开启新 Session
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
