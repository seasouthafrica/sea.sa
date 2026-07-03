import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// Extracts the YouTube video ID from a full URL.
function getYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

// Logs an activity_events row. Called on start, at progress milestones, and on completion.
async function logEvent(userId, lessonId, eventType, progressValue = null) {
  await supabase.from('activity_events').insert({
    user_id: userId,
    lesson_id: lessonId,
    event_type: eventType,
    progress_value: progressValue,
  });
}

export default function VideoLesson({ lesson, userId }) {
  const videoId = getYouTubeId(lesson.content_url);
  const playerRef = useRef(null);
  const milestonesLogged = useRef(new Set());
  const startedLogged = useRef(false);

  useEffect(() => {
    // Loads the YouTube IFrame API once, then creates a player instance
    // that reports progress at 25/50/75/100% milestones.
    function createPlayer() {
      playerRef.current = new window.YT.Player(`yt-player-${lesson.id}`, {
        videoId,
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING && !startedLogged.current) {
              startedLogged.current = true;
              logEvent(userId, lesson.id, 'started');
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              logEvent(userId, lesson.id, 'completed', 100);
            }
          },
        },
      });

      // Poll every 5s while playing to catch progress milestones.
      setInterval(() => {
        const player = playerRef.current;
        if (!player || typeof player.getCurrentTime !== 'function') return;
        const pct = Math.floor((player.getCurrentTime() / player.getDuration()) * 100);
        [25, 50, 75].forEach((milestone) => {
          if (pct >= milestone && !milestonesLogged.current.has(milestone)) {
            milestonesLogged.current.add(milestone);
            logEvent(userId, lesson.id, 'progress', milestone);
          }
        });
      }, 5000);
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }
  }, [lesson.id, videoId, userId]);

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <div id={`yt-player-${lesson.id}`} className="w-full h-full" />
    </div>
  );
}
