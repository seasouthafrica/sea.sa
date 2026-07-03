import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { supabase } from '../lib/supabaseClient';

// Renders a PDF (or a slide deck exported as PDF) in-app, page by page,
// and logs which page the learner reached — used for both 'pdf' and 'slides' lesson types.
export default function PdfLesson({ lesson, userId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    supabase.from('activity_events').insert({
      user_id: userId,
      lesson_id: lesson.id,
      event_type: 'pdf_page_viewed',
      progress_value: pageNumber,
    });

    if (numPages && pageNumber === numPages) {
      supabase.from('activity_events').insert({
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
          disabled={numPages && pageNumber >= numPages}
          onClick={() => setPageNumber((p) => p + 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
