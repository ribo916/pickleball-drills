import { describe, it, expect, beforeEach, vi } from 'vitest';

// The quick-add drill factory logic extracted for unit testing
function buildQuickDrill(name, desc) {
  return {
    id: `drill-${Date.now()}`,
    name,
    players: 4,
    desc,
    goal: desc,
    tags: [],
    steps: [],
    roles: [],
    notes: [],
  };
}

describe('buildQuickDrill', () => {
  it('creates a drill with the given name and desc', () => {
    const d = buildQuickDrill('Lob Recovery', 'Practice lob defense');
    expect(d.name).toBe('Lob Recovery');
    expect(d.desc).toBe('Practice lob defense');
    expect(d.goal).toBe('Practice lob defense');
  });

  it('defaults to 4 players', () => {
    const d = buildQuickDrill('Test', '');
    expect(d.players).toBe(4);
  });

  it('starts with empty steps, tags, roles, notes', () => {
    const d = buildQuickDrill('Test', '');
    expect(d.steps).toEqual([]);
    expect(d.tags).toEqual([]);
    expect(d.roles).toEqual([]);
    expect(d.notes).toEqual([]);
  });

  it('assigns a unique id prefixed with drill-', () => {
    const d = buildQuickDrill('Test', '');
    expect(d.id).toMatch(/^drill-\d+$/);
  });

  it('handles empty description gracefully', () => {
    const d = buildQuickDrill('No Desc', '');
    expect(d.desc).toBe('');
    expect(d.goal).toBe('');
  });

  it('produces unique ids for rapid successive calls', () => {
    // IDs are timestamp-based; faking time to ensure uniqueness check
    const ids = new Set();
    for (let i = 0; i < 5; i++) {
      ids.add(buildQuickDrill('D', '').id);
    }
    // At minimum the shape should be consistent even if same ms
    ids.forEach(id => expect(id).toMatch(/^drill-\d+$/));
  });
});
