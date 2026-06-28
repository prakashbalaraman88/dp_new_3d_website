export const CONSTRUCTION_TIERS = {
    civitas: {
        id: 'civitas',
        name: 'Civitas (Economy)',
        basePricePerSqft: 1900,
        description: 'Foundation package for rental units and investors. Focus on durability and cost-efficiency.',
        color: 'from-gray-400 to-gray-600',
    },
    urbane: {
        id: 'urbane',
        name: 'Urbane (Core)',
        basePricePerSqft: 2250,
        description: 'Standard package for modern families. Balance of longevity and aesthetics.',
        color: 'from-cyan-400 to-cyan-600',
    },
    metro: {
        id: 'metro',
        name: 'Metro (Prime)',
        basePricePerSqft: 2850,
        description: 'Aspirational package with branded finishes and superior design identity.',
        color: 'from-blue-400 to-blue-600',
    },
    cosmo: {
        id: 'cosmo',
        name: 'Cosmo (Elite)',
        basePricePerSqft: 3390,
        description: 'Entry-luxury with automation, premium surfaces, and grander heights.',
        color: 'from-violet-400 to-violet-600',
    },
    regal: {
        id: 'regal',
        name: 'Regal (Signature)',
        basePricePerSqft: 3950,
        description: 'Luxury package with imported materials, VRV provisions, and dry cladding.',
        color: 'from-amber-400 to-amber-600',
    },
    veridia: {
        id: 'veridia',
        name: 'Veridia (Sustainable)',
        basePricePerSqft: 4350,
        description: 'Eco-conscious luxury with sustainable materials, solar power, and rainwater harvesting.',
        color: 'from-emerald-500 to-teal-600',
    },
    imperial: {
        id: 'imperial',
        name: 'Imperial (Grandeur)',
        basePricePerSqft: 5200,
        description: 'Super-luxury with pool, lift, and integrated high-end automation.',
        color: 'from-emerald-400 to-emerald-600',
    },
    sovereign: {
        id: 'sovereign',
        name: 'Sovereign (Estate)',
        basePricePerSqft: 7500,
        description: 'Bespoke package for ultra-luxury villas with limitless customization.',
        color: 'from-rose-400 to-rose-600',
        image: '/assets/images/tiers/sovereign.png'
    },
};

export const TIER_RANKS: Record<string, number> = {
    civitas: 1,
    urbane: 2,
    metro: 3,
    cosmo: 4,
    regal: 5,
    veridia: 6,
    imperial: 7,
    sovereign: 8
};

export interface MaterialOption {
    value: string;
    label: string;
    tier: string;
    priceMod: number;
    modType: 'per_sqft' | 'lump_sum';
    walletAmount?: number;
}

export interface MaterialItem {
    id: string;
    label: string;
    options: MaterialOption[];
}

export interface MaterialCategory {
    id: string;
    title: string;
    items: MaterialItem[];
}

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
    {
        id: 'structure',
        title: 'Structure & Civil',
        items: [
            {
                id: 'steel',
                label: 'Steel Reinforcement',
                options: [
                    { value: 'fe550d_primary', label: 'Fe 550D (JSW/Tata) - Primary', tier: 'metro', priceMod: 0, modType: 'per_sqft' },
                    { value: 'fe550_secondary', label: 'Fe 550 (Indus/Sunvik)', tier: 'urbane', priceMod: -20, modType: 'per_sqft' },
                    { value: 'fe500_secondary', label: 'Fe 500 (Kamdhenu/Meenakshi)', tier: 'civitas', priceMod: -70, modType: 'per_sqft' },
                ],
            },
            {
                id: 'cement',
                label: 'Cement Grade',
                options: [
                    { value: 'opc53_concrete', label: 'OPC 53 (Concrete) / PPC (Masonry)', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                    { value: 'ppc_green', label: 'Sustainable PPC (Fly Ash Based)', tier: 'veridia', priceMod: 0, modType: 'per_sqft' },
                    { value: 'ppc_all', label: 'PPC for All Works', tier: 'civitas', priceMod: -20, modType: 'per_sqft' },
                ],
            },
            {
                id: 'blocks',
                label: 'Wall Blocks',
                options: [
                    { value: 'aac_blocks', label: 'AAC Blocks (Thermal Efficient)', tier: 'veridia', priceMod: 10, modType: 'per_sqft' },
                    { value: 'avs_factory', label: 'Factory Made AVS/Aapco Blocks', tier: 'regal', priceMod: 25, modType: 'per_sqft' },
                    { value: 'solid_prem', label: 'Premium Solid Concrete Blocks', tier: 'metro', priceMod: 10, modType: 'per_sqft' },
                    { value: 'solid_std', label: 'Standard Solid Blocks', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                    { value: 'local_solid', label: 'Local Solid Blocks', tier: 'civitas', priceMod: -15, modType: 'per_sqft' },
                ],
            },
            {
                id: 'sump',
                label: 'Underground Sump',
                options: [
                    { value: 'sump_12k', label: '12,000 Liters (RCC + Waterproof)', tier: 'sovereign', priceMod: 200000, modType: 'lump_sum' },
                    { value: 'sump_10k', label: '10,000 Liters (RCC)', tier: 'imperial', priceMod: 150000, modType: 'lump_sum' },
                    { value: 'sump_8k', label: '8,000 Liters (RCC)', tier: 'regal', priceMod: 50000, modType: 'lump_sum' },
                    { value: 'sump_rain', label: '8,000 Liters + Bio-Filter', tier: 'veridia', priceMod: 95000, modType: 'lump_sum' },
                    { value: 'sump_6k', label: '6,000 Liters (Solid Block)', tier: 'metro', priceMod: 40000, modType: 'lump_sum' },
                    { value: 'sump_4k', label: '4,000 Liters (Solid Block)', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ],
            },
        ],
    },
    {
        id: 'waterproofing',
        title: 'Waterproofing & Drainage',
        items: [
            {
                id: 'terrace_waterproof',
                label: 'Terrace Waterproofing',
                options: [
                    { value: 'insulation_membrane', label: 'Fosroc Membrane + Heat Insulation', tier: 'sovereign', priceMod: 65, modType: 'per_sqft' },
                    { value: 'pu_coating', label: 'Polyurethane (PU) Coating', tier: 'imperial', priceMod: 45, modType: 'per_sqft' },
                    { value: 'solar_reflective', label: 'Solar Reflective Coating (SRI)', tier: 'veridia', priceMod: 50, modType: 'per_sqft' },
                    { value: 'stp_membrane', label: 'STP Membrane System', tier: 'regal', priceMod: 35, modType: 'per_sqft' },
                    { value: 'dr_fixit', label: 'Dr. Fixit 2-Coat System', tier: 'metro', priceMod: 20, modType: 'per_sqft' },
                    { value: 'basic_proof', label: 'Basic Acrylic Coating', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                    { value: 'bitumen', label: 'Bitumen/Tar Coating', tier: 'civitas', priceMod: -15, modType: 'per_sqft' },
                ],
            },
        ]
    },
    {
        id: 'finishes',
        title: 'Wall Finishes & Painting',
        items: [
            {
                id: 'int_paint',
                label: 'Internal Wall Paint',
                options: [
                    { value: 'royal_texture', label: 'Royale Luxury + 1 Texture Wall', tier: 'regal', priceMod: 20, modType: 'per_sqft' },
                    { value: 'low_voc', label: 'Low VOC Non-Toxic Paint (Asian/Dulux)', tier: 'veridia', priceMod: 80, modType: 'per_sqft' },
                    { value: 'royal_lux', label: 'Royale Luxury / Velvet Touch', tier: 'cosmo', priceMod: 10, modType: 'per_sqft' },
                    { value: 'prem_emulsion', label: 'Premium Emulsion (Apcolite)', tier: 'metro', priceMod: 0, modType: 'per_sqft' },
                    { value: 'tractor_emul', label: 'Tractor Emulsion (Standard)', tier: 'urbane', priceMod: -18, modType: 'per_sqft' },
                    { value: 'distemper', label: 'Distemper / Whitewash', tier: 'civitas', priceMod: -60, modType: 'per_sqft' },
                ],
            },
            {
                id: 'ext_paint',
                label: 'External Paint',
                options: [
                    { value: 'apex_ultima', label: 'Apex Ultima (Protek)', tier: 'cosmo', priceMod: 25, modType: 'per_sqft' },
                    { value: 'heat_shield', label: 'Heat Shield / Cool Roof Paint', tier: 'veridia', priceMod: 30, modType: 'per_sqft' },
                    { value: 'apex_std', label: 'Apex Exterior Emulsion', tier: 'metro', priceMod: 0, modType: 'per_sqft' },
                    { value: 'ace_ext', label: 'Ace Exterior Emulsion', tier: 'urbane', priceMod: -15, modType: 'per_sqft' },
                    { value: 'cement_paint', label: 'Cement Primer / Paint', tier: 'civitas', priceMod: -30, modType: 'per_sqft' },
                ],
            }
        ]
    },
    {
        id: 'flooring',
        title: 'Flooring & Tiling',
        items: [
            {
                id: 'floor_living',
                label: 'Living/Dining Flooring',
                options: [
                    { value: 'italian_rare', label: 'Rare Italian Marble / Onyx (Wallet: ₹1500)', tier: 'sovereign', priceMod: 650, modType: 'per_sqft', walletAmount: 1500 },
                    { value: 'italian_statuario', label: 'Italian Statuario (Wallet: ₹700)', tier: 'imperial', priceMod: 250, modType: 'per_sqft', walletAmount: 700 },
                    { value: 'italian_premium', label: 'Premium Italian Marble (Wallet: ₹300)', tier: 'regal', priceMod: 240, modType: 'per_sqft', walletAmount: 300 },
                    { value: 'natural_stone', label: 'Natural Kota/Jaisalmer Stone (Wallet: ₹180)', tier: 'veridia', priceMod: 180, modType: 'per_sqft', walletAmount: 180 },
                    { value: 'italian_basic', label: 'Basic Italian / High Gloss (Wallet: ₹250)', tier: 'cosmo', priceMod: 60, modType: 'per_sqft', walletAmount: 250 },
                    { value: 'large_gvt', label: 'Large GVT 6x4 (Wallet: ₹120)', tier: 'metro', priceMod: 10, modType: 'per_sqft', walletAmount: 120 },
                    { value: 'double_charged', label: 'Double Charged Vitrified (Wallet: ₹80)', tier: 'urbane', priceMod: 10, modType: 'per_sqft', walletAmount: 80 },
                    { value: 'vitrified_basic', label: 'Standard Vitrified (Wallet: ₹55)', tier: 'civitas', priceMod: 0, modType: 'per_sqft', walletAmount: 55 },
                ],
            },
            {
                id: 'floor_bedroom',
                label: 'Bedroom Flooring',
                options: [
                    { value: 'teak_floor', label: 'Solid Teak Wood Flooring (Wallet: ₹350)', tier: 'regal', priceMod: 500, modType: 'per_sqft', walletAmount: 350 },
                    { value: 'bamboo_floor', label: 'Sustainable Bamboo Flooring (Wallet: ₹200)', tier: 'veridia', priceMod: 350, modType: 'per_sqft', walletAmount: 200 },
                    { value: 'eng_wood', label: 'Engineered Wooden Flooring (Wallet: ₹150)', tier: 'cosmo', priceMod: 230, modType: 'per_sqft', walletAmount: 150 },
                    { value: 'gvt_wood', label: 'Wooden Finish/GVT Tiles (Wallet: ₹150)', tier: 'metro', priceMod: 100, modType: 'per_sqft', walletAmount: 150 },
                    { value: 'vitrified', label: 'Regular Vitrified Tiles', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                ],
            },
            {
                id: 'floor_kitchen',
                label: 'Kitchen Flooring',
                options: [
                    { value: 'anti_skid_prem', label: 'Premium Anti-Skid GVT (Wallet: ₹100)', tier: 'metro', priceMod: 45, modType: 'per_sqft', walletAmount: 100 },
                    { value: 'anti_skid_std', label: 'Standard Anti-Skid Ceramic (Wallet: ₹55)', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                ],
            }
        ],
    },
    {
        id: 'bath_flooring',
        title: 'Bathroom Tiling',
        items: [
            {
                id: 'bath_wall',
                label: 'Bathroom Wall Tiles',
                options: [
                    { value: 'imp_slab', label: 'Imported Large Slabs (Wallet: ₹350)', tier: 'sovereign', priceMod: 300, modType: 'per_sqft', walletAmount: 350 },
                    { value: 'italian_tile', label: 'High-End Italian Tiles (Wallet: ₹200)', tier: 'imperial', priceMod: 150, modType: 'per_sqft', walletAmount: 200 },
                    { value: 'designer_gvt', label: 'Designer GVT / Marble Look (Wallet: ₹120)', tier: 'cosmo', priceMod: 50, modType: 'per_sqft', walletAmount: 120 },
                    { value: 'gvt_prem', label: 'Premium GVT 4x2 (Wallet: ₹100)', tier: 'metro', priceMod: 50, modType: 'per_sqft', walletAmount: 100 },
                    { value: 'ceramic_prem', label: 'Premium Ceramic 2x1 (Wallet: ₹55)', tier: 'urbane', priceMod: 0, modType: 'per_sqft', walletAmount: 55 },
                    { value: 'ceramic_std', label: 'Standard Ceramic (Wallet: ₹40)', tier: 'civitas', priceMod: -15, modType: 'per_sqft', walletAmount: 40 },
                ],
            },
            {
                id: 'bath_floor',
                label: 'Bathroom Floor Tiles',
                options: [
                    { value: 'marble_floor', label: 'Anti-Skid Marble/Granite (Wallet: ₹150)', tier: 'regal', priceMod: 100, modType: 'per_sqft', walletAmount: 150 },
                    { value: 'gvt_floor', label: 'Anti-Skid GVT (Wallet: ₹100)', tier: 'metro', priceMod: 45, modType: 'per_sqft', walletAmount: 100 },
                    { value: 'ceramic_floor', label: 'Anti-Skid Ceramic (Wallet: ₹55)', tier: 'urbane', priceMod: 0, modType: 'per_sqft', walletAmount: 55 },
                ],
            }
        ]
    },
    {
        id: 'kitchen_bath',
        title: 'Kitchen & Bath Specs',
        items: [
            {
                id: 'kitchen_top',
                label: 'Kitchen Countertop',
                options: [
                    { value: 'imported_quartz', label: 'Prem. Quartz / Caesarstone (Wallet: ₹600)', tier: 'sovereign', priceMod: 550, modType: 'per_sqft', walletAmount: 600 },
                    { value: 'quartz_imperial', label: 'Premium Quartz (Wallet: ₹450)', tier: 'imperial', priceMod: 380, modType: 'per_sqft', walletAmount: 450 },
                    { value: 'imported_quartz_regal', label: 'Prem. Quartz / Caesarstone (Wallet: ₹350)', tier: 'regal', priceMod: 230, modType: 'per_sqft', walletAmount: 350 },
                    { value: 'recycled_glass', label: 'Recycled Glass / Eco-Top (Wallet: ₹280)', tier: 'veridia', priceMod: 200, modType: 'per_sqft', walletAmount: 280 },
                    { value: 'nano_white', label: 'Nano White / Quartz (Wallet: ₹180)', tier: 'metro', priceMod: 80, modType: 'per_sqft', walletAmount: 180 },
                    { value: 'granite_prem', label: 'Jet Black / Galaxy Granite (Wallet: ₹130)', tier: 'urbane', priceMod: 40, modType: 'per_sqft', walletAmount: 130 },
                    { value: 'granite_std', label: 'Standard Black Granite (Wallet: ₹100)', tier: 'civitas', priceMod: 0, modType: 'per_sqft', walletAmount: 100 },
                ],
            },
            {
                id: 'sink',
                label: 'Kitchen Sink',
                options: [
                    { value: 'sink_quartz', label: 'Quartz/Granite Sink (Franke/Carysil)', tier: 'cosmo', priceMod: 8000, modType: 'lump_sum' },
                    { value: 'sink_ss304_hand', label: 'Handmade SS 304 Sink', tier: 'metro', priceMod: 4000, modType: 'lump_sum' },
                    { value: 'sink_ss304', label: 'Standard SS 304 Sink', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ],
            },
        ]
    },
    {
        id: 'sustainability',
        title: 'Sustainability & Green Features',
        items: [
            {
                id: 'solar',
                label: 'Solar Power System',
                options: [
                    { value: 'solar_10kw', label: '10kW Hybrid System + Battery Backup', tier: 'sovereign', priceMod: 1000000, modType: 'lump_sum' },
                    { value: 'solar_5kw_hybrid', label: '5kW Hybrid System (Off-grid capable)', tier: 'imperial', priceMod: 300000, modType: 'lump_sum' },
                    { value: 'solar_5kw', label: '5kW On-Grid System', tier: 'veridia', priceMod: 350000, modType: 'lump_sum' },
                    { value: 'solar_3kw', label: '3kW On-Grid System', tier: 'cosmo', priceMod: 165000, modType: 'lump_sum' },
                    { value: 'solar_prov', label: 'Conduit Provision for Solar', tier: 'metro', priceMod: 15000, modType: 'lump_sum' },
                    { value: 'none', label: 'None', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ]
            },
            {
                id: 'rainwater',
                label: 'Rainwater Harvesting',
                options: [
                    { value: 'rwh_smart', label: 'Full Recycling + Smart Monitoring', tier: 'sovereign', priceMod: 180000, modType: 'lump_sum' },
                    { value: 'rwh_recycle', label: 'Full Recycling System (Tank + Filters)', tier: 'imperial', priceMod: 120000, modType: 'lump_sum' },
                    { value: 'rwh_adv', label: 'Advanced Dual-Filter System', tier: 'veridia', priceMod: 70000, modType: 'lump_sum' },
                    { value: 'rwh_basic', label: 'Basic Recharge Pit', tier: 'urbane', priceMod: 35000, modType: 'lump_sum' },
                ]
            }
        ]
    },
    {
        id: 'joinery',
        title: 'Mix: Doors & Windows',
        items: [
            {
                id: 'main_door',
                label: 'Main Door',
                options: [
                    { value: 'grand_teak', label: 'Grand 8ft Teak + Smart Lock (Allowed: ₹1.2L)', tier: 'cosmo', priceMod: 120000, modType: 'lump_sum' },
                    { value: 'burma_teak', label: 'Burma Teak Carved (Allowed: ₹45k)', tier: 'metro', priceMod: 45000, modType: 'lump_sum' },
                    { value: 'teak_veneer', label: 'Teak Frame + Veneer Shutter (Allowed: ₹25k)', tier: 'urbane', priceMod: 25000, modType: 'lump_sum' },
                    { value: 'sal_flush', label: 'Sal Wood + Flush Shutter (Allowed: ₹15k)', tier: 'civitas', priceMod: 15000, modType: 'lump_sum' },
                ],
            },
            {
                id: 'internal_doors',
                label: 'Internal / Room Doors',
                options: [
                    { value: 'full_teak_internal', label: '8ft Full Teak Internal Doors', tier: 'sovereign', priceMod: 100, modType: 'per_sqft' },
                    { value: 'designer_veneer', label: '8ft Designer Veneer Doors', tier: 'imperial', priceMod: 60, modType: 'per_sqft' },
                    { value: 'veneer_8ft', label: '8ft Teak Frame + Veneer Shutter', tier: 'regal', priceMod: 45, modType: 'per_sqft' },
                    { value: 'veneer_std', label: 'Teak Frame + Veneer Shutter', tier: 'cosmo', priceMod: 30, modType: 'per_sqft' },
                    { value: 'prem_skin', label: 'Sal Frame + Premium Skin/Lam', tier: 'metro', priceMod: 15, modType: 'per_sqft' },
                    { value: 'lam_flush', label: 'Sal Frame + Laminated Flush', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                    { value: 'paint_flush', label: 'Sal/Honne + Painted Flush', tier: 'civitas', priceMod: -10, modType: 'per_sqft' },
                ],
            },
            {
                id: 'windows',
                label: 'Windows',
                options: [
                    { value: 'schuco_alum', label: 'Schuco / Reynaers Slim (₹1100/sft)', tier: 'sovereign', priceMod: 900, modType: 'per_sqft' },
                    { value: 'alum_imperial', label: 'Premium System Aluminium (₹850/sft)', tier: 'imperial', priceMod: 600, modType: 'per_sqft' },
                    { value: 'wood_alum', label: 'Wood-Aluminium Composite (₹900/sft)', tier: 'veridia', priceMod: 850, modType: 'per_sqft' },
                    { value: 'sys_alum', label: 'System Aluminium / Prem UPVC (₹750/sft)', tier: 'cosmo', priceMod: 300, modType: 'per_sqft' },
                    { value: 'upvc_white', label: 'UPVC White Profile (₹550/sft)', tier: 'metro', priceMod: 250, modType: 'per_sqft' },
                    { value: 'alum_3track', label: '3-Track Aluminium (₹440/sft)', tier: 'urbane', priceMod: 300, modType: 'per_sqft' },
                    { value: 'alum_2track', label: '2-Track Aluminium (₹270/sft)', tier: 'civitas', priceMod: 220, modType: 'per_sqft' },
                ],
            }
        ],
    },
    {
        id: 'electrical',
        title: 'MEP - Electrical',
        items: [
            {
                id: 'wiring',
                label: 'Wiring & Switches',
                options: [
                    { value: 'auto_switches_prem', label: 'Centralized Lighting + Keypads', tier: 'sovereign', priceMod: 150, modType: 'per_sqft' },
                    { value: 'auto_switches', label: 'FRLS Wires + Touch/Glass Switches', tier: 'imperial', priceMod: 70, modType: 'per_sqft' },
                    { value: 'prem_mod', label: 'FRLS Wires + Prem. Modular (Legrand)', tier: 'metro', priceMod: 15, modType: 'per_sqft' },
                    { value: 'std_mod', label: 'FRLS Wires + Std. Modular (Anchor)', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                    { value: 'basic_wiring', label: 'Standard Wires + Piano/Basic Switches', tier: 'civitas', priceMod: -35, modType: 'per_sqft' },
                ],
            },
            {
                id: 'ev_charge',
                label: 'EV Charging',
                options: [
                    { value: 'ev_station', label: 'Fast EV Charging Station Installed', tier: 'veridia', priceMod: 65000, modType: 'lump_sum' },
                    { value: 'ev_point', label: 'EV Charging Point (15A Socket)', tier: 'metro', priceMod: 5000, modType: 'lump_sum' },
                    { value: 'none', label: 'None', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ]
            },
            {
                id: 'automation',
                label: 'Home Automation',
                options: [
                    { value: 'full_auto', label: 'Full Home Automation (Zigbee/KNX)', tier: 'imperial', priceMod: 100000, modType: 'lump_sum' },
                    { value: 'basic_auto', label: 'Basic Automation (Living/Master) - WiFi', tier: 'cosmo', priceMod: 30000, modType: 'lump_sum' },
                    { value: 'none', label: 'Standard Anchor/Legrand Switches', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ],
            },
        ],
    },
    {
        id: 'plumbing_mep',
        title: 'MEP - Plumbing',
        items: [
            {
                id: 'sanitary',
                label: 'Sanitary & CP Fittings (Wallet/1000sft)',
                options: [
                    { value: 'toto_auto', label: 'Toto Automatic / Gessi (₹3L Allowance)', tier: 'sovereign', priceMod: 250000, modType: 'lump_sum' },
                    { value: 'villeroy', label: 'Villeroy & Boch / Queo (₹1.2L Allowance)', tier: 'regal', priceMod: 100000, modType: 'lump_sum' },
                    { value: 'water_sense', label: 'WaterSense Fixtures (Low Flow) (₹1L)', tier: 'veridia', priceMod: 90000, modType: 'lump_sum' },
                    { value: 'kohler', label: 'Kohler / Grohe (₹1L Allowance)', tier: 'cosmo', priceMod: 100, modType: 'per_sqft' },
                    { value: 'jaguar_div', label: 'Jaguar w/ Diverters (₹60k Allowance)', tier: 'metro', priceMod: 30000, modType: 'lump_sum' },
                    { value: 'jaguar_std', label: 'Jaguar/Hindware (₹40k Allowance)', tier: 'urbane', priceMod: 40000, modType: 'lump_sum' },
                ],
            },
            {
                id: 'pipes',
                label: 'Piping System',
                options: [
                    { value: 'composite', label: 'Composite / PEX Piping (High Pressure)', tier: 'sovereign', priceMod: 40, modType: 'per_sqft' },
                    { value: 'pvc_recycle', label: 'HDPE / Recycled Content Piping', tier: 'veridia', priceMod: 15, modType: 'per_sqft' },
                    { value: 'silent_pipes', label: 'Low Noise/Silent Pipes (SWR)', tier: 'metro', priceMod: 10, modType: 'per_sqft' },
                    { value: 'std_pvc', label: 'Standard PVC/CPVC (Ashirvad)', tier: 'urbane', priceMod: 0, modType: 'per_sqft' },
                ],
            }
        ],
    },
    {
        id: 'fabrication',
        title: 'Fabrication',
        items: [
            {
                id: 'railings_stair',
                label: 'Staircase Railings',
                options: [
                    { value: 'cnc_brass', label: 'CNC Laser Cut Brass / PVD', tier: 'sovereign', priceMod: 250000, modType: 'lump_sum' },
                    { value: 'glass_rail', label: 'Toughened Glass Profile (₹1200/rft)', tier: 'regal', priceMod: 120000, modType: 'lump_sum' },
                    { value: 'ss_glass', label: 'SS + Glass Mix (₹850/rft)', tier: 'cosmo', priceMod: 85000, modType: 'lump_sum' },
                    { value: 'ss_304', label: 'SS 304 Railing (₹550/rft)', tier: 'metro', priceMod: 55000, modType: 'lump_sum' },
                    { value: 'ms_rail', label: 'MS Railing (₹280/rft)', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ],
            },
        ]
    },
    {
        id: 'site_works',
        title: 'External & Site Works',
        items: [
            {
                id: 'elevation',
                label: 'Elevation Cladding Allowance',
                options: [
                    { value: 'bespoke_zinc', label: 'Bespoke Zinc/Corten (₹8L+)', tier: 'sovereign', priceMod: 800000, modType: 'lump_sum' },
                    { value: 'cnc_stone', label: 'CNC Stone / Louvers (₹4.5L)', tier: 'imperial', priceMod: 450000, modType: 'lump_sum' },
                    { value: 'dry_stone', label: 'Dry Stone Cladding (₹2.5L)', tier: 'veridia', priceMod: 250000, modType: 'lump_sum' },
                    { value: 'hpl_clad', label: 'HPL / Granite Cladding (₹1.2L)', tier: 'regal', priceMod: 120000, modType: 'lump_sum' },
                    { value: 'stone_strips', label: 'Stone Strips / Texture (₹60k)', tier: 'cosmo', priceMod: 60000, modType: 'lump_sum' },
                    { value: 'tile_clad', label: 'Tile Cladding / Grooves (₹30k)', tier: 'metro', priceMod: 30000, modType: 'lump_sum' },
                    { value: 'basic_paint', label: 'Basic Paint (Included)', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ]
            },
            {
                id: 'parking_floor',
                label: 'Parking Flooring',
                options: [
                    { value: 'italian_paver', label: 'Imported Stone / Cobblestone', tier: 'sovereign', priceMod: 30000, modType: 'lump_sum' },
                    { value: 'granite_park', label: 'Granite Flooring', tier: 'cosmo', priceMod: 20000, modType: 'lump_sum' },
                    { value: 'grass_paver', label: 'Grass Pavers (Permeable)', tier: 'veridia', priceMod: 15000, modType: 'lump_sum' },
                    { value: 'kota_park', label: 'Kota Stone / Tiles', tier: 'metro', priceMod: 10000, modType: 'lump_sum' },
                    { value: 'cement_park', label: 'Cement Finish / PCC', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ]
            },
            {
                id: 'landscaping',
                label: 'Landscaping Allowance',
                options: [
                    { value: 'bespoke_garden', label: 'Bespoke Garden + Vertical Walls (₹5L)', tier: 'sovereign', priceMod: 500000, modType: 'lump_sum' },
                    { value: 'full_landscape', label: 'Full Landscaping Design (₹2.5L)', tier: 'imperial', priceMod: 250000, modType: 'lump_sum' },
                    { value: 'native_garden', label: 'Native Species Garden (Low Water) (₹80k)', tier: 'veridia', priceMod: 80000, modType: 'lump_sum' },
                    { value: 'terrace_garden', label: 'Terrace Garden Setup (₹60k)', tier: 'regal', priceMod: 60000, modType: 'lump_sum' },
                    { value: 'basic_lawn', label: 'Basic Lawn/Planters', tier: 'metro', priceMod: 30000, modType: 'lump_sum' },
                    { value: 'none', label: 'None', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ]
            },
            {
                id: 'compound_wall',
                label: 'Compound Wall',
                options: [
                    { value: 'compound_prem', label: 'Plastered + Painted + Texture', tier: 'metro', priceMod: 0, modType: 'lump_sum' },
                    { value: 'compound_std', label: 'Solid Block + Plaster', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                    { value: 'none', label: 'Not Included / Existing', tier: 'civitas', priceMod: 0, modType: 'lump_sum' },
                ]
            },
            {
                id: 'gate',
                label: 'Main Gate',
                options: [
                    { value: 'auto_gate', label: 'Automated Sliding Gate', tier: 'sovereign', priceMod: 100000, modType: 'lump_sum' },
                    { value: 'des_ms_gate', label: 'Designer MS/Wood Gate', tier: 'metro', priceMod: 45000, modType: 'lump_sum' },
                    { value: 'std_gate', label: 'Standard MS Gate', tier: 'urbane', priceMod: 25000, modType: 'lump_sum' },
                    { value: 'basic_gate', label: 'Basic Gate', tier: 'civitas', priceMod: 15000, modType: 'lump_sum' },
                ]
            }
        ]
    },
    {
        id: 'specialized',
        title: 'Specialized Amenities',
        items: [
            {
                id: 'hvac',
                label: 'HVAC (AC Provision)',
                options: [
                    { value: 'vrv_system', label: 'VRV System (Hardware Included)', tier: 'imperial', priceMod: 800000, modType: 'lump_sum' },
                    { value: 'vrv_piping', label: 'VRV Copper Piping Only', tier: 'regal', priceMod: 50000, modType: 'lump_sum' },
                    { value: 'split_prov', label: 'Split AC Provision Only', tier: 'metro', priceMod: 0, modType: 'lump_sum' },
                ],
            },
            {
                id: 'lift',
                label: 'Home Elevator',
                options: [
                    { value: 'hyd_lift', label: 'Hydraulic Home Lift (Schindler)', tier: 'sovereign', priceMod: 500000, modType: 'lump_sum' },
                    { value: 'lift_basic', label: 'Gearless Residential Lift', tier: 'imperial', priceMod: 200000, modType: 'lump_sum' },
                    { value: 'lift_shaft', label: 'Lift Shaft Civil Work Only', tier: 'metro', priceMod: 200000, modType: 'lump_sum' },
                    { value: 'none', label: 'None', tier: 'urbane', priceMod: 0, modType: 'lump_sum' },
                ]
            }
        ]
    }
];
