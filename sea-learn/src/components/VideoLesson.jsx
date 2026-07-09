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
  const intervalRef = useRef(null);
  const milestonesLogged = useRef(new Set());
  const startedLogged = useRef(false);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    milestonesLogged.current = new Set();
    startedLogged.current = false;
    isPlayingRef.current = false;

    if (!videoId) return undefined;

    let cancelled = false;

    // Loads the YouTube IFrame API once, then creates a player instance
    // that reports progress at 25/50/75/100% milestones.
    function createPlayer() {
      if (cancelled || playerRef.current) return;

      playerRef.current = new window.YT.Player(`yt-player-${lesson.id}`, {
        videoId,
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING && !startedLogged.current) {
              startedLogged.current = true;
              isPlayingRef.current = true;
              logEvent(userId, lesson.id, 'started');
            }
            if (event.data === window.YT.PlayerState.PLAYING) {
              isPlayingRef.current = true;
            }
            if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.BUFFERING) {
              isPlayingRef.current = false;
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              isPlayingRef.current = false;
              logEvent(userId, lesson.id, 'completed', 100);
            }
          },
        },
      });

      // Poll every 5s while playing to catch progress milestones.
      intervalRef.current = window.setInterval(() => {
        if (!isPlayingRef.current) return;
        const player = playerRef.current;
        if (!player || typeof player.getCurrentTime !== 'function') return;
        const duration = player.getDuration();
        if (!duration) return;

        const pct = Math.floor((player.getCurrentTime() / duration) * 100);
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
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReady === 'function') previousReady();
        createPlayer();
      };
    }

    return () => {
      cancelled = true;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, [lesson.id, videoId, userId]);

  if (!videoId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        This lesson has an invalid YouTube URL.
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
      <div id={`yt-player-${lesson.id}`} className="w-full h-full" />
    </div>
  );
}
