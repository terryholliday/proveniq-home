import { createHash } from 'crypto';

export class MerkleTree {
    leaves: string[];
    layers: string[][];

    constructor(leaves: string[] = []) {
        this.leaves = leaves.map(this.hash);
        this.layers = [this.leaves];
        this.buildTree();
    }

    private hash(data: string): string {
        return createHash('sha256').update(data).digest('hex');
    }

    private buildTree() {
        let currentLayer = this.layers[0];

        while (currentLayer.length > 1) {
            const nextLayer: string[] = [];
            for (let i = 0; i < currentLayer.length; i += 2) {
                if (i + 1 < currentLayer.length) {
                    nextLayer.push(this.hash(currentLayer[i] + currentLayer[i + 1]));
                } else {
                    nextLayer.push(currentLayer[i]);
                }
            }
            this.layers.push(nextLayer);
            currentLayer = nextLayer;
        }
    }

    addLeaf(data: string) {
        this.leaves.push(this.hash(data));
        this.layers = [this.leaves];
        this.buildTree();
    }

    getRoot(): string {
        if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
            return '';
        }
        return this.layers[this.layers.length - 1][0];
    }

    getProof(index: number): { position: 'left' | 'right'; data: string }[] {
        const proof = [];
        let currentLayerIndex = 0;
        let currentIndex = index;

        while (currentLayerIndex < this.layers.length - 1) {
            const layer = this.layers[currentLayerIndex];
            const isRightNode = currentIndex % 2 === 1;
            const pairIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;

            if (pairIndex < layer.length) {
                proof.push({
                    position: isRightNode ? 'left' : 'right',
                    data: layer[pairIndex],
                });
            }

            currentIndex = Math.floor(currentIndex / 2);
            currentLayerIndex++;
        }

        return proof as { position: 'left' | 'right'; data: string }[];
    }

    verifyProof(proof: { position: 'left' | 'right'; data: string }[], target: string, root: string): boolean {
        let currentHash = this.hash(target);

        for (const node of proof) {
            if (node.position === 'left') {
                currentHash = this.hash(node.data + currentHash);
            } else {
                currentHash = this.hash(currentHash + node.data);
            }
        }

        return currentHash === root;
    }
}
