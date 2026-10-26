-- Measuring Social Impact Programme: removed from the home page grid on 2026-10-26
-- at the client's request, because the approved home-page design shows five cards
-- and this was not among them. The page measuring-social-impact.html is untouched
-- and still live; only the home-page card was taken down.
--
-- Run this to put the card back (it returns as sort_order 6, after Start-up/Build):
insert into programmes (id, title, description, image_url, url, sort_order, video_url)
values (
  6,
  'Measuring Social Impact Programme',
  'This programme gives you the practical tools, frameworks, and confidence to measure and communicate your social impact effectively.',
  null,
  'mailto:jamy@socialenterprise.academy?subject=Measuring%20Social%20Impact%20Programme',
  6,
  null
);
