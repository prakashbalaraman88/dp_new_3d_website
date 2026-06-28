export type Dimension = number; // in mm

export interface Dimensions {
    width: Dimension;
    height: Dimension;
    depth: Dimension;
}

export interface Panel {
    id: string;
    name: string;
    length: number;
    width: number;
    thickness: number;
    materialId: string;
    qty: number;
    isRotatable: boolean;
    edgeBanding?: {
        length: number; // typically sum of exposed edges
    };
}

export interface Accessory {
    id: string;
    category: string; // e.g., "Innotech_Drawers"
    name: string;
    brand: string;
    price: number;
    unit: string; // "set", "nos", "pair"
}

export interface Unit {
    id: string;
    roomId: string; // Which room instance this belongs to
    type: string; // "Base_Unit", "Wall_Unit", etc. (from images)
    name: string; // User friendly name e.g. "Sink Unit"
    dimensions: Dimensions;

    // Instance specific overrides
    selectedShutterMaterial?: string;
    selectedCoreMaterial?: string;

    accessories: Accessory[]; // Added accessories

    // Calculated
    panels: Panel[];
    hardwareCost: number; // Base hardware (hinges/channels) NOT accessories
    woodworkCost: number; // Material + Labor
}

export interface Room {
    id: string;
    type: string; // "Kitchen", "Master_Bedroom" (from images)
    name: string; // "Kitchen 1"
    units: Unit[];
}

export interface Project {
    clientName: string;
    siteDetails: {
        location: string;
        floor: string;
    };
    globalSettings: {
        coreMaterial: string; // "BWR Ply - 18mm" etc
        shutterMaterial: string; // "MDF - Acrylic"
        finish: string;
    };
    rooms: Room[];
}

// Data Structure Types (for Constants)
export interface UnitTypeDefinition {
    id: string;
    label: string;
    defaultDepth: number;
    defaultHeight: number;
}

export interface RoomTypeDefinition {
    id: string;
    label: string;
    allowedUnits: string[]; // List of Unit Type IDs
}

export interface MaterialPrice {
    id: string;
    name: string;
    pricePerSheet: number; // or per sqft if raw
    sheetSize?: { width: number, height: number };
}
