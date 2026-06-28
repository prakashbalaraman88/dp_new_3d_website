import React, { useState } from 'react';
import { ROOM_TYPES, ROOM_UNIT_MAPPINGS, ACCESSORIES_CATALOG, PRICING_CONSTANTS, SHUTTER_OPTIONS, CORE_OPTIONS } from '../interior_calculator/constants';
import { createUnit } from '../interior_calculator/engine';
import { Unit, Accessory } from '../interior_calculator/types';
import { calculateMaterialRequirements } from '../interior_calculator/nesting';
import { Trash2, Package, Download } from 'lucide-react';

const InteriorCalculator: React.FC = () => {
    // State
    const [clientName, setClientName] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);

    // UI State for Adding Unit
    const [activeRoomType, setActiveRoomType] = useState(ROOM_TYPES[0]);
    const [activeUnitType, setActiveUnitType] = useState(ROOM_UNIT_MAPPINGS[ROOM_TYPES[0]][0]);
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(860);
    const [depth, setDepth] = useState(560);

    // Accessories UI State
    const [selectedAccessories, setSelectedAccessories] = useState<Accessory[]>([]);
    const [accCategory, setAccCategory] = useState(Object.keys(ACCESSORIES_CATALOG)[0]);
    const [accItem, setAccItem] = useState(ACCESSORIES_CATALOG[Object.keys(ACCESSORIES_CATALOG)[0]][0].id);

    // Calculated Costs State
    const [materialSummary, setMaterialSummary] = useState({
        ply16: 0,
        ply6: 0,
        accCost: 0,
        laborCost: 0,
        total: 0
    });

    // Update Material Summary whenever units change
    React.useEffect(() => {
        // Collect all panels
        const allPanels = units.flatMap(u => u.panels);
        const allAccessories = units.flatMap(u => u.accessories);

        // Run Nesting
        const nesting = calculateMaterialRequirements(allPanels);

        // Calculate Costs

        // Accessories
        const accCost = allAccessories.reduce((sum, a) => sum + a.price, 0);

        // Labor (Area based as per new requirement: W*H * 250)
        let totalFrontalAreaSqFt = 0;
        units.forEach(u => {
            totalFrontalAreaSqFt += (u.dimensions.width * u.dimensions.height) / 92903;
        });

        const laborCost = totalFrontalAreaSqFt * PRICING_CONSTANTS.labor.unitLaborPerSqFt;

        // Total Project Cost 
        // Note: The "Unit Cost" displayed in the list ALREADY includes Margin, Labor, Hardware.
        // The Summary here was previously constructing it from raw material.
        // To be consistent with the "Selling Price" model the user requested, 
        // the Grand Total should ideally be the Sum of all Unit Prices.
        // However, the Breakdown (Ply, Labor) needs to be shown too.

        // Let's calculate Grand Total as Sum of Units to ensure it matches the list.
        const totalUnitCost = units.reduce((sum, u) => sum + u.woodworkCost, 0);

        // But for the breakdown to "add up" to the total, we need to adjust.
        // The Unit Price includes Margin (x1.4). 
        // If we show raw Material/Labor in the breakdown, their sum won't equal the Grand Total unless we show "Margin" explicitly
        // or scales them up.
        // Given the UI shows "Grand Total", let's simply sum the units for the Total.
        // And for the breakdown, we show the "Estimated Labor" component.

        setMaterialSummary({
            ply16: nesting.sheets16mm,
            ply6: nesting.sheets6mm,
            accCost: accCost * 1.6, // Unit price has 60% margin on accessories too
            laborCost: laborCost * 1.6,
            // Let's show Raw Labor costs for internal info, but Total is Selling Price.
            // OR, consistent with "Quote", everything should be Selling Price.
            total: totalUnitCost
        });

    }, [units]);

    // Material State
    const [shutterFinish, setShutterFinish] = useState(SHUTTER_OPTIONS[0].id);
    const [coreMaterial, setCoreMaterial] = useState(CORE_OPTIONS[0].id);

    const handleAddUnit = () => {
        const selectedShutter = SHUTTER_OPTIONS.find(s => s.id === shutterFinish);
        const shutterPrice = selectedShutter ? selectedShutter.materialPrice : 3800;

        const selectedCore = CORE_OPTIONS.find(c => c.id === coreMaterial);
        const corePrice = selectedCore ? selectedCore.price : 3200;

        const newUnit = createUnit(
            activeUnitType,
            width,
            height,
            depth,
            selectedAccessories,
            activeRoomType,
            shutterPrice,
            corePrice
        );
        setUnits([...units, newUnit]);
        setSelectedAccessories([]); // Reset
    };

    const handleAddAccessory = () => {
        const categoryItems = ACCESSORIES_CATALOG[accCategory];
        const item = categoryItems.find(i => i.id === accItem);
        if (item) {
            setSelectedAccessories([...selectedAccessories, item]);
        }
    };

    const removeAccessory = (index: number) => {
        setSelectedAccessories(selectedAccessories.filter((_, i) => i !== index));
    };

    const removeUnit = (index: number) => {
        setUnits(units.filter((_, i) => i !== index));
    };


    return (
        <div className="min-h-screen bg-main">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-main via-main to-secondary/10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Interior <span className="text-secondary">Esti-Mate</span>
                        </h1>
                        <p className="text-xl text-accent max-w-2xl mx-auto">
                            Precision Woodwork & Accessories Calculator
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

                    {/* LEFT: Configurator */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Project Info */}
                        <div className="bg-gradient-to-br from-main/80 to-main border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
                            <h2 className="text-xl font-semibold text-white mb-4">Project Details</h2>
                            <input
                                type="text"
                                placeholder="Client Name"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white"
                            />
                        </div>

                        {/* 2. Unit Builder */}
                        <div className="bg-gradient-to-br from-main/80 to-main border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
                            <h2 className="text-xl font-semibold text-secondary mb-6">Add New Unit</h2>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-accent text-sm mb-2">Room</label>
                                    <select
                                        value={activeRoomType}
                                        onChange={(e) => {
                                            setActiveRoomType(e.target.value);
                                            setActiveUnitType(ROOM_UNIT_MAPPINGS[e.target.value][0]);
                                        }}
                                        className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white"
                                    >
                                        {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-accent text-sm mb-2">Unit Type</label>
                                    <select
                                        value={activeUnitType}
                                        onChange={(e) => setActiveUnitType(e.target.value)}
                                        className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white"
                                    >
                                        {ROOM_UNIT_MAPPINGS[activeRoomType].map(u => <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Materials Selection */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-accent text-sm mb-2">Carcass (Core) Material</label>
                                    <select
                                        value={coreMaterial}
                                        onChange={(e) => setCoreMaterial(e.target.value)}
                                        className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white"
                                    >
                                        {CORE_OPTIONS.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-accent text-sm mb-2">Shutter Finish</label>
                                    <select
                                        value={shutterFinish}
                                        onChange={(e) => setShutterFinish(e.target.value)}
                                        className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white"
                                    >
                                        {SHUTTER_OPTIONS.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} (+₹{s.priceMod})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-accent text-sm mb-2">Width (mm)</label>
                                    <input type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full px-3 py-2 bg-main/50 border border-accent/30 rounded text-white" />
                                </div>
                                <div>
                                    <label className="block text-accent text-sm mb-2">Height (mm)</label>
                                    <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full px-3 py-2 bg-main/50 border border-accent/30 rounded text-white" />
                                </div>
                                <div>
                                    <label className="block text-accent text-sm mb-2">Depth (mm)</label>
                                    <input type="number" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full px-3 py-2 bg-main/50 border border-accent/30 rounded text-white" />
                                </div>
                            </div>

                            {/* Accessories Section */}
                            <div className="border-t border-accent/20 pt-4 mb-6">
                                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                                    <Package size={18} className="text-secondary" /> Add Accessories
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4 mb-3">
                                    <select
                                        value={accCategory}
                                        onChange={(e) => {
                                            setAccCategory(e.target.value);
                                            setAccItem(ACCESSORIES_CATALOG[e.target.value][0].id);
                                        }}
                                        className="w-full px-3 py-2 bg-main/50 border border-accent/30 rounded text-white text-sm"
                                    >
                                        {Object.keys(ACCESSORIES_CATALOG).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                                    </select>

                                    <select
                                        value={accItem}
                                        onChange={(e) => setAccItem(e.target.value)}
                                        className="w-full px-3 py-2 bg-main/50 border border-accent/30 rounded text-white text-sm"
                                    >
                                        {ACCESSORIES_CATALOG[accCategory].map(i => (
                                            <option key={i.id} value={i.id}>
                                                {i.name} - ₹{i.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={handleAddAccessory}
                                    className="px-4 py-2 bg-accent/20 text-accent rounded hover:bg-accent/30 text-sm mb-4"
                                >
                                    + Add Item
                                </button>

                                {/* Selected Accessories List */}
                                {selectedAccessories.length > 0 && (
                                    <div className="bg-main/30 rounded p-3 space-y-2">
                                        {selectedAccessories.map((acc, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm text-gray-300">
                                                <span>{acc.name} ({acc.brand})</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-secondary">₹{acc.price}</span>
                                                    <button onClick={() => removeAccessory(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleAddUnit}
                                className="w-full py-4 bg-gradient-to-r from-secondary to-secondary/80 text-main font-bold rounded-xl hover:from-secondary/90 hover:to-secondary/70 shadow-lg"
                            >
                                Add Unit to Project
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Results */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-secondary/10 to-main border border-secondary/30 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-xl font-semibold text-accent mb-6">Quote Summary</h2>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-6 pr-2">
                                {units.map((unit, idx) => (
                                    <div key={unit.id} className="bg-main/50 p-4 rounded border border-accent/10 relative group">
                                        <button
                                            onClick={() => removeUnit(idx)}
                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="text-secondary font-medium text-sm mb-1">{unit.type.replace(/_/g, ' ')}</div>
                                        <div className="text-xs text-gray-400 mb-2">
                                            {unit.dimensions.width}x{unit.dimensions.height}x{unit.dimensions.depth}mm
                                        </div>
                                        {unit.accessories.length > 0 && (
                                            <div className="text-xs text-accent mb-2">
                                                + {unit.accessories.length} Accessories
                                            </div>
                                        )}
                                        <div className="text-white font-bold text-lg">
                                            ₹{Math.round(unit.woodworkCost).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {units.length === 0 && <div className="text-gray-500 text-center py-10">No units added yet</div>}
                            </div>

                            <div className="border-t border-secondary/20 pt-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">Total Units</span>
                                    <span className="text-white">{units.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">16mm Sheets</span>
                                    <span className="text-white">{materialSummary.ply16} Nos</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">6mm Sheets</span>
                                    <span className="text-white">{materialSummary.ply6} Nos</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">Accessories Cost</span>
                                    <span className="text-white">₹{materialSummary.accCost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300">Labor & Finish</span>
                                    <span className="text-white">₹{Math.round(materialSummary.laborCost).toLocaleString()}</span>
                                </div>

                                <div className="border-t border-secondary/20 pt-2 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-300 text-lg">Grand Total</span>
                                        <span className="text-secondary font-bold text-2xl">
                                            ₹{Math.round(materialSummary.total).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">*Includes Material, Labor, Accessories, Wastage</p>
                                </div>

                                <button
                                    onClick={() => {
                                        import('../interior_calculator/pdf').then(mod => {
                                            mod.generateInteriorPDF({
                                                clientName,
                                                units,
                                                materialSummary
                                            });
                                        });
                                    }}
                                    className="w-full mt-4 py-3 bg-secondary text-main font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors"
                                >
                                    <Download size={18} />
                                    Download Quotation & MCL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default InteriorCalculator;
