-- ============================================================
-- Human Memory Graph — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Seed nodes
insert into public.nodes (title, slug, description, node_type, ad_safe, sensitive_topic) values
  ('Chocolate', 'chocolate', 'Humans widely associate chocolate with warmth, comfort, and indulgence. It often appears in memories tied to reward and celebration.', 'sensory', true, false),
  ('Comfort', 'comfort', 'A state humans seek during stress, illness, or sadness. Often triggered by specific foods, spaces, or people.', 'emotion', true, false),
  ('Rain', 'rain', 'The sound and smell of rain triggers strong emotional responses in most humans — often melancholy, coziness, or nostalgia simultaneously.', 'sensory', true, false),
  ('Sadness', 'sadness', 'One of the core human emotions. Often associated with loss, absence, or unmet expectations. Humans rarely remember being sad without context.', 'emotion', true, false),
  ('Music', 'music', 'Humans use music as memory anchors. Specific songs can instantly recall periods of life with high emotional fidelity.', 'cultural', true, false),
  ('BPM', 'bpm', 'Beats per minute — a core heuristic for music producers and DJs. The first thing many producers listen for when analyzing a track.', 'heuristic', true, false),
  ('Coffee', 'coffee', 'Coffee is deeply embedded in human morning ritual and work culture. Its smell alone triggers wakefulness in habitual drinkers.', 'sensory', true, false),
  ('Focus', 'focus', 'The cognitive state of concentrated attention. Humans associate it with productivity, flow states, and sometimes caffeine.', 'experience', true, false),
  ('Debugging', 'debugging', 'The process of finding and fixing errors in code. Most programmers associate it with frustration followed by disproportionate satisfaction.', 'heuristic', true, false),
  ('Pattern Recognition', 'pattern-recognition', 'A fundamental cognitive skill. Expert practitioners in any field develop faster, more accurate pattern matching than novices.', 'heuristic', true, false),
  ('Nostalgia', 'nostalgia', 'A bittersweet emotion directed at the past. Often involves a warm idealization that softens the actual difficulties of remembered times.', 'emotion', true, false),
  ('Childhood', 'childhood', 'Humans hold powerful, often idealized memories of childhood. The period is densely encoded — mundane details stay vivid for decades.', 'experience', true, false),
  ('Summer', 'summer', 'For many cultures, summer represents freedom, leisure, and warmth. School-age memories heavily cluster around summer months.', 'experience', true, false),
  ('Petrichor', 'petrichor', 'The distinctive smell of rain on dry earth. One of the most universally recognized scents across cultures, often triggering immediate nostalgia.', 'sensory', true, false),
  ('Airway Assessment', 'airway-assessment', 'The first priority in any emergency triage situation. Paramedics and ER doctors remember this as the top of the ABC protocol — Airway, Breathing, Circulation.', 'profession', true, false),
  ('Triage', 'triage', 'The rapid categorization of patients by severity of need. Emergency medical professionals develop fast, often unconscious triage heuristics over time.', 'profession', true, false),
  ('Dreams', 'dreams', 'Humans frequently experience vivid dreams but retain only fragments. The emotional tone of a dream is typically remembered longer than its content.', 'experience', true, false),
  ('The First Day', 'the-first-day', 'Whether first day of school, a job, or a relationship — humans encode first-day memories with unusual clarity and emotional charge.', 'experience', true, false),
  ('Silence', 'silence', 'Humans experience silence differently depending on context. Comfortable silence is a marker of deep familiarity; uncomfortable silence signals tension.', 'sensory', true, false),
  ('Error Messages', 'error-messages', 'For programmers, error messages are deeply familiar. The ability to parse an error message quickly is a key mark of experience.', 'profession', true, false);

-- Seed edges
insert into public.edges (source_id, target_id, relationship_type, strength) 
select s.id, t.id, rel, str
from (values
  ('chocolate',           'comfort',            'emotionally_linked_to',    0.89),
  ('rain',                'sadness',            'emotionally_linked_to',    0.72),
  ('rain',                'comfort',            'emotionally_linked_to',    0.44),
  ('rain',                'petrichor',          'sensory_association',       0.95),
  ('music',               'nostalgia',          'emotionally_linked_to',    0.83),
  ('bpm',                 'music',              'profession_specific_to',   0.94),
  ('coffee',              'focus',              'associated_with',           0.78),
  ('coffee',              'comfort',            'associated_with',           0.61),
  ('coffee',              'chocolate',          'associated_with',           0.55),
  ('debugging',           'pattern-recognition','associated_with',           0.87),
  ('debugging',           'error-messages',     'associated_with',           0.96),
  ('error-messages',      'debugging',          'associated_with',           0.95),
  ('nostalgia',           'childhood',          'emotionally_linked_to',    0.91),
  ('childhood',           'summer',             'remembered_with',           0.77),
  ('childhood',           'the-first-day',      'remembered_with',           0.71),
  ('petrichor',           'nostalgia',          'emotionally_linked_to',    0.68),
  ('airway-assessment',   'triage',             'associated_with',           0.92),
  ('airway-assessment',   'triage',             'profession_specific_to',   0.95),
  ('dreams',              'nostalgia',          'emotionally_linked_to',    0.58),
  ('silence',             'comfort',            'emotionally_linked_to',    0.52),
  ('pattern-recognition', 'debugging',          'associated_with',           0.80),
  ('music',               'summer',             'emotionally_linked_to',    0.69),
  ('focus',               'silence',            'associated_with',           0.63),
  ('summer',              'petrichor',          'sensory_association',       0.59)
) as v(src_slug, tgt_slug, rel, str)
join public.nodes s on s.slug = v.src_slug
join public.nodes t on t.slug = v.tgt_slug
on conflict do nothing;
