import { Accessory } from './types';

// ==========================================
// 1. ROOM TYPES
// Derived from Image 1
// ==========================================
export const ROOM_TYPES: string[] = [
    "Kitchen",
    "Utility",
    "Master_Bedroom",
    "Children_Bedroom",
    "Guest_Bedroom",
    "Study_Room",
    "Bedroom_Other",
    "Master_Bathroom",
    "Children_Bathroom",
    "Guest_Bathroom",
    "Common_Bathroom",
    "Handwash_Area",
    "Bathroom_Other",
    "Dining_Room",
    "Living_Room",
    "Family_Room",
    "Foyer",
    "Pooja",
    "Others"
];

// ==========================================
// 2. UNIT TYPES PER ROOM
// Derived from Image 2 & 3
// Note: This is a mapping of Room -> Allowed Units
// ==========================================
export const ROOM_UNIT_MAPPINGS: Record<string, string[]> = {
    "Kitchen": [
        "Base_Unit", "Base_Drawer_Unit", "Wall_Unit", "Tall_Unit", "Open_Unit",
        "Loft_frame", "Loft_Base", "Top_Panel", "Shelves", "Paneling",
        "Visible_Panel", "Filler", "Gola_Profile"
    ],
    "Utility": [
        "Base_Unit", "Wall_Unit", "Open_Unit", "Loft_frame", "Loft_Base",
        "Tall_Unit", "Top_Panel", "Shelves", "Paneling", "Visible_Panel",
        "Filler", "Gola_Profile"
    ],
    "Master_Bedroom": [
        "Wardrobe_Hinged", "Wardrobe_Sliding_2_Door", "Wardrobe_Sliding_3_Door",
        "Wardrobe_F2C", "Loft_Base", "Loft Frame", "Open_Unit", "Top_Panel",
        "Shelves", "Paneling", "Dresser_mirror_unit", "Dresser_drawer_unit",
        "Dresser_Shutter_Unit", "Study_Ledge", "Study_Shutter_Unit",
        "Study_Table_Drawer", "Study_wall_unit", "Entertainment_Drawer_unit",
        "Entertainment_Shutter_unit", "Entertainment_Wall_unit", "Gola_Profile"
    ],
    // ... (We will map others similarly as needed, or use a generic Bedroom set if they overlap heavily)
    "Children_Bedroom": [
        "Wardrobe_Hinged", "Wardrobe_Sliding_2_Door", "Wardrobe_Sliding_3_Door",
        "Wardrobe_F2C", "Loft_Base", "Loft Frame", "Open_Unit", "Top_Panel",
        "Shelves", "Paneling", "Dresser_mirror_unit", "Dresser_drawer_unit",
        "Dresser_Shutter_Unit", "Study_Ledge", "Study_Shutter_Unit",
        "Study_Table_Drawer", "Study_wall_unit", "Entertainment_Drawer_unit",
        "Entertainment_Shutter_unit", "Entertainment_Wall_unit", "Gola_Profile"
    ],
    "Guest_Bedroom": [
        "Wardrobe_Hinged", "Wardrobe_Sliding_2_Door", "Wardrobe_Sliding_3_Door",
        "Wardrobe_F2C", "Loft_Base", "Loft Frame", "Open_Unit", "Top_Panel",
        "Shelves", "Paneling", "Dresser_mirror_unit", "Dresser_drawer_unit",
        "Dresser_Shutter_Unit", "Study_Ledge", "Study_Shutter_Unit",
        "Study_Table_Drawer", "Study_wall_unit", "Entertainment_Drawer_unit",
        "Entertainment_Shutter_unit", "Entertainment_Wall_unit", "Gola_Profile"
    ],
    "Living_Room": [
        "Entertainment_Shutter_Unit", "Entertainment_Drawer_unit", "Entertainment_Wall_unit",
        "Open_Unit", "Top_Panel", "Shelves", "Paneling", "Loft_Base", "Loft_Frame", "Gola_Profile"
    ]
    // Add others as encountered
};


// ==========================================
// 3. ACCESSORIES CATALOG
// Derived from Image 4
// ==========================================
export const ACCESSORIES_CATALOG: Record<string, Accessory[]> = {
    "Flap_Up": [
        { id: "flap_basic", category: "Flap_Up", name: "Flap stay Basic - 3.2KG (Set of 2)", price: 314, brand: "Hettich", unit: "set" },
        { id: "lift_fly", category: "Flap_Up", name: "Lift Up Fly", price: 6280, brand: "Hettich", unit: "nos" },
        { id: "adv_lift", category: "Flap_Up", name: "Advance lift up", price: 10526, brand: "Hettich", unit: "nos" },
    ],
    "Sliding_Mechanism": [
        { id: "topline_2_door", category: "Sliding_Mechanism", name: "Topline 22 - 2 Door", price: 12543, brand: "Hettich", unit: "set" },
        { id: "topline_3_door", category: "Sliding_Mechanism", name: "Topline 22 - 3 Door", price: 14193, brand: "Hettich", unit: "set" },
        { id: "topline_2_prof", category: "Sliding_Mechanism", name: "Topline 22 - 2 Door - Profile Door", price: 22543, brand: "Hettich", unit: "set" },
        { id: "topline_3_prof", category: "Sliding_Mechanism", name: "Topline 22 - 3 Door - Profile Door", price: 24193, brand: "Hettich", unit: "set" },
    ],
    "Innotech_Drawers": [
        { id: "inno_470_30", category: "Innotech_Drawers", name: "Innotech 470mm (30KG)", price: 4926, brand: "Hettich", unit: "set" },
        { id: "inno_470_50", category: "Innotech_Drawers", name: "Innotech 470mm (50KG)", price: 5912, brand: "Hettich", unit: "set" },
        { id: "inno_gal_470_30", category: "Innotech_Drawers", name: "Innotech with Gallery 470mm (30KG)", price: 5666, brand: "Hettich", unit: "set" },
        { id: "inno_gal_470_50", category: "Innotech_Drawers", name: "Innotech with Gallery 470mm (50KG)", price: 6652, brand: "Hettich", unit: "set" },
        { id: "inno_int_470_30", category: "Innotech_Drawers", name: "Internal Innotech 470mm (30KG)", price: 7890, brand: "Hettich", unit: "set" },
        { id: "inno_int_gal_470_30", category: "Innotech_Drawers", name: "Internal Innotech with Gallery 470mm (30KG)", price: 12217, brand: "Hettich", unit: "set" },
    ],
    "Innotech_Accessories": [
        { id: "orgatray_450", category: "Innotech_Accessories", name: "OrgaTray Basic (450mm)", price: 561, brand: "Hettich", unit: "nos" },
        { id: "orgatray_500", category: "Innotech_Accessories", name: "OrgaTray Basic (500mm)", price: 621, brand: "Hettich", unit: "nos" },
        { id: "orgatray_600", category: "Innotech_Accessories", name: "OrgaTray Basic (600mm)", price: 739, brand: "Hettich", unit: "nos" },
        { id: "orgatray_900", category: "Innotech_Accessories", name: "OrgaTray Basic (900mm)", price: 1488, brand: "Hettich", unit: "nos" },
        // ... adding key items
    ],
    "Corner_Units": [
        { id: "d_tray_1100", category: "Corner_Units", name: "D Tray (1100mm)", price: 8543, brand: "Everyday", unit: "nos" },
        { id: "moving_blind", category: "Corner_Units", name: "Moving Blind Corner", price: 40132, brand: "Hettich", unit: "nos" },
        { id: "c_carousel_800", category: "Corner_Units", name: "C - Carousel (800mm)", price: 29022, brand: "Hettich", unit: "nos" },
    ],
    "Pullout": [
        { id: "detergent", category: "Pullout", name: "Detergent Holder", price: 2325, brand: "Hettich", unit: "nos" },
        { id: "bot_2_150", category: "Pullout", name: "Bottle Pullout - 2 Tier (150mm)", price: 9487, brand: "Hettich", unit: "nos" },
        { id: "bot_2_200", category: "Pullout", name: "Bottle Pullout - 2 Tier (200mm)", price: 10948, brand: "Hettich", unit: "nos" },
        { id: "bot_3_200", category: "Pullout", name: "Bottle Pullout - 3 Tier (200mm)", price: 11948, brand: "Hettich", unit: "nos" },
    ],
    "Wicker_Baskets": [
        { id: "wick_120_450", category: "Wicker_Baskets", name: "Wicker Basket 120 depth (450mm)", price: 10720, brand: "Hettich", unit: "nos" }, // Approx mapping 400->450 based on img? Image says 400
        { id: "wick_120_400", category: "Wicker_Baskets", name: "Wicker Basket 120 depth (400mm)", price: 10720, brand: "Hettich", unit: "nos" },
        { id: "wick_120_600", category: "Wicker_Baskets", name: "Wicker Basket 120 depth (600mm)", price: 11757, brand: "Hettich", unit: "nos" },
    ],
    "Tall_Unit_Accessories": [
        { id: "cargo_duo_4_450", category: "Tall_Unit_Accessories", name: "Cargo Duo 4 Tier (450mm)", price: 58680, brand: "Hettich", unit: "nos" },
        { id: "cargo_duo_6_600", category: "Tall_Unit_Accessories", name: "Cargo Duo 6 Tier (600mm)", price: 60572, brand: "Hettich", unit: "nos" },
    ],
    "Stainless_Steel_Baskets": [
        { id: "dish_drainer_600", category: "Stainless_Steel_Baskets", name: "Dish Drainer Set (600mm)", price: 5226, brand: "Hettich", unit: "nos" },
        { id: "plain_600", category: "Stainless_Steel_Baskets", name: "Plain Basket (600mm)", price: 3015, brand: "Hettich", unit: "nos" },
        { id: "thali_600", category: "Stainless_Steel_Baskets", name: "Thali Inlet (600mm)", price: 3276, brand: "Hettich", unit: "nos" },
        { id: "cup_saucer_600", category: "Stainless_Steel_Baskets", name: "Cup and Saucer Basket (600mm)", price: 3401, brand: "Hettich", unit: "nos" },
    ],
    "Waste_Bin": [
        { id: "waste_classic", category: "Waste_Bin", name: "Waste-Bin Classic Autolid", price: 4019, brand: "Hettich", unit: "nos" },
    ]
};

// ==========================================
// 4. MATERIAL STANDARDS (Instruction MD)
// ==========================================
export const DEFAULT_DIMENSIONS = {
    kitchenBaseDepth: 560,
    kitchenWallDepth: 350,
    wardrobeDepth: 600,
    plyThickness: 16,
    backThickness: 6,
    shutterThickness: 16, // Updated to 16mm
    skirtingHeight: 100,
    counterTopThickness: 40
};

export const PRICING_CONSTANTS = {
    // These are estimates, would need real sheet prices
    corePlySheet: 3200, // 16mm BWR (Approx ₹100/sqft)
    backPlySheet: 1200, // 6mm (Approx ₹37.5/sqft)
    shutterPlySheet: 3200, // Updated to 16mm (Same as Core)
    whiteLaminateSheet: 600, // Internal 0.8mm
    decorLaminateSheet: 2000, // External 1mm
    edgeBandRoll: 1200,

    labor: {
        unitLaborPerSqFt: 250 // Per Frontal SqFt (W*H)
    },

    // Detailed Drawer Costs (Per Drawer)
    drawer: {
        hardware: 1030, // Channel (650) + Handle (200) + Lock (180)
        labor: 500,     // Making + Fitting
        consumables: 150 // Glue, Screws, etc
    }
};

export const MARGIN_MULTIPLIER = 1.60; // 60% Margin

export const SHUTTER_OPTIONS = [
    { id: 'laminate_hgloss', name: 'Laminate - High Gloss', priceMod: 0, materialPrice: 3200 }, // Base 16mm Ply price
    { id: 'laminate_suede', name: 'Laminate - Suede/Matt', priceMod: 0, materialPrice: 3200 },
    { id: 'acrylic_action', name: 'Acrylic - Action Tesa', priceMod: 1500, materialPrice: 5500 }, // Higher sheet price
    { id: 'acrylic_rehau', name: 'Acrylic - Rehau', priceMod: 3000, materialPrice: 8500 },
    { id: 'pu_matt', name: 'PU - Matt Finish', priceMod: 4500, materialPrice: 9500 },
    { id: 'pu_gloss', name: 'PU - High Gloss', priceMod: 5500, materialPrice: 10500 }
];

export const CORE_OPTIONS = [
    { id: 'bwr_3200', name: 'BWR Plywood (Standard)', price: 3200 },
    { id: 'mr_2600', name: 'MR Plywood (Commercial)', price: 2600 },
    { id: 'bwp_3800', name: 'BWP Plywood (Waterproof)', price: 3800 },
    { id: 'hdhmr_3000', name: 'HDHMR (High Moisture Res.)', price: 3000 }
];
