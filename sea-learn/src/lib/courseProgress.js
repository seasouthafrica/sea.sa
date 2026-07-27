export function getCourseLessonIds(course) {
  return (course?.modules ?? []).flatMap((module) =>
    (module.lessons ?? []).map((lesson) => lesson.id)
  );
}

export function getCourseProgress(course, completedLessonIds) {
  const lessonIds = getCourseLessonIds(course);
  if (!lessonIds.length) return 0;

  const completed = lessonIds.filter((id) => completedLessonIds.has(id)).length;
  return Math.round((completed / lessonIds.length) * 100);
}
