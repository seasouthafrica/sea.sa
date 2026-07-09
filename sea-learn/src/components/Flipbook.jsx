import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ZOOM_STEPS = [0.75, 0.9, 1, 1.15, 1.3, 1.5];
const THUMBNAIL_RANGE = 2;

export default function Flipbook({ fileUrl, storageKey, title }) {
  const containerRef = useRef(null);
  const touchStartRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === 'undefined' ? 860 : window.innerWidth
  );
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTurning, setIsTurning] = useState(false);
  const [loadError, setLoadError] = useState('');

  const zoom = ZOOM_STEPS[zoomIndex];
  const pageWidth = useMemo(
    () => Math.round(Math.max(240, Math.min(860, viewportWidth - 48)) * zoom),
    [viewportWidth, zoom]
  );
  const thumbnailPages = useMemo(() => {
    if (!numPages) return [];
    const pages = new Set([1, numPages]);
    const start = Math.max(1, pageNumber - THUMBNAIL_RANGE);
    const end = Math.min(numPages, pageNumber + THUMBNAIL_RANGE);
    for (let page = start; page <= end; page += 1) pages.add(page);
    return Array.from(pages).sort((a, b) => a - b);
  }, [numPages, pageNumber]);

  useEffect(() => {
    const savedPage = Number(localStorage.getItem(storageKey));
    if (savedPage > 0) setPageNumber(savedPage);
  }, [storageKey]);

  useEffect(() => {
    if (numPages) localStorage.setItem(storageKey, String(Math.min(pageNumber, numPages)));
  }, [numPages, pageNumber, storageKey]);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setViewportWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (!fileUrl) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">Presentation ready for upload URL</h3>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Add the uploaded presentation PDF URL to <code>VITE_UPLIFT_WEEK1_PRESENTATION_URL</code>.
          This flipbook will render it here with page navigation, zoom, thumbnails, fullscreen,
          swipe support, and resume-from-last-page.
        </p>
      </section>
    );
  }

  const goToPage = (nextPage) => {
    if (!numPages) return;
    const boundedPage = Math.min(Math.max(nextPage, 1), numPages);
    if (boundedPage === pageNumber) return;
    setIsTurning(true);
    window.setTimeout(() => {
      setPageNumber(boundedPage);
      setIsTurning(false);
    }, 120);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  };

  const onTouchStart = (event) => {
    touchStartRef.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartRef.current == null) return;
    const delta = event.changedTouches[0].clientX - touchStartRef.current;
    if (Math.abs(delta) > 48) goToPage(delta < 0 ? pageNumber + 1 : pageNumber - 1);
    touchStartRef.current = null;
  };

  return (
    <section
      ref={containerRef}
      className="rounded-3xl bg-white p-4 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200 sm:p-6"
      aria-label={`${title} interactive presentation flipbook`}
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sea-teal">Interactive presentation</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-950">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setZoomIndex((i) => Math.max(i - 1, 0))} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sea-teal hover:text-sea-teal">
            Zoom out
          </button>
          <span className="min-w-16 text-center text-sm font-semibold text-slate-500">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoomIndex((i) => Math.min(i + 1, ZOOM_STEPS.length - 1))} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sea-teal hover:text-sea-teal">
            Zoom in
          </button>
          <button type="button" onClick={toggleFullscreen} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sea-teal">
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>

      <Document
        file={fileUrl}
        loading={<div className="rounded-2xl bg-slate-50 p-10 text-center text-slate-500">Loading presentation...</div>}
        error={<div className="rounded-2xl bg-red-50 p-6 text-red-700">{loadError || 'Unable to load the presentation.'}</div>}
        onLoadError={(error) => setLoadError(error.message)}
        onLoadSuccess={({ numPages: loadedPages }) => {
          setNumPages(loadedPages);
          setPageNumber((current) => Math.min(current, loadedPages));
        }}
      >
        <div className="grid gap-5 xl:grid-cols-[132px_1fr]">
          <nav className="order-2 flex gap-3 overflow-x-auto rounded-2xl bg-slate-50 p-3 xl:order-1 xl:max-h-[720px] xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden" aria-label="Presentation thumbnails">
            {thumbnailPages.map((thumbPage, index) => {
              const previousPage = thumbnailPages[index - 1];
              const hasGap = previousPage && thumbPage - previousPage > 1;
              return (
                <div key={thumbPage} className="flex shrink-0 items-center gap-3 xl:flex-col">
                  {hasGap && (
                    <span className="px-2 text-xs font-bold text-slate-400" aria-hidden="true">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => goToPage(thumbPage)}
                    className={`shrink-0 rounded-xl border bg-white p-1 text-left shadow-sm transition ${pageNumber === thumbPage ? 'border-sea-teal ring-2 ring-sea-teal/25' : 'border-slate-200 hover:border-sea-teal'}`}
                    aria-label={`Go to page ${thumbPage}`}
                  >
                    <Page pageNumber={thumbPage} width={86} renderAnnotationLayer={false} renderTextLayer={false} />
                    <span className="block pt-1 text-center text-xs font-semibold text-slate-500">{thumbPage}</span>
                  </button>
                </div>
              );
            })}
          </nav>

          <div className="order-1 xl:order-2">
            <div
              className="flex min-h-[360px] items-center justify-center overflow-auto rounded-3xl bg-gradient-to-br from-slate-100 to-emerald-50 p-3 shadow-inner sm:p-6"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div className={`origin-center rounded-2xl bg-white p-2 shadow-2xl shadow-slate-400/30 transition duration-200 ${isTurning ? 'scale-[0.985] rotate-1 opacity-80' : 'scale-100 rotate-0 opacity-100'}`}>
                <Page pageNumber={pageNumber} width={pageWidth} />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-sea-teal hover:text-sea-teal disabled:cursor-not-allowed disabled:opacity-40">
                Previous
              </button>
              <p className="text-center text-sm font-semibold text-slate-600" aria-live="polite">
                Page {pageNumber} of {numPages ?? '-'}
              </p>
              <button type="button" onClick={() => goToPage(pageNumber + 1)} disabled={Boolean(numPages && pageNumber >= numPages)} className="rounded-full bg-sea-teal px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        </div>
      </Document>
    </section>
  );
}
