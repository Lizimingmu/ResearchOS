import { CheckCircle2, MessageSquare, Send, X } from "lucide-react";
import { useState } from "react";
import { PILOT_FEEDBACK_ISSUE_TAGS, type PilotFeedbackRecord } from "../../data/pilot/pilotManifest";
import { useAppStore } from "../../state/store";

interface PilotFeedbackModalProps {
  isOpen: boolean;
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function PilotFeedbackModal({
  isOpen,
  lessonId,
  lessonTitle,
  onClose,
  onSubmitted,
}: PilotFeedbackModalProps) {
  const recordFeedback = useAppStore((state) => state.recordPilotFeedback);
  const setView = useAppStore((state) => state.setView);
  
  const [difficulty, setDifficulty] = useState<PilotFeedbackRecord["difficulty"]>("just_right");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    recordFeedback({
      lessonId,
      difficulty,
      issueTags: selectedTags,
      freeText: freeText.trim(),
      lessonCompleted: true,
    });
    if (onSubmitted) onSubmitted();
    else {
      onClose();
      setView("today");
    }
  };

  const handleSkip = () => {
    onClose();
    setView("today");
  };

  return (
    <div className="pilot-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="pilot-feedback-title">
      <div className="pilot-modal-card">
        <header className="pilot-modal-header">
          <div>
            <span className="pilot-modal-eyebrow">PILOT FEEDBACK · 试用体验反馈</span>
            <h2 id="pilot-feedback-title">{lessonTitle}</h2>
          </div>
          <button className="pilot-close-btn" onClick={onClose} aria-label="关闭">
            <X size={16} />
          </button>
        </header>

        <div className="pilot-modal-body">
          <section className="pilot-feedback-section">
            <label className="pilot-question-label">1. 这节内容对你来说：</label>
            <div className="pilot-choice-pills">
              {(
                [
                  ["too_easy", "太简单"],
                  ["just_right", "合适"],
                  ["too_hard", "太难"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`pilot-pill ${difficulty === val ? "active" : ""}`}
                  onClick={() => setDifficulty(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="pilot-feedback-section">
            <label className="pilot-question-label">2. 哪个地方最有问题？（可多选）</label>
            <div className="pilot-tag-grid">
              {PILOT_FEEDBACK_ISSUE_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`pilot-tag-chip ${selected ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pilot-feedback-section">
            <label className="pilot-question-label" htmlFor="pilot-freetext">
              3. 还有什么让我觉得难用？（可选）
            </label>
            <textarea
              id="pilot-freetext"
              rows={3}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="例如：哪个解释没看懂、题目哪个选项有歧义、哪一步操作不顺畅…"
            />
          </section>
        </div>

        <footer className="pilot-modal-actions">
          <button type="button" className="subtle" onClick={handleSkip}>
            跳过反馈，返回 Today
          </button>
          <button type="button" className="primary" onClick={handleSubmit}>
            <Send size={14} /> 提交反馈并返回 Today
          </button>
        </footer>
      </div>
    </div>
  );
}
