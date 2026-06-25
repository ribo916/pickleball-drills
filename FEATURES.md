# Pickleball Drills — Feature Roadmap

A living tracker for planned improvements. Priority order reflects value for 4 friends at the court.

---

## Status Legend
- `[ ]` Not started
- `[~]` In progress
- `[x]` Done

---

## Features

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | [Video Embedding](#1-video-embedding) | `[~]` | YouTube/Vimeo iframe in detail view |
| 2 | [Quick-Add Mode](#2-quick-add-mode) | `[~]` | Name + desc only, full edit later |
| 3 | [Text Search](#3-text-search) | `[ ]` | Real-time filter by name/description |
| 4 | [Favorites](#4-favorites) | `[ ]` | Per-device star, localStorage |
| 5 | [Session Planner](#5-session-planner) | `[ ]` | Queue drills for today's practice |
| 6 | [Drill Duplication](#6-drill-duplication) | `[ ]` | Clone + open in creator |
| 7 | [Difficulty Rating](#7-difficulty-rating) | `[ ]` | Beginner / Intermediate / Advanced |
| 8 | [Multi-Tag Filter in Library](#8-multi-tag-filter-in-library) | `[ ]` | OR logic, matches randomizer |
| 9 | [Step Titles in Creator](#9-step-titles-in-creator) | `[ ]` | Capture existing `steps[].title` field |
| 10 | [Sort Options in Library](#10-sort-options-in-library) | `[ ]` | Name A–Z, Newest, Player Count |

---

## Detail

### 1. Video Embedding
YouTube or Vimeo URL per drill. Renders as an embedded iframe in the detail view below the court diagram. Auto-detects URL format to generate correct embed URL.

**Data model**: add optional `videoUrl: string` to drill object  
**Files**: `src/creator.js` (input), `src/detail.js` (iframe render), `src/utils.js` (parseVideoUrl)  
**Tests**: URL parsing for YouTube long/short/embed forms, Vimeo, invalid URLs

---

### 2. Quick-Add Mode
Minimal "+ Quick Add" button in library header. Opens a lightweight modal with just name + description. Saves immediately. Drill appears in library with a visual indicator that it has no steps yet. Can be fully edited later via the existing creator.

**Files**: `index.html` (modal markup), `src/library.js` (button + modal logic), `src/storage.js` (no changes needed)  
**Tests**: save creates valid drill object, appears in state.drills, empty name blocked

---

### 3. Text Search
Real-time search input in library header. Filters by drill name and description. AND-combines with active tag filter.

---

### 4. Favorites
Star icon on each library card and detail view. Per-device via localStorage (`pickle-favorites` key). "Favorites" filter pill in library alongside tags.

---

### 5. Session Planner
"Add to Session" button on drill cards and detail view. Dedicated session view: ordered list, tap to open, drag to reorder. Queue stored in localStorage, cleared on "End Session".

---

### 6. Drill Duplication
"Duplicate" button on detail view. Deep-copies drill, prepends "Copy of " to name, opens in creator.

---

### 7. Difficulty Rating
`difficulty: 'beginner' | 'intermediate' | 'advanced'` on drill object. Badge on library cards and detail view. 3-button selector in creator. Filter in randomizer.

---

### 8. Multi-Tag Filter in Library
Convert library tag filter to multi-select. OR logic (any selected tag qualifies). Matches existing randomizer behavior for consistency.

---

### 9. Step Titles in Creator
Add optional title input per step in creator form. Display as heading in detail view step slideshow. No schema changes needed — `steps[].title` field already exists.

---

### 10. Sort Options in Library
Dropdown or toggle: Name A–Z, Newest First, Player Count, Difficulty. State persists in localStorage. Default: Name A–Z.
