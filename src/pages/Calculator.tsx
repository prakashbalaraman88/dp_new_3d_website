import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generatePDF, MaterialSelection } from '../utils/pdfGenerator';
import { generateTierSpecsPDF } from '../utils/tierSpecsPdfGenerator';
import { CONSTRUCTION_TIERS, TIER_RANKS, MATERIAL_CATEGORIES, MaterialItem, MaterialOption } from '../data/calculatorConfig';
import { AI_COMMAND_EVENT, AICommandEvent } from '../utils/aiActions';
import { saveQuote, SavedQuote } from '../services/quoteService';
import { SavedQuotesModal } from '../components/SavedQuotesModal';

type TierKey = 'civitas' | 'urbane' | 'metro' | 'cosmo' | 'regal' | 'veridia' | 'imperial' | 'sovereign';

const Calculator: React.FC = () => {
    const [clientName, setClientName] = useState('');
    const [builtUpArea, setBuiltUpArea] = useState(1500);
    const [compoundWallLength, setCompoundWallLength] = useState(0);
    const [compoundWallHeight, setCompoundWallHeight] = useState(5);
    const [selectedTier, setSelectedTier] = useState<TierKey>('urbane');
    // Store FULL OPTION OBJECTS, not just values
    const [selections, setSelections] = useState<Record<string, MaterialOption>>({});
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isGeneratingSpecsPDF, setIsGeneratingSpecsPDF] = useState(false);
    const [isGeneratingHandbookPDF, setIsGeneratingHandbookPDF] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['structure']);
    const [showLuxury, setShowLuxury] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedQuotes, setShowSavedQuotes] = useState(false);

    const toggleCategory = (catId: string) => {
        setExpandedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(c => c !== catId)
                : [...prev, catId]
        );
    };

    // AI Command Listener
    React.useEffect(() => {
        const handleAICommand = (e: Event) => {
            const customEvent = e as AICommandEvent;
            const { type, payload } = customEvent.detail;

            if (type === 'UPDATE_CALCULATOR') {
                console.log("Calculator received AI command:", payload);

                if (payload.clientName) setClientName(payload.clientName);
                if (payload.builtUpArea) setBuiltUpArea(Number(payload.builtUpArea));

                if (payload.tier) {
                    const tierKey = payload.tier.toLowerCase() as TierKey;
                    if (CONSTRUCTION_TIERS[tierKey]) {
                        handleTierChange(tierKey);

                        // Auto-expand luxury if needed
                        if (['regal', 'veridia', 'imperial', 'sovereign'].includes(tierKey)) {
                            setShowLuxury(true);
                        }
                    }
                }

                if (payload.showLuxury !== undefined) {
                    setShowLuxury(payload.showLuxury);
                }
            }
        };

        window.addEventListener(AI_COMMAND_EVENT, handleAICommand);
        return () => window.removeEventListener(AI_COMMAND_EVENT, handleAICommand);
    }, []);

    const handleTierChange = (tier: TierKey) => {
        setSelectedTier(tier);
        setSelections({}); // Reset manual selections to defaults
    };

    const getDefaultOption = (tierId: string, item: MaterialItem): MaterialOption => {
        // 1. Try exact match
        const exact = item.options.find(opt => opt.tier === tierId);
        if (exact) return exact;

        // 2. Fallback to closest rank
        const targetRank = TIER_RANKS[tierId] || 1;
        let best = item.options[0];
        let minDist = Infinity;

        for (const opt of item.options) {
            const optRank = TIER_RANKS[opt.tier] || 0;
            const dist = Math.abs(targetRank - optRank);
            if (dist < minDist) {
                minDist = dist;
                best = opt;
            }
        }
        return best;
    };

    const handleMaterialChange = (itemId: string, selectedValue: string) => {
        // Find the full option object across all categories
        let selectedOption: MaterialOption | undefined;
        let found = false;

        for (const cat of MATERIAL_CATEGORIES) {
            for (const item of cat.items) {
                if (item.id === itemId) {
                    selectedOption = item.options.find(opt => opt.value === selectedValue);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        if (selectedOption) {
            setSelections(prev => ({
                ...prev,
                [itemId]: selectedOption!
            }));
        }
    };

    const calculateTotal = () => {
        const baseRate = CONSTRUCTION_TIERS[selectedTier].basePricePerSqft;
        let totalRatePerSqft = baseRate;
        let totalLumpSum = 0;

        // Start with base rate, add differences for manual selections
        // Iterate through all categories/items to find selections or defaults
        // Wait, efficient way: 
        // Iterate manual selections only?
        // Yes, because default selections have diff = 0 (relative to themselves).
        // BUT logic requires `diff = selected.priceMod - default.priceMod`.

        Object.keys(selections).forEach((itemId) => {
            const selectedOption = selections[itemId];
            if (!selectedOption) return;

            // Find item and default option for CURRENT Tier
            let defaultOptionForTier: MaterialOption | null = null;
            let itemFound = null;

            for (const cat of MATERIAL_CATEGORIES) {
                const item = cat.items.find((i) => i.id === itemId);
                if (item) {
                    itemFound = item;
                    defaultOptionForTier = getDefaultOption(selectedTier, item);
                    break;
                }
            }

            if (defaultOptionForTier && itemFound) {
                // Special handling for Compound Wall
                if (itemId === 'compound_wall') {
                    // Compound wall cost is calculated separately, 
                    // BUT we need to check if 'none' was default or selected.
                    // The logic below handles the cost addition. 
                    // We should exclude it from Rate/LumpSum if it's treated separately.
                    return;
                }

                const diff = selectedOption.priceMod - defaultOptionForTier.priceMod;
                if (selectedOption.modType === 'lump_sum') {
                    totalLumpSum += diff;
                } else {
                    totalRatePerSqft += diff;
                }
            }
        });

        // Calculate Compound Wall Cost separately
        let compoundWallCost = 0;
        // Check selection OR default
        // Find compound wall item
        let compoundWallItem: MaterialItem | undefined;
        for (const cat of MATERIAL_CATEGORIES) {
            const found = cat.items.find(i => i.id === 'compound_wall');
            if (found) { compoundWallItem = found; break; }
        }

        let activeCompoundOption: MaterialOption | undefined;
        if (selections['compound_wall']) {
            activeCompoundOption = selections['compound_wall'];
        } else if (compoundWallItem) {
            activeCompoundOption = getDefaultOption(selectedTier, compoundWallItem);
        }

        if (activeCompoundOption && activeCompoundOption.value !== 'none') {
            // Base Rates per Sqft of Wall Area
            // Implementation Plan: 160 (Std) - 240 (Prem).
            // We can infer rate from option value or store it?
            // Hardcoding for now based on value match, or use priceMod as rate?
            // Existing logic used hardcoded.
            const wallRate = activeCompoundOption.value === 'compound_prem' ? 240 : 160;
            const wallArea = compoundWallLength * compoundWallHeight;
            compoundWallCost = wallArea * wallRate;
        }

        const calculatedTotalCost = (totalRatePerSqft * builtUpArea) + totalLumpSum + compoundWallCost;
        const finalRatePerSqft = calculatedTotalCost / builtUpArea;

        return { totalCost: calculatedTotalCost, perSqFtCost: finalRatePerSqft, totalLumpSum, compoundWallCost };
    };

    const { totalCost, perSqFtCost, totalLumpSum, compoundWallCost } = calculateTotal();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        try {
            // Prepare data for PDF
            const pdfSelections: MaterialSelection[] = [];

            // We need to pass ALL selections (even defaults) to PDF?
            // Or just what changed? Usually comprehensive list.
            // Let's iterate all items and push active option.

            MATERIAL_CATEGORIES.forEach(cat => {
                cat.items.forEach(item => {
                    let activeOpt = selections[item.id];
                    if (!activeOpt) {
                        activeOpt = getDefaultOption(selectedTier, item);
                    }

                    pdfSelections.push({
                        category: cat.title,
                        label: `${item.label}: ${activeOpt.label}`,
                        tier: activeOpt.tier,
                        // Calculate impact relative to tier default
                        priceMod: activeOpt.priceMod - getDefaultOption(selectedTier, item).priceMod,
                        modType: activeOpt.modType
                    });
                });
            });

            await generatePDF({
                clientName,
                builtUpArea,
                tier: CONSTRUCTION_TIERS[selectedTier].name,
                siteCondition: 'Standard', // Placeholder
                selections: pdfSelections,
                totalCost,
                perSqFtCost,
                totalLumpSum,
                compoundWallCost
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadSpecsPDF = async () => {
        setIsGeneratingSpecsPDF(true);
        try {
            await generateTierSpecsPDF();
        } catch (error) {
            console.error('Error generating Specs PDF:', error);
        } finally {
            setIsGeneratingSpecsPDF(false);
        }
    };

    const handleDownloadHandbookPDF = async () => {
        setIsGeneratingHandbookPDF(true);
        try {
            const { generateHandbookPDF } = await import('../utils/handbookPdfGenerator');
            await generateHandbookPDF();
        } catch (error) {
            console.error('Error generating Handbook PDF:', error);
        } finally {
            setIsGeneratingHandbookPDF(false);
        }
    };

    const handleSaveQuote = async () => {
        if (!clientName) {
            alert("Please enter a Client Name to save this quote.");
            return;
        }

        setIsSaving(true);
        try {
            // Reconstruct selections list for saving (same logic as PDF)
            const savedSelections: MaterialSelection[] = [];
            MATERIAL_CATEGORIES.forEach(cat => {
                cat.items.forEach(item => {
                    let activeOpt = selections[item.id];
                    if (!activeOpt) {
                        activeOpt = getDefaultOption(selectedTier, item);
                    }
                    savedSelections.push({
                        category: cat.title,
                        label: `${item.label}: ${activeOpt.label}`,
                        tier: activeOpt.tier,
                        priceMod: activeOpt.priceMod - getDefaultOption(selectedTier, item).priceMod,
                        modType: activeOpt.modType
                    });
                });
            });

            await saveQuote({
                clientName,
                builtUpArea,
                tier: CONSTRUCTION_TIERS[selectedTier].name,
                totalCost,
                perSqFtCost,
                selections: savedSelections,
                totalLumpSum,
                compoundWallCost,
                rawSelections: selections // Save the raw state for future editing
            });

            // Artificial timeout to prevent infinite hanging if Firestore network fails (though Firestore usually handles this)
            // But since user reported "stuck", `await saveQuote` might be hanging. 
            // The service returns a promise.

            alert("Quote saved successfully!");
        } catch (error) {
            console.error("Error saving quote:", error);
            alert("Failed to save quote. Please check your internet connection or Firestore permissions.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadQuote = (quote: SavedQuote) => {
        setClientName(quote.clientName);
        setBuiltUpArea(quote.builtUpArea);

        // Find tier key by name
        const tierEntry = Object.entries(CONSTRUCTION_TIERS).find(([_, t]) => t.name === quote.tier);
        if (tierEntry) {
            const tierKey = tierEntry[0] as TierKey;
            handleTierChange(tierKey); // This resets selections to {}, so we must set them AFTER

            if (['regal', 'veridia', 'imperial', 'sovereign'].includes(tierKey)) {
                setShowLuxury(true);
            }
        }

        // Restore raw selections if available (New Feature)
        if (quote.rawSelections) {
            setSelections(quote.rawSelections);
        }

        setShowSavedQuotes(false);
    };

    return (
        <div className="min-h-screen bg-main">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-main via-main to-secondary/10" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Construction Cost <span className="text-secondary">Calculator</span>
                        </h1>
                        <p className="text-xl text-accent max-w-2xl mx-auto">
                            Get an instant estimate for your dream home with our comprehensive cost calculator
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Calculator Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Panel - Input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {/* Client Name */}
                            <div className="bg-gradient-to-br from-main/80 to-main border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-white font-medium">Client Name</label>
                                    <button
                                        onClick={() => setShowSavedQuotes(true)}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs text-secondary font-medium transition-all flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        History
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary transition-colors"
                                />
                            </div>

                            {/* Built-up Area Slider */}
                            <div className="bg-gradient-to-br from-main/80 to-main border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-white font-medium">Built-up Area</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={builtUpArea}
                                            onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                                            className="w-24 px-2 py-1 bg-black/20 border border-accent/30 rounded text-right text-secondary font-bold text-xl focus:outline-none focus:border-secondary transition-colors"
                                        />
                                        <span className="text-secondary font-bold text-xl">sq ft</span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="500"
                                    max="10000"
                                    step="50"
                                    value={builtUpArea}
                                    onChange={(e) => setBuiltUpArea(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                                />
                                <div className="flex justify-between text-sm text-gray-400 mt-2">
                                    <span>500 sq ft</span>
                                    <span>10,000 sq ft</span>
                                </div>
                            </div>

                            {/* Construction Tier Selection */}
                            <div className="bg-gradient-to-br from-main/80 to-main border border-accent/20 rounded-2xl p-6 backdrop-blur-sm">
                                <label className="block text-white font-medium mb-4">Select Construction Tier</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Object.values(CONSTRUCTION_TIERS)
                                        .filter(tier => ['civitas', 'urbane', 'metro', 'cosmo'].includes(tier.id))
                                        .map((tier) => (
                                            <button
                                                key={tier.id}
                                                onClick={() => handleTierChange(tier.id as TierKey)}
                                                className={`p-4 rounded-xl border-2 transition-all ${selectedTier === tier.id
                                                    ? 'border-secondary bg-secondary/10'
                                                    : 'border-gray-600 hover:border-gray-500'
                                                    }`}
                                            >
                                                <div className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                                    {tier.name}
                                                </div>
                                                <div className="text-secondary font-medium">₹{tier.basePricePerSqft}/sqft</div>
                                                <div className="text-xs text-gray-400 mt-2">{tier.description}</div>
                                            </button>
                                        ))}
                                </div>

                                {/* Luxury Tiers Toggle */}
                                <div className="mt-6 mb-2 flex flex-col items-center justify-center">
                                    <button
                                        onClick={() => setShowLuxury(!showLuxury)}
                                        className="group flex flex-col items-center gap-2 text-secondary hover:text-white transition-colors"
                                    >
                                        <span className="text-sm font-medium uppercase tracking-wider">{showLuxury ? 'Show Less' : 'View Luxury Tiers'}</span>
                                        <div className={`p-2 rounded-full border border-secondary/30 group-hover:border-secondary transition-all ${showLuxury ? 'rotate-180' : ''}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>

                                {/* Luxury Tiers Grid */}
                                {showLuxury && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/10"
                                    >
                                        {Object.values(CONSTRUCTION_TIERS)
                                            .filter(tier => ['regal', 'veridia', 'imperial', 'sovereign'].includes(tier.id))
                                            .map((tier) => (
                                                <button
                                                    key={tier.id}
                                                    onClick={() => handleTierChange(tier.id as TierKey)}
                                                    className={`p-4 rounded-xl border-2 transition-all ${selectedTier === tier.id
                                                        ? 'border-secondary bg-secondary/10'
                                                        : 'border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <div className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                                        {tier.name}
                                                    </div>
                                                    <div className="text-secondary font-medium">₹{tier.basePricePerSqft}/sqft</div>
                                                    <div className="text-xs text-gray-400 mt-2">{tier.description}</div>
                                                </button>
                                            ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Download Buttons Row */}
                            <div className="flex flex-col sm:flex-row justify-center gap-4 -mt-2 mb-6">
                                {/* Specs Button */}
                                <button
                                    onClick={handleDownloadSpecsPDF}
                                    disabled={isGeneratingSpecsPDF}
                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-secondary/30 rounded-full text-secondary text-sm font-medium hover:border-secondary hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all disabled:opacity-50"
                                >
                                    {isGeneratingSpecsPDF ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                                            <span>Generating Specs...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="7 10 12 15 17 10" />
                                                <line x1="12" x2="12" y1="15" y2="3" />
                                            </svg>
                                            <span>Download Detailed Specs</span>
                                        </>
                                    )}
                                </button>

                                {/* Handbook Button */}
                                <button
                                    onClick={handleDownloadHandbookPDF}
                                    disabled={isGeneratingHandbookPDF}
                                    className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border border-secondary/30 rounded-full text-white text-sm font-medium hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50"
                                >
                                    {isGeneratingHandbookPDF ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Generating Handbook...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                            </svg>
                                            <span>Download Client Handbook</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Material Categories */}
                            {MATERIAL_CATEGORIES.map((category) => (
                                <div
                                    key={category.id}
                                    className="bg-gradient-to-br from-main/80 to-main border border-accent/20 rounded-2xl overflow-hidden backdrop-blur-sm"
                                >
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="w-full p-6 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-white font-medium text-lg">{category.title}</span>
                                        <span className="text-secondary text-2xl">
                                            {expandedCategories.includes(category.id) ? '−' : '+'}
                                        </span>
                                    </button>
                                    {expandedCategories.includes(category.id) && (
                                        <div className="px-6 pb-6 space-y-4">
                                            {category.items.map((item) => (
                                                <div key={item.id}>
                                                    <label className="block text-accent text-sm mb-2">{item.label}</label>
                                                    <select
                                                        value={selections[item.id]?.value || getDefaultOption(selectedTier, item).value}
                                                        onChange={(e) => handleMaterialChange(item.id, e.target.value)}
                                                        className="w-full px-4 py-3 bg-main/50 border border-accent/30 rounded-lg text-white focus:outline-none focus:border-secondary transition-colors cursor-pointer"
                                                    >
                                                        {item.options.map((option) => (
                                                            <option key={option.value} value={option.value} className="bg-main">
                                                                {option.label}{' '}
                                                                {option.priceMod !== 0 &&
                                                                    `(${option.priceMod > 0 ? '+' : ''}${option.modType === 'lump_sum'
                                                                        ? `₹${option.priceMod.toLocaleString()}`
                                                                        : `₹${option.priceMod}/sqft`
                                                                    })`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {/* Compound Wall Inputs */}
                                                    {item.id === 'compound_wall' && (
                                                        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-accent/20 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-300 mb-1">Wall Length (ft)</label>
                                                                <input
                                                                    type="number"
                                                                    value={compoundWallLength}
                                                                    onChange={(e) => setCompoundWallLength(Number(e.target.value))}
                                                                    className="w-full px-3 py-2 bg-black/20 border border-accent/30 rounded-md text-white focus:outline-none focus:border-secondary transition-colors"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-300 mb-1">Wall Height (ft)</label>
                                                                <input
                                                                    type="number"
                                                                    value={compoundWallHeight}
                                                                    onChange={(e) => setCompoundWallHeight(Number(e.target.value))}
                                                                    className="w-full px-3 py-2 bg-black/20 border border-accent/30 rounded-md text-white focus:outline-none focus:border-secondary transition-colors"
                                                                />
                                                            </div>
                                                            <div className="col-span-2 text-xs text-gray-400 text-right">
                                                                *Cost calculated based on total wall area ({compoundWallLength * compoundWallHeight} sq.ft)
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </motion.div>

                        {/* Right Panel - Results */}
                        <div className="lg:col-span-1 h-full">
                            <div className="lg:sticky lg:top-32 space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    <div className="bg-gradient-to-br from-secondary/10 to-main border border-secondary/30 rounded-2xl p-6 shadow-xl">
                                        <h2 className="text-xl font-semibold text-accent mb-6 uppercase tracking-wide">Estimated Project Cost</h2>

                                        <div className="space-y-6 mb-8">
                                            {/* Total Estimate - Main Focus */}
                                            <div className="text-center py-4">
                                                <span className="text-4xl md:text-5xl font-bold text-secondary">
                                                    {formatCurrency(totalCost)}
                                                </span>
                                            </div>

                                            {/* Rate per Sq.ft - Shows CALCULATED rate */}
                                            <div className="flex justify-between items-center border-t border-secondary/20 pt-4">
                                                <span className="text-gray-300">Rate per Sq.ft</span>
                                                <span className="text-xl font-semibold text-white">
                                                    {formatCurrency(Math.round(perSqFtCost))}
                                                </span>
                                            </div>

                                            {/* Variable Cost Breakdown */}
                                            {(totalLumpSum !== 0 || compoundWallCost > 0) && (
                                                <div className="border-t border-secondary/20 pt-2 mt-2 text-xs space-y-1">
                                                    {totalLumpSum !== 0 && (
                                                        <div className="flex justify-between text-accent/80">
                                                            <span>Variable Add-ons:</span>
                                                            <span>{totalLumpSum > 0 ? '+' : ''}{formatCurrency(totalLumpSum)}</span>
                                                        </div>
                                                    )}
                                                    {compoundWallCost > 0 && (
                                                        <div className="flex justify-between text-accent/80">
                                                            <span>Compound Wall:</span>
                                                            <span>+<span className="text-secondary font-bold">{formatCurrency(compoundWallCost)}</span></span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Built-up Area */}
                                            <div className="flex justify-between items-center border-t border-secondary/20 pt-4">
                                                <span className="text-gray-300">Built-up Area</span>
                                                <span className="text-xl font-semibold text-white">
                                                    {builtUpArea.toLocaleString()} sq ft
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handleSaveQuote}
                                                disabled={isSaving}
                                                className="py-4 border border-secondary text-secondary font-bold rounded-xl hover:bg-secondary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Quote'}
                                            </button>

                                            <button
                                                onClick={handleDownloadPDF}
                                                disabled={isGeneratingPDF}
                                                className="py-4 bg-gradient-to-r from-secondary to-secondary/80 text-main font-bold rounded-xl hover:from-secondary/90 hover:to-secondary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-secondary/20"
                                            >
                                                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                                            </button>
                                        </div>

                                        {/* Disclaimer */}
                                        <p className="text-xs text-gray-400 mt-4 text-center">
                                            * This is an approximate estimate. Final costs may vary based on site conditions and material prices.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SavedQuotesModal
                isOpen={showSavedQuotes}
                onClose={() => setShowSavedQuotes(false)}
                onLoadQuote={handleLoadQuote}
            />
        </div>
    );
};

export default Calculator;
