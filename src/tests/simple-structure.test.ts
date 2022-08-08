import { SimpleStructure } from '../structure';

describe('SimpleStructure', () => {
    it('is not affected by changes to its clone', () => {
        const structure = SimpleStructure.fromSingleBlock('structure', 0, 0, 0, 1);
        const cloneA = structure.clone();
        const cloneB = structure.clone();

        cloneA.set(0, 0, 0, 2);
        cloneB.set(0, 0, 0, 0);

        expect(structure.get(0, 0, 0)).toBe(1);
        expect(cloneA.get(0, 0, 0)).toBe(2);
        expect(cloneB.get(0, 0, 0)).toBe(0);
    });
});
