import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { FilePlus2, Filter, Search, ShieldCheck, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Paper } from "../../domain/types";
import { makeId } from "../../lib/ids";
import { isTauri, verifyEvidence } from "../../services/desktop";
import { useAppStore } from "../../state/store";

function titleFromPath(path: string): string {
  return path.split(/[\\/]/).pop()?.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ") || "Untitled paper";
}

export function paperFromPath(path: string, now = new Date()): Paper {
  return {
    id: makeId("paper"), title: titleFromPath(path), pdfPath: path, tags: [], researchType: "Unclassified", topic: "", readStatus: "unread", trainingStatus: "active", favorite: false, notes: "", currentPage: 1,
    createdAt: now.toISOString(), contentOrigin: "user", verificationStatus: "pending",
  };
}

export function LibraryView() {
  const papers = useAppStore((state) => state.papers);
  const selectedId = useAppStore((state) => state.selectedPaperId);
  const addPaper = useAppStore((state) => state.addPaper);
  const updatePaper = useAppStore((state) => state.updatePaper);
  const selectPaper = useAppStore((state) => state.selectPaper);
  const notify = useAppStore((state) => state.notify);
  const globalSearch = useAppStore((state) => state.globalSearch);
  const [year, setYear] = useState("all");
  const [type, setType] = useState("all");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = papers.find((paper) => paper.id === selectedId) ?? papers[0];

  const filtered = useMemo(() => papers.filter((paper) => {
    const matchText = `${paper.title} ${paper.journal} ${paper.tags.join(" ")} ${paper.topic}`.toLowerCase().includes(globalSearch.toLowerCase());
    return matchText && (year === "all" || paper.year === Number(year)) && (type === "all" || paper.researchType === type) && (!favoriteOnly || paper.favorite);
  }).sort((a, b) => (b.year ?? 0) - (a.year ?? 0)), [papers, globalSearch, year, type, favoriteOnly]);

  const addPath = (path: string) => {
    addPaper(paperFromPath(path));
    notify("PDF added. Complete or verify metadata in the inspector.", "success");
  };

  const importPdf = async () => {
    if (!isTauri()) { fileRef.current?.click(); return; }
    try {
      const result = await openDialog({ multiple: false, directory: false, filters: [{ name: "PDF documents", extensions: ["pdf"] }] });
      if (typeof result === "string") addPath(result);
    } catch (error) { notify(`PDF import failed: ${String(error)}`, "error"); }
  };

  useEffect(() => {
    const requestImport = () => { void importPdf(); };
    window.addEventListener("researchos:import-pdf", requestImport);
    return () => window.removeEventListener("researchos:import-pdf", requestImport);
  });

  const verify = async (kind: "pmid" | "doi") => {
    if (!selected) return;
    const identifier = kind === "pmid" ? selected.pmid : selected.doi;
    if (!identifier) { notify(`Enter a ${kind.toUpperCase()} first.`, "warning"); return; }
    setVerifying(true);
    try {
      const result = await verifyEvidence(kind, identifier);
      updatePaper(selected.id, { title: result.title || selected.title, journal: result.journal || selected.journal, doi: result.doi || selected.doi, verificationStatus: "verified", contentOrigin: "verified_external" });
      notify(`${kind.toUpperCase()} verified through ${result.source}.`, "success");
    } catch (error) {
      updatePaper(selected.id, { verificationStatus: "pending" });
      notify(`Verification unavailable; metadata remains pending. ${String(error)}`, "warning");
    } finally { setVerifying(false); }
  };

  return (
    <div className="library-layout">
      <section className="library-main">
        <header className="page-header compact"><div><span className="eyebrow">PAPER LIBRARY</span><h1>Local paper records</h1><p>Public metadata is bundled; PDFs remain at their original local paths.</p></div><button className="primary" onClick={importPdf}><FilePlus2 size={15} /> Import PDF <kbd>Ctrl O</kbd></button></header>
        <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) addPath(URL.createObjectURL(file)); }} />
        <div className="filter-bar"><Filter size={14} /><select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">All years</option>{[...new Set(papers.map((paper) => paper.year).filter(Boolean))].map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All research types</option>{[...new Set(papers.map((paper) => paper.researchType))].map((value) => <option key={value}>{value}</option>)}</select><button className={favoriteOnly ? "active" : ""} onClick={() => setFavoriteOnly((value) => !value)}><Star size={13} /> Favorites</button><span>{filtered.length} records</span></div>
        <div className="paper-table" role="table">
          <div className="paper-table-head" role="row"><span>Title</span><span>Source</span><span>Type</span><span>Status</span></div>
          {filtered.map((paper) => <button key={paper.id} className={`paper-row ${paper.id === selected?.id ? "selected" : ""}`} onClick={() => useAppStore.setState({ selectedPaperId: paper.id })} onDoubleClick={() => selectPaper(paper.id)} role="row"><span className="paper-title-cell">{paper.favorite && <Star size={12} fill="currentColor" />}<span><strong>{paper.title}</strong><small>{paper.tags.join(" · ") || "No tags"}</small></span></span><span>{paper.journal || "Metadata pending"}<small>{paper.year || "—"}</small></span><span>{paper.researchType}</span><span><i className={`status-pill ${paper.verificationStatus}`}>{paper.verificationStatus}</i><small>{paper.pdfPath ? "PDF attached" : "Metadata only"}</small></span></button>)}
          {filtered.length === 0 && <div className="empty-inline"><Search size={18} /> No papers match the current filters.</div>}
        </div>
      </section>
      <aside className="inspector-pane">
        {selected ? <>
          <div className="pane-heading"><span className="eyebrow">PAPER INSPECTOR</span><button onClick={() => selectPaper(selected.id)}>Open Lab</button></div>
          <label>Title<textarea rows={3} value={selected.title} onChange={(event) => updatePaper(selected.id, { title: event.target.value })} /></label>
          <div className="form-grid two"><label>Journal<input value={selected.journal ?? ""} onChange={(event) => updatePaper(selected.id, { journal: event.target.value })} /></label><label>Year<input type="number" value={selected.year ?? ""} onChange={(event) => updatePaper(selected.id, { year: Number(event.target.value) || undefined })} /></label></div>
          <label>DOI<div className="input-action"><input value={selected.doi ?? ""} onChange={(event) => updatePaper(selected.id, { doi: event.target.value, verificationStatus: "pending" })} /><button disabled={verifying} onClick={() => void verify("doi")}><ShieldCheck size={13} /> Verify</button></div></label>
          <label>PMID<div className="input-action"><input value={selected.pmid ?? ""} onChange={(event) => updatePaper(selected.id, { pmid: event.target.value, verificationStatus: "pending" })} /><button disabled={verifying} onClick={() => void verify("pmid")}><ShieldCheck size={13} /> Verify</button></div></label>
          <label>Research type<input value={selected.researchType} onChange={(event) => updatePaper(selected.id, { researchType: event.target.value })} /></label>
          <label>Topic<input value={selected.topic} onChange={(event) => updatePaper(selected.id, { topic: event.target.value })} /></label>
          <label>Tags<input value={selected.tags.join(", ")} onChange={(event) => updatePaper(selected.id, { tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label>
          <label>Notes<textarea rows={6} value={selected.notes} onChange={(event) => updatePaper(selected.id, { notes: event.target.value })} /></label>
          <div className="inspector-flags"><button className={selected.favorite ? "active" : ""} onClick={() => updatePaper(selected.id, { favorite: !selected.favorite })}><Star size={13} /> Favorite</button><span>{selected.contentOrigin}</span><span>{selected.verificationStatus}</span></div>
        </> : <div className="empty-inline">Select a paper.</div>}
      </aside>
    </div>
  );
}
