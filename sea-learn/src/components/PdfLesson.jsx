import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../lib/supabaseClient';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Renders a PDF (or a slide deck exported as PDF) in-app, page by page,
// and logs which page the learner reached — used for both 'pdf' and 'slides' lesson types.
export default function PdfLesson({ lesson, userId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const viewedPagesRef = useRef(new Set());
  const completedLoggedRef = useRef(false);

  useEffect(() => {
    viewedPagesRef.current = new Set();
    completedLoggedRef.current = false;
    setNumPages(null);
    setPageNumber(1);
  }, [lesson.id]);

  useEffect(() => {
    if (!userId || viewedPagesRef.current.has(pageNumber)) return;

    viewedPagesRef.current.add(pageNumber);
    void supabase.from('activity_events').insert({
      user_id: userId,
      lesson_id: lesson.id,
      event_type: 'pdf_page_viewed',
      progress_value: pageNumber,
    });

    if (numPages && pageNumber === numPages && !completedLoggedRef.current) {
      completedLoggedRef.current = true;
      void supabase.from('activity_events').insert({
        user_id: userId,
        lesson_id: lesson.id,
        event_type: 'completed',
        progress_value: 100,
      });
    }
  }, [pageNumber, numPages, lesson.id, userId]);

  return (
    <div className="flex flex-col items-center">
      <Document
        file={lesson.content_url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={pageNumber} width={700} />
      </Document>

      <div className="flex items-center gap-4 mt-4">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((p) => p - 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-40"
        >
          Previous
        </button>
        <span>{pageNumber} / {numPages ?? '…'}</span>
        <button
          disabled={!numPages || pageNumber >= numPages}
          onClick={() => setPageNumber((p) => p + 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
