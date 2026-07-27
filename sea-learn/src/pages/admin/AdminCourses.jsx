import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const emptyCourse = { title: '', slug: '', description: '' };
const emptyLesson = { title: '', type: 'video', content_url: '', estimated_minutes: '' };

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonForms, setLessonForms] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from('courses')
      .select('id, title, slug, description, published, certificate_enabled, modules(id, title, order_index, lessons(id, title, type, content_url, estimated_minutes, order_index))')
      .order('created_at', { ascending: true });

    if (loadError) setError(loadError.message);
    setCourses(data ?? []);
    setSelectedId((current) => current ?? data?.[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const selected = courses.find((course) => course.id === selectedId) ?? null;
  const modules = (selected?.modules ?? [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const runAction = async (action, successMessage) => {
    setError('');
    setMessage('');
    const actionError = await action();
    if (actionError) {
      setError(actionError.message);
      return;
    }
    setMessage(successMessage);
    await loadCourses();
  };

  const createCourse = async (event) => {
    event.preventDefault();
    const slug = courseForm.slug || slugify(courseForm.title);
    await runAction(async () => {
      const { data, error: createError } = await supabase
        .from('courses')
        .insert({ ...courseForm, slug, published: false })
        .select('id')
        .single();
      if (!createError) {
        setCourseForm(emptyCourse);
        setSelectedId(data.id);
      }
      return createError;
    }, 'Course created as a draft.');
  };

  const togglePublished = async () => {
    if (!selected) return;
    await runAction(async () => {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ published: !selected.published })
        .eq('id', selected.id);
      return updateError;
    }, selected.published ? 'Course moved back to draft.' : 'Course published.');
  };

  const addModule = async (event) => {
    event.preventDefault();
    if (!selected || !moduleTitle.trim()) return;
    await runAction(async () => {
      const { error: createError } = await supabase.from('modules').insert({
        course_id: selected.id,
        title: moduleTitle.trim(),
        order_index: modules.length,
      });
      if (!createError) setModuleTitle('');
      return createError;
    }, 'Session added.');
  };

  const addLesson = async (event, module) => {
    event.preventDefault();
    const form = lessonForms[module.id] ?? emptyLesson;
    if (!form.title.trim() || !form.content_url.trim()) return;
    await runAction(async () => {
      const { error: createError } = await supabase.from('lessons').insert({
        module_id: module.id,
        title: form.title.trim(),
        type: form.type,
        content_url: form.content_url.trim(),
        estimated_minutes: form.estimated_minutes ? Number(form.estimated_minutes) : null,
        order_index: module.lessons?.length ?? 0,
      });
      if (!createError) {
        setLessonForms((current) => ({ ...current, [module.id]: emptyLesson }));
      }
      return createError;
    }, 'Lesson added.');
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sea-teal">SEA Learn admin</p>
          <h1 className="text-3xl font-bold">Course builder</h1>
        </div>
        <Link to="/admin" className="font-semibold text-sea-teal">Back to overview</Link>
      </div>

      {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p>}
      {message && <p className="mb-5 rounded-xl bg-emerald-50 p-4 text-emerald-700" role="status">{message}</p>}

      <section className="mb-8 rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">Create a course</h2>
        <form onSubmit={createCourse} className="grid gap-4 md:grid-cols-2">
          <input required placeholder="Course title" value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} className="rounded-lg border px-3 py-2" />
          <input placeholder="course-slug (generated if blank)" value={courseForm.slug} onChange={(event) => setCourseForm({ ...courseForm, slug: slugify(event.target.value) })} className="rounded-lg border px-3 py-2" />
          <textarea placeholder="Course description" value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} className="rounded-lg border px-3 py-2 md:col-span-2" rows="3" />
          <button className="w-fit rounded-lg bg-sea-teal px-5 py-2 font-semibold text-white">Create draft course</button>
        </form>
      </section>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border bg-white p-4">
          <h2 className="mb-3 font-bold">Courses</h2>
          {loading && <p className="text-sm text-gray-500">Loading courses...</p>}
          <div className="space-y-2">
            {courses.map((course) => (
              <button key={course.id} type="button" onClick={() => setSelectedId(course.id)} className={`w-full rounded-xl px-4 py-3 text-left ${selectedId === course.id ? 'bg-sea-teal text-white' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <span className="block font-semibold">{course.title}</span>
                <span className="text-xs opacity-75">{course.published ? 'Published' : 'Draft'}</span>
              </button>
            ))}
          </div>
        </aside>

        <section>
          {!selected ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-gray-500">Create or select a course to manage its curriculum.</div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.title}</h2>
                    <p className="mt-1 text-gray-500">/{selected.slug}</p>
                    <p className="mt-3 text-gray-600">{selected.description || 'No description yet.'}</p>
                  </div>
                  <button type="button" onClick={togglePublished} className={`rounded-lg px-4 py-2 font-semibold ${selected.published ? 'bg-amber-100 text-amber-800' : 'bg-emerald-600 text-white'}`}>
                    {selected.published ? 'Move to draft' : 'Publish course'}
                  </button>
                </div>
              </div>

              <form onSubmit={addModule} className="flex gap-3 rounded-2xl border bg-white p-5">
                <input required placeholder="New session title" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} className="min-w-0 flex-1 rounded-lg border px-3 py-2" />
                <button className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white">Add session</button>
              </form>

              {modules.map((module, moduleIndex) => {
                const lessons = (module.lessons ?? []).slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
                const lessonForm = lessonForms[module.id] ?? emptyLesson;
                return (
                  <article key={module.id} className="rounded-2xl border bg-white p-6">
                    <h3 className="text-lg font-bold">Session {moduleIndex + 1}: {module.title}</h3>
                    <ol className="my-4 space-y-2">
                      {lessons.map((lesson, lessonIndex) => (
                        <li key={lesson.id} className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                          <span className="font-semibold">{lessonIndex + 1}. {lesson.title}</span>
                          <span className="ml-2 text-gray-500">{lesson.type}{lesson.estimated_minutes ? ` · ${lesson.estimated_minutes} min` : ''}</span>
                        </li>
                      ))}
                      {!lessons.length && <li className="text-sm text-gray-500">No lessons in this session yet.</li>}
                    </ol>

                    <form onSubmit={(event) => addLesson(event, module)} className="grid gap-3 rounded-xl bg-cyan-50 p-4 md:grid-cols-2">
                      <input required placeholder="Lesson title" value={lessonForm.title} onChange={(event) => setLessonForms({ ...lessonForms, [module.id]: { ...lessonForm, title: event.target.value } })} className="rounded-lg border px-3 py-2" />
                      <select value={lessonForm.type} onChange={(event) => setLessonForms({ ...lessonForms, [module.id]: { ...lessonForm, type: event.target.value } })} className="rounded-lg border px-3 py-2">
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="slides">Slides</option>
                      </select>
                      <input required type="url" placeholder="YouTube or document URL" value={lessonForm.content_url} onChange={(event) => setLessonForms({ ...lessonForms, [module.id]: { ...lessonForm, content_url: event.target.value } })} className="rounded-lg border px-3 py-2" />
                      <input type="number" min="0" placeholder="Estimated minutes" value={lessonForm.estimated_minutes} onChange={(event) => setLessonForms({ ...lessonForms, [module.id]: { ...lessonForm, estimated_minutes: event.target.value } })} className="rounded-lg border px-3 py-2" />
                      <button className="w-fit rounded-lg bg-sea-teal px-4 py-2 font-semibold text-white">Add lesson</button>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
