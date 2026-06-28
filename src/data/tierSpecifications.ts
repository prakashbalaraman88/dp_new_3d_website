export const TIER_SPECIFICATIONS = {
    executiveSummary: "This document mirrors the exact logic used in the DezignPool Construction Cost Calculator. It details the 8-Tier Hierarchy from Civitas (Economy) to Sovereign (Estate), including the new Veridia (Sustainable) tier.",
    pricingHierarchy: [
        { tier: "1", name: "Civitas", rank: "Economy", price: "₹1,900", profile: "Foundation package for rental units and investors. Focus on durability and cost-efficiency." },
        { tier: "2", name: "Urbane", rank: "Core", price: "₹2,250", profile: "Standard package for modern families. Balance of longevity and aesthetics." },
        { tier: "3", name: "Metro", rank: "Prime", price: "₹2,650", profile: "Aspirational package with branded finishes and superior design identity." },
        { tier: "4", name: "Cosmo", rank: "Elite", price: "₹3,200", profile: "Entry-luxury with automation, premium surfaces, and grander heights." },
        { tier: "5", name: "Regal", rank: "Signature", price: "₹3,950", profile: "Luxury package with imported materials, VRV provisions, and dry cladding." },
        { tier: "6", name: "Veridia", rank: "Sustainable", price: "₹4,350", profile: "Eco-luxury package with sustainable materials, solar power, and rainwater harvesting." },
        { tier: "7", name: "Imperial", rank: "Grandeur", price: "₹5,200", profile: "Super-luxury with pool, lift, and integrated high-end automation." },
        { tier: "8", name: "Sovereign", rank: "Estate", price: "₹7,500", profile: "Bespoke package for ultra-luxury villas with limitless customization." },
    ],
    categories: [
        {
            title: "Structure & Civil",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Steel Reinforcement", "Fe 500 (Secondary)", "Fe 550 (Secondary)", "Fe 550D (Primary)", "Fe 550D (Primary)", "Fe 550D (Primary)", "Fe 550D (Primary)", "Fe 550D (Primary)", "Fe 550D (Primary)"],
                ["Cement Grade", "PPC (All Works)", "OPC 53 / PPC", "OPC 53 / PPC", "OPC 53 / PPC", "OPC 53 / PPC", "Sustainable Fly-Ash PPC", "OPC 53 / PPC", "OPC 53 / PPC"],
                ["Wall Blocks", "Local Solid Blocks", "Standard Solid Blocks", "Premium Solid Concrete", "Premium Solid Concrete", "Factory Made AVS", "AAC Blocks (Thermal)", "Factory AVS", "Factory AVS"],
                ["Underground Sump", "4,000L Block", "4,000L Block", "6,000L Block", "6,000L Block", "8,000L RCC", "8,000L RCC + Bio-Filter", "10,000L RCC", "12,000L RCC"],
            ]
        },
        {
            title: "Waterproofing & Drainage",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Terrace Waterproofing", "Bitumen Coat", "Basic Acrylic", "Dr. Fixit 2-Coat", "STP Membrane", "STP Membrane", "Solar Reflective Coat", "PU Coating", "Fosroc + Insulation"],
            ]
        },
        {
            title: "Wall Finishes & Painting",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Internal Wall Paint", "Distemper", "Tractor Emulsion", "Premium Emulsion", "Royale Luxury", "Royale + Texture", "Low VOC / Non-Toxic", "Royale + Texture", "Royale + Texture"],
                ["External Paint", "Cement Paint", "Ace Exterior", "Apex Exterior", "Apex Ultima", "Apex Ultima", "Heat Shield Paint", "Apex Ultima", "Apex Ultima"],
            ]
        },
        {
            title: "Flooring & Tiling",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Living/Dining Flooring", "Std Vitrified", "Dbl Chg Vitrified", "Large GVT 6x4", "Basic Italian", "Prem Italian", "Natural Kota/Stone", "Italian Statuario", "Rare Italian/Onyx"],
                ["Bedroom Flooring", "Std Vitrified", "Std Vitrified", "Wooden GVT", "Eng. Wood", "Teak Wood", "Bamboo Flooring", "Teak Wood", "Teak Wood"],
                ["Kitchen Flooring", "Ceramic", "Ceramic", "Premium GVT", "Premium GVT", "Premium GVT", "Premium GVT", "Premium GVT", "Premium GVT"],
            ]
        },
        {
            title: "Bathroom Tiling",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Wall Tiles", "Std Ceramic", "Prem Ceramic", "Prem GVT", "Designer GVT", "Italian Tile", "Recycled Tile", "Italian Tile", "Imported Slabs"],
                ["Floor Tiles", "Ceramic", "Ceramic", "GVT", "GVT", "Marble", "Recycled Tile", "Marble", "Imported Stone"],
            ]
        },
        {
            title: "Kitchen & Bath Specs",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Kitchen Countertop", "Black Granite", "Galaxy Granite", "Nano White", "Nano White", "Quartz", "Recycled Glass", "Quartz", "Imported Quartz"],
                ["Kitchen Sink", "SS 304", "SS 304", "Handmade SS", "Quartz Sink", "Quartz Sink", "Quartz Sink", "Quartz Sink", "Quartz Sink"],
            ]
        },
        {
            title: "Sustainability",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Solar Power", "None", "None", "Provision", "3kW On-Grid", "3kW On-Grid", "5kW On-Grid", "5kW Hybrid", "10kW Hybrid"],
                ["Rainwater Harvesting", "None", "Recharge Pit", "Dual Tank", "Dual Tank", "Adv Filter", "Dual Filter System", "Recycling System", "Smart Recycling"],
            ]
        },
        {
            title: "Mix: Doors & Windows",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Main Door", "Sal Flush", "Teak Veneer", "Burma Teak", "Grand Teak", "Grand Teak", "Grand Teak (FSC)", "Grand Teak", "Grand Teak"],
                ["Windows", "2-Track Alum.", "3-Track Alum.", "UPVC White", "System Alum.", "System Alum.", "Wood-Alum. Comp.", "System Alum.", "Schuco Slim"],
            ]
        },
        {
            title: "MEP (Electrical & Plumbing)",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Wiring & Switches", "Piano Switch", "Modular (Anchor)", "Prem Modular", "Prem Modular", "Prem Modular", "PVC-Free Wires", "Touch Switches", "Central Keypads"],
                ["EV Charging", "None", "None", "15A Point", "15A Point", "15A Point", "Fast Charger", "15A Point", "Fast Charger"],
                ["Sanitary Allowance", "₹25k (Cera)", "₹40k (Jaguar)", "₹60k (Jaguar)", "₹90k (Kohler)", "₹1L (Villeroy)", "₹90k (WaterSense)", "₹1.2L (Villeroy)", "₹2.5L (Toto)"],
                ["Piping", "PVC", "PVC", "Silent SWR", "Silent SWR", "Silent SWR", "HDPE/Recycled", "Silent SWR", "Composite/PEX"],
            ]
        },
        {
            title: "Site Work & Elevation",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["Parking Flooring", "Cement", "Cement", "Kota Stone", "Granite", "Granite", "Grass Pavers", "Cobblestone", "Imported Stone"],
                ["Landscaping", "None", "None", "Basic", "Terrace Garden", "Terrace Garden", "Native Garden", "Full Landscape", "Bespoke"],
                ["Compound Wall", "Not Included", "Solid Block", "Plastered", "Plastered", "Plastered", "Plastered", "Plastered", "Plastered"],
                ["Main Gate", "Basic", "Standard MS", "Designer MS", "Designer MS", "Designer MS", "Designer MS", "Designer MS", "Auto Sliding"],
            ]
        },
        {
            title: "Amenities",
            headers: ["Item", "Civitas", "Urbane", "Metro", "Cosmo", "Regal", "Veridia", "Imperial", "Sovereign"],
            rows: [
                ["HVAC", "Split Prov", "Split Prov", "Split Prov", "Split Prov", "VRV Piping", "VRV Piping", "VRV System", "VRV System"],
                ["Lift", "None", "None", "Shaft Only", "Shaft Only", "Shaft Only", "Shaft Only", "Basic Lift", "Hydraulic Lift"],
            ]
        }
    ]
};
