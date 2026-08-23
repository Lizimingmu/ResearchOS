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
  if (!path) return <div className="pdf-empty"><FileWarning size={28} /><h3>No PDF attached</h3><p>The metadata record is usable for training. Import a lawfully obtained PDF to enable page navigation and text selection.</p></div>;

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}><ChevronLeft size={14} /></button>
        <label>Page <input value={currentPage} aria-label="PDF page" onChange={(event) => onPageChange(Math.min(pages || 9999, Math.max(1, Number(event.target.value) || 1)))} /> / {pages || "—"}</label>
        <button onClick={() => onPageChange(Math.min(pages, currentPage + 1))} disabled={!pages || currentPage >= pages}><ChevronRight size={14} /></button>
        <span className="toolbar-divider" />
        <button onClick={() => { setFit(false); setScale((value) => Math.max(.6, value - .1)); }}><Minus size={14} /></button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => { setFit(false); setScale((value) => Math.min(2.2, value + .1)); }}><Plus size={14} /></button>
        <button className={fit ? "active" : ""} onClick={() => { setFit(true); setScale(1.05); }}><ScanLine size={14} /> Fit width</button>
      </div>
      <div className="pdf-canvas-scroll">
        {error ? <div className="pdf-empty danger"><FileWarning size={28} /><h3>PDF could not be opened</h3><p>{error}</p><button onClick={() => setError(undefined)}>Retry</button></div> : (
          <Document file={url} onLoadSuccess={({ numPages }) => { setPages(numPages); if (currentPage > numPages) onPageChange(numPages); }} onLoadError={(cause) => setError(cause.message || "The file may have moved or be inaccessible.")} loading={<div className="pdf-loading">Loading PDF…</div>}>
            <Page pageNumber={currentPage} scale={scale} renderTextLayer renderAnnotationLayer />
          </Document>
        )}
      </div>
    </div>
  );
}
