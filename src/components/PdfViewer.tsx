import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, FileWarning, Minus, Plus, ScanLine } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { isTauri } from "../services/desktop";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("./assets/pdf.worker.min.mjs", window.location.href).toString();

interface PdfViewerProps {
  path?: string;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function PdfViewer({ path, currentPage, onPageChange }: PdfViewerProps) {
  const [pages, setPages] = useState(0);
  const [scale, setScale] = useState(1.05);
  const [fit, setFit] = useState(true);
  const [error, setError] = useState<string>();
  const url = useMemo(() => {
    if (!path) return undefined;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    return isTauri() ? convertFileSrc(path) : path;
  }, [path]);

  useEffect(() => { setError(undefined); }, [path]);
  if (!path) return <div className="pdf-empty"><FileWarning size={28} /><h3>尚未关联 PDF</h3><p>当前元数据记录仍可用于训练。导入合法获取的 PDF 后，即可浏览页面并选择文本。</p></div>;

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}><ChevronLeft size={14} /></button>
        <label>第 <input value={currentPage} aria-label="PDF 页码" onChange={(event) => onPageChange(Math.min(pages || 9999, Math.max(1, Number(event.target.value) || 1)))} /> / {pages || "—"} 页</label>
        <button onClick={() => onPageChange(Math.min(pages, currentPage + 1))} disabled={!pages || currentPage >= pages}><ChevronRight size={14} /></button>
        <span className="toolbar-divider" />
        <button onClick={() => { setFit(false); setScale((value) => Math.max(.6, value - .1)); }}><Minus size={14} /></button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => { setFit(false); setScale((value) => Math.min(2.2, value + .1)); }}><Plus size={14} /></button>
        <button className={fit ? "active" : ""} onClick={() => { setFit(true); setScale(1.05); }}><ScanLine size={14} /> 适合宽度</button>
      </div>
      <div className="pdf-canvas-scroll">
        {error ? <div className="pdf-empty danger"><FileWarning size={28} /><h3>无法打开 PDF</h3><p>文件可能已移动、损坏或当前无法访问。</p><details><summary>查看技术详情</summary><pre>{error}</pre></details><button onClick={() => setError(undefined)}>重试</button></div> : (
          <Document file={url} onLoadSuccess={({ numPages }) => { setPages(numPages); if (currentPage > numPages) onPageChange(numPages); }} onLoadError={(cause) => setError(cause.message || "文件可能已移动或当前无法访问。")} loading={<div className="pdf-loading">正在加载 PDF…</div>}>
            <Page pageNumber={currentPage} scale={scale} renderTextLayer renderAnnotationLayer />
          </Document>
        )}
      </div>
    </div>
  );
}
