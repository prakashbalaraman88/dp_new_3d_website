import { Panel } from './types';

// Constants for Optimization
const SHEET_WIDTH = 2440; // 8ft
const SHEET_HEIGHT = 1220; // 4ft
const KERF = 4; // Saw blade thickness
const TRIM = 10; // Edge trim

// Effective Sheet Size
const EFF_WIDTH = SHEET_WIDTH - (2 * TRIM);
const EFF_HEIGHT = SHEET_HEIGHT - (2 * TRIM);

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface Bin {
    id: number;
    width: number;
    height: number;
    freeRects: Rect[];
    usedRects: Rect[];
}

export interface NestingResult {
    totalSheets: number;
    efficiency: number; // Percentage
    bins: Bin[]; // Details of each sheet
}

/**
 * A simplified MaxRects-like Bin Packing Algorithm
 */
class Packer {
    bins: Bin[] = [];

    constructor() { }

    addBin() {
        this.bins.push({
            id: this.bins.length + 1,
            width: EFF_WIDTH,
            height: EFF_HEIGHT,
            freeRects: [{ x: 0, y: 0, w: EFF_WIDTH, h: EFF_HEIGHT }],
            usedRects: []
        });
    }



    // --- RESTARTING LOGIC WITH SIMPLER GUILLOTINE PACKER ---

    fit(panels: Panel[]): NestingResult {
        // 1. Sort panels by Area Descending (Best Fit Decreasing)
        // Add KERF to dimensions here to reserve space
        const items = panels.map(p => ({
            ...p,
            w: p.length + KERF,
            h: p.width + KERF,
            area: (p.length + KERF) * (p.width + KERF)
        })).sort((a, b) => b.area - a.area);

        this.bins = [];

        for (const item of items) {
            let placed = false;

            // Try existing bins
            for (const bin of this.bins) {
                if (this.tryPlace(bin, item)) {
                    placed = true;
                    break;
                }
            }

            // New Bin
            if (!placed) {
                this.addBin();
                const newBin = this.bins[this.bins.length - 1];
                this.tryPlace(newBin, item);
                // Assumes sheet is bigger than largest panel (valid for standard plywood)
            }
        }

        return {
            totalSheets: this.bins.length,
            efficiency: 0, // Todo calculation
            bins: this.bins
        };
    }

    tryPlace(bin: Bin, item: any): boolean {
        // Find a free rect that fits
        // We use the "Best Short Side Fit" heuristic
        let bestRectIndex = -1;
        let minResidual = Number.MAX_VALUE;
        let placedW = item.w;
        let placedH = item.h;

        for (let i = 0; i < bin.freeRects.length; i++) {
            const free = bin.freeRects[i];

            // Check Normal
            if (free.w >= item.w && free.h >= item.h) {
                const residual = Math.min(free.w - item.w, free.h - item.h);
                if (residual < minResidual) {
                    minResidual = residual;
                    bestRectIndex = i;
                    placedW = item.w;
                    placedH = item.h;
                }
            }

            // Check Rotated (if allowed) -- Plywood is usually rotatable
            if (item.isRotatable && free.w >= item.h && free.h >= item.w) {
                const residual = Math.min(free.w - item.h, free.h - item.w);
                if (residual < minResidual) {
                    minResidual = residual;
                    bestRectIndex = i;
                    placedW = item.h; // Swapped
                    placedH = item.w;
                }
            }
        }

        if (bestRectIndex !== -1) {
            const free = bin.freeRects[bestRectIndex];

            // Place Item
            bin.usedRects.push({
                x: free.x,
                y: free.y,
                w: placedW - KERF, // Remove Kerf for actual record
                h: placedH - KERF
            });

            // Split Logic (Guillotine Short Axis Split)
            // We split the free rectangle into two smaller free rectangles
            // Split Horizontally or Vertically?
            // "Short Axis Split" usually minimizes fragmentation.

            // 1. Remove the used free rect
            const usedFree = bin.freeRects.splice(bestRectIndex, 1)[0];

            // 2. Add two new free rects
            // Split along Width (Vertical Cut)
            // Left (Remaining Height) & Right (Full Height) ??

            // Logic: 
            // Free Rect:  [       ]
            // Placed:     [#]
            // New Free 1:    [    ] (Right of placed)
            // New Free 2: [#]
            //             [ ]       (Below placed)

            // Horizontal Split: Cut happens at y + h
            // Top (Right of placed), Bottom (Full Width below)
            const rightRect = {
                x: usedFree.x + placedW,
                y: usedFree.y,
                w: usedFree.w - placedW,
                h: placedH
            };

            const bottomRect = {
                x: usedFree.x,
                y: usedFree.y + placedH,
                w: usedFree.w,
                h: usedFree.h - placedH
            };

            if (rightRect.w > 0 && rightRect.h > 0) bin.freeRects.push(rightRect);
            if (bottomRect.w > 0 && bottomRect.h > 0) bin.freeRects.push(bottomRect);

            return true;
        }

        return false;
    }
}

export const calculateMaterialRequirements = (panels: Panel[]): {
    sheets16mm: number;
    sheets6mm: number;
    sheetsLaminate: number; // Rough est
} => {
    // Separate materials
    const ply16Panels = panels.filter(p => p.thickness === 16);
    const ply6Panels = panels.filter(p => p.thickness === 6);
    // Ignore shutters for nesting (usually diff material or factory made) for now, or just calculate area.

    const packer16 = new Packer();
    const res16 = packer16.fit(ply16Panels);

    const packer6 = new Packer();
    const res6 = packer6.fit(ply6Panels);

    return {
        sheets16mm: res16.totalSheets,
        sheets6mm: res6.totalSheets,
        sheetsLaminate: Math.ceil(res16.totalSheets * 2) // Very rough: 2 laminates per ply sheet
    };
};
