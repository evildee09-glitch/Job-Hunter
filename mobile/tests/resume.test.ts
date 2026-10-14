import { describe, expect, it } from 'vitest';
import { splitSkills } from '../src/domain/resume';
import { mockSkills } from '../src/mock/resume';

describe('splitSkills', () => {
  it('only treats verified skills as supported', () => {
    const r = splitSkills(['python', 'FastAPI', 'Kubernetes', 'React'], mockSkills);
    expect(r.supported).toEqual(['python', 'React']);
    expect(r.unsupported).toEqual(['FastAPI', 'Kubernetes']);
  });
});
