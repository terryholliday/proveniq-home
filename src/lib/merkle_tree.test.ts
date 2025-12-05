import { MerkleTree } from './merkle_tree';
import { createHash } from 'crypto';

function hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
}

describe('MerkleTree', () => {
    it('should generate a valid root for a single leaf', () => {
        const data = 'test';
        const tree = new MerkleTree([data]);
        expect(tree.getRoot()).toBe(hash(data));
    });

    it('should generate a valid root for two leaves', () => {
        const leaves = ['a', 'b'];
        const tree = new MerkleTree(leaves);
        const expectedRoot = hash(hash('a') + hash('b'));
        expect(tree.getRoot()).toBe(expectedRoot);
    });

    it('should generate a valid root for four leaves', () => {
        const leaves = ['a', 'b', 'c', 'd'];
        const tree = new MerkleTree(leaves);

        const hA = hash('a');
        const hB = hash('b');
        const hC = hash('c');
        const hD = hash('d');

        const hAB = hash(hA + hB);
        const hCD = hash(hC + hD);

        const expectedRoot = hash(hAB + hCD);
        expect(tree.getRoot()).toBe(expectedRoot);
    });

    it('should verify a valid proof', () => {
        const leaves = ['a', 'b', 'c', 'd'];
        const tree = new MerkleTree(leaves);
        const root = tree.getRoot();

        // Proof for 'c' (index 2)
        // Path: sibling 'd' (right), then sibling 'ab' (left)
        const proof = tree.getProof(2);

        expect(tree.verifyProof(proof, 'c', root)).toBe(true);
    });

    it('should fail an invalid proof', () => {
        const leaves = ['a', 'b', 'c', 'd'];
        const tree = new MerkleTree(leaves);
        const root = tree.getRoot();

        const proof = tree.getProof(2);

        // Try to verify 'x' with 'c's proof
        expect(tree.verifyProof(proof, 'x', root)).toBe(false);
    });
});
