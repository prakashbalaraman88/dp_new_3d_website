import React, { useEffect, useState } from 'react';
import { getQuotes, SavedQuote } from '../services/quoteService';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedQuotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoadQuote: (quote: SavedQuote) => void;
}

export const SavedQuotesModal: React.FC<SavedQuotesModalProps> = ({ isOpen, onClose, onLoadQuote }) => {
    const [quotes, setQuotes] = useState<SavedQuote[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadQuotes();
        }
    }, [isOpen]);

    const loadQuotes = async () => {
        setLoading(true);
        try {
            const data = await getQuotes();
            setQuotes(data);
        } catch (error) {
            console.error("Failed to load quotes", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        // Firestore timestamp to JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                            <h2 className="text-xl font-bold text-white">Saved Quotations</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400">Loading quotes...</div>
                            ) : quotes.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No saved quotes found. Create a new estimate and save it!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {quotes.map((quote) => (
                                        <div key={quote.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-secondary/50 transition-colors group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-secondary transition-colors">
                                                        {quote.clientName || 'Unnamed Client'}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {formatDate(quote.timestamp)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-secondary font-bold text-lg">
                                                        {formatCurrency(quote.totalCost)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                                                        {quote.tier} Tier
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                                <div className="text-sm text-gray-400">
                                                    {quote.builtUpArea} sq.ft
                                                </div>
                                                <button
                                                    onClick={() => onLoadQuote(quote)}
                                                    className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary text-sm font-medium rounded-lg transition-colors border border-secondary/30"
                                                >
                                                    Load Estimate
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
