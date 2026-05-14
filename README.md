# README.md

# Human Memory Graph

A living, evolving graph of what humans remember.

This project explores collective human memory through an interactive knowledge graph. Instead of storing only objective facts, the system models:

- common human associations
- profession-specific knowledge
- subjective experiences
- cultural memory
- remembered heuristics
- emotional connections
- niche expertise

The graph is designed to evolve organically over time through human contribution, relationship building, and eventually AI-assisted semantic organization.

---

# MVP Goal

The MVP is NOT intended to model all human knowledge.

The MVP only needs to answer one question:

> "Can humans collaboratively create an interesting and explorable memory graph?"

If the graph feels:

- meaningful
- alive
- explorable
- discoverable
- socially engaging

at a small scale, the concept is validated.

---

# Core Philosophy

This is NOT Wikipedia.

This project does not attempt to store only "truth".

Instead, it models:

> what humans tend to remember, associate, feel, and reinforce.

This distinction is critical.

Examples:

- "Chocolate tastes comforting"
- "Sugar causes hyperactivity"
- "Doctors remember airway procedures"
- "Music producers remember BPM heuristics"
- "Rain is emotionally associated with sadness"

Some of these may be objective.
Some subjective.
Some culturally reinforced.
Some scientifically disputed.

All may still exist meaningfully within human memory.

---

# MVP Features

## Authentication

Users can:

- sign up
- log in
- maintain a profile

Authentication should be simple.

Recommended:

- Supabase Auth

---

## Interactive Graph

The homepage displays:

- an explorable force-directed graph
- connected memory nodes
- clustered knowledge areas

Users can:

- zoom
- pan
- search
- click nodes
- expand relationships

The graph should feel:

- organic
- alive
- neural
- atmospheric

NOT like a corporate dashboard.

---

## Node System

Users can create nodes representing:

- facts
- beliefs
- experiences
- heuristics
- cultural memories
- profession-specific knowledge

Example:

```json
{
  "title": "Chocolate",
  "type": "food",
  "description": "Humans commonly associate chocolate with comfort and sweetness.",
  "tags": ["food", "comfort", "dessert"]
}
```

---

## Relationships

Nodes connect through typed relationships.

Examples:

- associated_with
- emotionally_linked_to
- profession_specific_to
- commonly_confused_with
- sensory_association
- remembered_with

Example:

```json
{
  "source": "Chocolate",
  "target": "Comfort",
  "relationship": "emotionally_associated_with",
  "strength": 0.81
}
```

---

## Voting

Users can vote on:

- usefulness
- accuracy
- commonality
- validity

MVP voting should remain simple.

Avoid complex trust systems initially.

---

## Search

Users should be able to:

- search nodes
- discover nearby associations
- explore connected concepts

Initial implementation:

- PostgreSQL full-text search

Future:

- semantic search
- embeddings
- vector retrieval

---

# MVP Pages

## Landing Page

Contains:

- animated background graph
- project description
- login/signup
- enter graph button

---

## Graph Page

Main exploration interface.

Contains:

- graph visualization
- search bar
- filters
- node details panel

---

## Node Page

Accessible via:

```
/memory/:nodeSlug
```

Contains:

- node description
- relationships
- related professions
- related discussions
- voting
- metadata

These pages are important for SEO.

---

## Workshop Page

The contribution area.

Users can:

- create nodes
- suggest edits
- create relationships
- discuss meaning

Avoid calling this a generic forum.

Suggested naming:

- Memory Workshop
- Node Forge
- Consensus Workshop

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- React Force Graph
- Zustand
- Framer Motion

---

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Supabase

---

## Hosting

Frontend:

- Vercel

Backend:

- Render (free tier initially)

Database:

- Supabase PostgreSQL

---

# Database Structure

## users

Stores:

- auth data
- profile data
- reputation
- professions

---

## nodes

Stores:

- title
- description
- node type
- metadata
- ad safety flags
- sensitivity flags

---

## edges

Stores:

- source node
- target node
- relationship type
- strength

---

## votes

Stores:

- user vote
- target node/edge
- vote type

---

## tags

Stores:

- categories
- professions
- semantic groupings

---

# Ethical Principles

The graph must not become:

- manipulative
- exploitative
- psychologically predatory
- engagement-maximized sludge

Sensitive topics should eventually:

- disable monetization
- require stricter moderation
- avoid exploitative recommendations

---

# Monetization Philosophy

The MVP contains NO advertisements.

Future monetization, if added, should:

- respect user cognition
- remain contextual
- avoid invasive tracking
- preserve immersion

The graph experience itself is the product.

---

# Long-Term Vision

Eventually the graph may:

- self-organize
- discover semantic clusters
- propose new relationships
- absorb public knowledge sources
- model collective human memory
- visualize cultural cognition
- simulate memory decay and reinforcement

But none of this belongs in the MVP.

---

# Success Criteria

The MVP succeeds if:

- users enjoy exploring the graph
- users create meaningful connections
- clusters begin emerging naturally
- the graph feels alive even at small scale

Approximate validation milestone:

- 50 users
- 500 nodes
- 2000 edges

---

