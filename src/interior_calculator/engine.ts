import { Unit, Panel, Accessory } from './types';
import { DEFAULT_DIMENSIONS, PRICING_CONSTANTS } from './constants';

const PLY_16 = DEFAULT_DIMENSIONS.plyThickness; // 16mm
const BACK_6 = DEFAULT_DIMENSIONS.backThickness; // 6mm
const GROOVE = 8; // 8mm groove
const SHUTTER_THICKNESS = DEFAULT_DIMENSIONS.shutterThickness; // 16mm (Updated)
const C_GAP = 3; // 3mm clearance

// Material IDs (Simplified for now)
const MAT_CORE = 'ply_16';
const MAT_BACK = 'ply_6';
const MAT_SHUTTER = 'ply_shutter'; // Generic

/**
 * Calculates the BOM (Bill of Materials) for a standard Kitchen Base Unit
 */
export const calculateBaseUnitBOM = (width: number, height: number, depth: number, isKitchen: boolean = false): Panel[] => {
    const panels: Panel[] = [];

    // 1. Side Panels (2 Nos)
    panels.push({
        id: 'side', name: 'Side Panel', qty: 2,
        length: height, width: depth, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: height }
    });

    // 2. Bottom Panel (1 No)
    panels.push({
        id: 'bottom', name: 'Bottom Panel', qty: 1,
        length: width - (2 * PLY_16), width: depth, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: width - (2 * PLY_16) }
    });

    // 3. Top Consruction
    if (isKitchen) {
        // Kitchen: 2x Full Top Panels for Granite Support (40mm thickness target)
        panels.push({
            id: 'top_panel_kitchen',
            name: 'Top Panel (Granite Support)',
            qty: 2, // Double layer
            length: width - (2 * PLY_16),
            width: depth,
            thickness: PLY_16,
            materialId: MAT_CORE,
            isRotatable: true,
            edgeBanding: { length: width - (2 * PLY_16) }
        });
    } else {
        // Standard: Top Rails
        panels.push({
            id: 'top_rail', name: 'Top Rail', qty: 2,
            length: width - (2 * PLY_16), width: 100, thickness: PLY_16, materialId: MAT_CORE,
            isRotatable: true, edgeBanding: { length: 0 }
        });
    }

    // 4. Shelf (Adj) (1 No) - Mandatory per user request
    panels.push({
        id: 'shelf', name: 'Shelf (Adj)', qty: 1,
        length: width - (2 * PLY_16) - 3, width: depth - 20, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: width - (2 * PLY_16) - 3 }
    });

    // 5. Back Panel (1 No)
    panels.push({
        id: 'back', name: 'Back Panel', qty: 1,
        length: height - (2 * PLY_16) + (2 * GROOVE) - 2,
        width: width - (2 * PLY_16) + (2 * GROOVE) - 2,
        thickness: BACK_6, materialId: MAT_BACK,
        isRotatable: true
    });

    // 6. Shutter (1 No)
    panels.push({
        id: 'shutter', name: 'Shutter', qty: 1,
        length: height - C_GAP, width: width - C_GAP, thickness: SHUTTER_THICKNESS, materialId: MAT_SHUTTER,
        isRotatable: false, edgeBanding: { length: (height * 2) + (width * 2) }
    });

    return panels;
};


/**
 * Calculates the BOM for a Wall Unit
 */
export const calculateWallUnitBOM = (width: number, height: number, depth: number): Panel[] => {
    const panels: Panel[] = [];

    // Wall unit has Top AND Bottom panels (Full box)

    // 1. Sides (2)
    panels.push({
        id: 'side', name: 'Side Panel', qty: 2,
        length: height, width: depth, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true,
        edgeBanding: { length: height } // Bottom edge visible? Front edge visible.
    });

    // 2. Top & Bottom (2)
    panels.push({
        id: 'top_bottom', name: 'Top/Bottom Panel', qty: 2,
        length: width - (2 * PLY_16), width: depth, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true,
        edgeBanding: { length: width - (2 * PLY_16) }
    });

    // 3. Back (1)
    panels.push({
        id: 'back', name: 'Back Panel', qty: 1,
        length: height - (2 * PLY_16) + (2 * GROOVE) - 2,
        width: width - (2 * PLY_16) + (2 * GROOVE) - 2,
        thickness: BACK_6, materialId: MAT_BACK,
        isRotatable: true
    });

    // 4. Shutter (1)
    panels.push({
        id: 'shutter', name: 'Shutter', qty: 1,
        length: height - C_GAP, width: width - C_GAP,
        thickness: SHUTTER_THICKNESS, materialId: MAT_SHUTTER,
        isRotatable: false,
        edgeBanding: { length: (height + width) * 2 }
    });

    return panels;
};

/**
 * Calculates BOM for Wardrobe (Hinged)
 */
export const calculateWardrobeBOM = (width: number, height: number, depth: number): { panels: Panel[], numDrawers: number } => {
    // Wardrobe base shell is similar to Wall Unit (Full Box)
    const panels = calculateWallUnitBOM(width, height, depth);

    // Add 4 Shelves (Standard)
    panels.push({
        id: 'shelf_int', name: 'Internal Shelf', qty: 4,
        length: width - (2 * PLY_16) - 3, width: depth - 20, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: width - (2 * PLY_16) - 3 }
    });

    // Calculate Number of Drawers (2 per ~3ft/900-1000mm)
    // 3ft (900) -> 2. 7ft (2100) -> 4. 9ft (2700) -> 6.
    // Formula: Round(Width / 1000) * 2?
    // 900/1000 = 1 * 2 = 2.
    // 2100/1000 = 2 * 2 = 4.
    // 2700/1000 = 3 * 2 = 6.
    // Works perfectly.
    const sets = Math.round(width / 1000);
    const numDrawers = Math.max(2, sets * 2); // Minimum 2

    // Add Drawer Panels (Box Construction)
    // Drawer Width Logic per User: Total Width / Num Drawers
    // We must deduct side gaps/clearance for the box to fit? 
    // "drawer width to be total width divided by number of drawers" - assume this is the allocated space.
    // Box Width = Allocated - (Clearance ~ 13mm*2 for channels = 26mm).
    // Let's assume the user rule defines the "Outer Width" of the drawer structure.

    const allocatedWidth = width / numDrawers;
    const dWidth = allocatedWidth - 26; // Channel clearance
    const dDepth = 500; // Standard depth
    const dHeight = 150; // Standard height

    for (let i = 0; i < numDrawers; i++) {
        // Drawer Bottom (6mm) - Updated per User Example
        panels.push({
            id: `drawer_bottom_${i}`, name: 'Drawer Bottom', qty: 1,
            length: dWidth, width: dDepth, thickness: BACK_6, materialId: MAT_BACK,
            isRotatable: true, edgeBanding: { length: 0 }
        });
        // Drawer Sides (2) - 16mm
        panels.push({
            id: `drawer_side_${i}`, name: 'Drawer Side', qty: 2,
            length: dDepth, width: dHeight, thickness: PLY_16, materialId: MAT_CORE,
            isRotatable: true, edgeBanding: { length: dDepth }
        });
        // Drawer Front/Back (2) - 16mm
        panels.push({
            id: `drawer_fb_${i}`, name: 'Drawer Front/Back', qty: 2,
            length: dWidth - (2 * PLY_16), width: dHeight, thickness: PLY_16, materialId: MAT_CORE,
            isRotatable: true, edgeBanding: { length: dWidth }
        });
    }

    return { panels, numDrawers };
};

/**
 * Calculates BOM for Loft Frame (Shutter + 100mm Strips)
 */
export const calculateLoftFrameBOM = (width: number, height: number): Panel[] => {
    const panels: Panel[] = [];
    const FRAME_WIDTH = 100; // 100mm Framing

    // 1. Top & Bottom Frame (Full Width)
    panels.push({
        id: 'frame_horz', name: 'Frame Top/Bottom', qty: 2,
        length: width, width: FRAME_WIDTH, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: width } // Front edge
    });

    // 2. Side Frames (Height - 2*Thickness? Or Full Height? Let's fit between T/B)
    // Actually for Lofts, usually full rectangular frame screwed to wall. 
    // Let's do Verticals between HorizontalsCost wise negligible difference.
    panels.push({
        id: 'frame_vert', name: 'Frame Side', qty: 2,
        length: height - (2 * PLY_16), width: FRAME_WIDTH, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: height }
    });

    // 3. Shutter (Full Front)
    panels.push({
        id: 'shutter', name: 'Shutter', qty: 1,
        length: height - C_GAP, width: width - C_GAP,
        thickness: SHUTTER_THICKNESS, materialId: MAT_SHUTTER,
        isRotatable: false,
        edgeBanding: { length: (height + width) * 2 }
    });

    return panels;
};

/**
 * Calculates BOM for Loft Base (Loft Frame + Full Bottom Panel)
 */
export const calculateLoftBaseBOM = (width: number, height: number, depth: number): Panel[] => {
    const panels: Panel[] = [];
    const FRAME_WIDTH = 100; // 100mm Framing

    // 1. Top Frame (Horizontal Strip)
    panels.push({
        id: 'frame_top', name: 'Frame Top', qty: 1,
        length: width, width: FRAME_WIDTH, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: width }
    });

    // 2. Full Bottom Panel (The "Base")
    panels.push({
        id: 'bottom', name: 'Bottom Panel', qty: 1,
        length: width, width: depth, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: width + (2 * depth) } // Visible front + sides?
    });

    // 3. Side Frames
    panels.push({
        id: 'frame_vert', name: 'Frame Side', qty: 2,
        length: height - (2 * PLY_16), width: FRAME_WIDTH, thickness: PLY_16, materialId: MAT_CORE,
        isRotatable: true, edgeBanding: { length: height }
    });

    // 4. Shutter (Full Front)
    panels.push({
        id: 'shutter', name: 'Shutter', qty: 1,
        length: height - C_GAP, width: width - C_GAP,
        thickness: SHUTTER_THICKNESS, materialId: MAT_SHUTTER,
        isRotatable: false,
        edgeBanding: { length: (height + width) * 2 }
    });

    return panels;
};


/**
 * Main function to generate Unit object with Costs
 */
export const createUnit = (
    type: string,
    width: number,
    height: number,
    depth: number,
    accessories: Accessory[] = [],
    roomType: string = 'Other',
    shutterMaterialPrice: number = PRICING_CONSTANTS.shutterPlySheet,
    coreMaterialPrice: number = PRICING_CONSTANTS.corePlySheet // New Param
): Unit => {
    let panels: Panel[] = [];
    let numDrawers = 0;

    // Determine Panel Generation Strategy
    const lowerType = type.toLowerCase();

    // Check if it's a Kitchen Room for special Top Panel logic
    const isKitchen = roomType.toLowerCase().includes('kitchen');

    // Routing Logic
    if (lowerType.includes('loft') && (lowerType.includes('frame') || lowerType.includes('base'))) {
        // "Loft Frame" -> Frame Only
        if (lowerType.includes('frame')) {
            panels = calculateLoftFrameBOM(width, height);
        } else if (lowerType.includes('base')) {
            // "Loft Base" -> Frame + Bottom Panel
            panels = calculateLoftBaseBOM(width, height, depth);
        } else {
            // Fallback (shouldn't happen with current routing)
            panels = calculateWallUnitBOM(width, height, depth);
        }
    } else if (lowerType.includes('base') || lowerType.includes('drawer')) {
        panels = calculateBaseUnitBOM(width, height, depth, isKitchen);
        if (lowerType.includes('drawer')) {
            numDrawers = 2;
        }
    } else if (lowerType.includes('wall')) {
        panels = calculateWallUnitBOM(width, height, depth);
        panels.push({
            id: 'shelf_wall', name: 'Shelf (Adj)', qty: 1,
            length: width - (2 * PLY_16) - 3, width: depth - 20, thickness: PLY_16, materialId: MAT_CORE,
            isRotatable: true, edgeBanding: { length: width - (2 * PLY_16) - 3 }
        });
    } else if (lowerType.includes('wardrobe')) {
        const res = calculateWardrobeBOM(width, height, depth);
        panels = res.panels;
        numDrawers = res.numDrawers;
    } else {
        panels = calculateBaseUnitBOM(width, height, depth, isKitchen);
    }

    // Material Calculation
    let plywoodArea = 0;
    let backingArea = 0;
    let shutterArea = 0;

    panels.forEach(p => {
        const areaSqFt = (p.length * p.width * p.qty) / 92903; // mm2 to sqft

        // Core Material (16mm)
        if (p.thickness === 16 && p.id !== 'shutter') {
            plywoodArea += areaSqFt;
        }
        // Backing Material (6mm)
        else if (p.thickness === 6) {
            backingArea += areaSqFt;
        }
        // Shutter Material
        else if (p.id === 'shutter') {
            shutterArea += areaSqFt;
        }
    });

    // 1. Base Material Costs
    const coreCost = plywoodArea * (coreMaterialPrice / 32);
    const backCost = backingArea * (PRICING_CONSTANTS.backPlySheet / 32);
    const carcassLaminateCost = (plywoodArea * 2) * (PRICING_CONSTANTS.whiteLaminateSheet / 32);

    // Shutter Cost (Custom Price + Laminates)
    const shutterBasicCost = shutterArea * (shutterMaterialPrice / 32);
    const shutterLaminateCost = (shutterArea) * (PRICING_CONSTANTS.decorLaminateSheet / 32) +
        (shutterArea) * (PRICING_CONSTANTS.whiteLaminateSheet / 32);

    const totalMaterial = coreCost + backCost + carcassLaminateCost + shutterBasicCost + shutterLaminateCost;

    // 2. Base Hardware Cost (15% of Material) for Shell
    const baseHardwareCost = totalMaterial * 0.15;

    // 3. Base Labor Cost (Frontal Area)
    const frontalAreaSqFt = (width * height) / 92903;
    const baseLaborCost = frontalAreaSqFt * PRICING_CONSTANTS.labor.unitLaborPerSqFt;

    // 4. Atomic Drawer Costs (Hardware + Labor + Consumables)
    // Note: Drawer Material is ALREADY included in totalMaterial above via BOM panels.
    // We just need to add the fixed per-drawer add-ons.
    let drawerExtraCost = 0;
    if (numDrawers > 0) {
        const dw = PRICING_CONSTANTS.drawer;
        // Hardware + Labor + Consumables
        drawerExtraCost = numDrawers * (dw.hardware + dw.labor + dw.consumables);
    }

    // 5. Total Cost BEFORE Margin
    const rawCost = totalMaterial + baseLaborCost + baseHardwareCost + drawerExtraCost;

    // 6. Margin (60%)
    // Assuming MARGIN_MULTIPLIER is imported, else hardcode
    // Note: MARGIN_MULTIPLIER must be imported from constants.ts or redefined. 
    // It's not imported in the current logic block context, so using 1.60.
    const woodworkCostWithMargin = rawCost * 1.60;

    // Accessories Cost
    const accessoriesCost = accessories.reduce((sum, item) => sum + item.price, 0);
    const accessoriesCostWithMargin = accessoriesCost * 1.60;

    // Reporting Hardware Cost in Unit Object (Base + Drawer Extra Hardware)
    // Drawer Labor/Consumables conceptually sit in Labor/Hardware buckets.
    // For simple UI display:
    const totalHardwareDisplay = baseHardwareCost + (numDrawers * (PRICING_CONSTANTS.drawer.hardware + PRICING_CONSTANTS.drawer.consumables));

    return {
        id: Math.random().toString(36).substr(2, 9),
        roomId: 'temp',
        type,
        name: type,
        dimensions: { width, height, depth },
        accessories,
        panels,
        hardwareCost: totalHardwareDisplay,
        woodworkCost: woodworkCostWithMargin + accessoriesCostWithMargin
    };
};
