import React, { useEffect, useRef, useState } from 'react';
import { Calendar, MessageCircle, Send, Sparkles, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const BOOKING_LINK = 'https://calendar.app.google/UiboyWruwDtY15nr5';
const WHATSAPP_LINK = 'https://wa.me/917892434663';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

const getQuickResponse = (message: string) => {
    const normalized = message.toLowerCase();

    if (/price|cost|budget|estimate|quote/.test(normalized)) {
        return 'Every estimate depends on the rooms, scope, materials, and site. Complete the enquiry form for a tailored consultation, or message us on WhatsApp: ' + WHATSAPP_LINK;
    }

    if (/book|call|meeting|appointment|visit/.test(normalized)) {
        return 'You can choose a convenient consultation slot here: ' + BOOKING_LINK;
    }

    if (/style|quiz|design/.test(normalized)) {
        return 'The Style Quiz at the top of this page creates a personalised direction. Once you finish it, the enquiry form appears immediately below your result.';
    }

    if (/project|portfolio|gallery|work/.test(normalized)) {
        return 'You can explore completed homes in the gallery below. For a project similar to yours, share your requirements through the enquiry form.';
    }

    return 'I can help you find the right next step. For a tailored answer, complete the enquiry form or message the DezignPool team on WhatsApp: ' + WHATSAPP_LINK;
};

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: 'Welcome to DezignPool. I can help you find the style quiz, project gallery, consultation form, or booking link.',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSendMessage = () => {
        const text = inputValue.trim();
        if (!text) return;

        const timestamp = Date.now();
        setMessages((current) => [
            ...current,
            { id: String(timestamp), role: 'user', text, timestamp: new Date() },
            {
                id: String(timestamp + 1),
                role: 'assistant',
                text: getQuickResponse(text),
                timestamp: new Date(),
            },
        ]);
        setInputValue('');
    };

    const formatMessageText = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.split(urlRegex).map((part, index) => {
            if (!part.match(urlRegex)) return <span key={index}>{part}</span>;

            const punctuation = part.match(/[.,!?)]+$/)?.[0] ?? '';
            const cleanUrl = punctuation ? part.slice(0, -punctuation.length) : part;
            const isBooking = cleanUrl.includes('calendar.app.google');

            return (
                <span key={index}>
                    <a
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={isBooking
                            ? 'inline-flex items-center gap-1 bg-secondary-600 hover:bg-secondary-700 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors mx-1 no-underline'
                            : 'text-secondary-600 hover:underline break-all'}
                    >
                        {isBooking && <Calendar className="w-3 h-3" />}
                        {isBooking ? 'Book Call' : 'Open WhatsApp'}
                    </a>
                    {punctuation}
                </span>
            );
        });
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden pointer-events-auto flex flex-col"
                        role="dialog"
                        aria-label="DezignPool website guide"
                    >
                        <div className="p-4 bg-gradient-to-r from-secondary-600 to-secondary-700 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">DezignPool Guide</h3>
                                    <span className="text-secondary-100 text-xs font-medium">Quick website help</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={BOOKING_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-secondary-700 rounded-full transition-colors flex items-center gap-1.5 shadow-md font-bold"
                                    title="Book consultation"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs whitespace-nowrap">Book Call</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 text-white rounded-full transition-colors"
                                    aria-label="Close website guide"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950/50 scroll-smooth" aria-live="polite">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${message.role === 'user'
                                        ? 'bg-secondary-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'}`}
                                    >
                                        <div className="whitespace-pre-wrap font-sans">{formatMessageText(message.text)}</div>
                                        <span className={`text-[10px] mt-1 block opacity-70 ${message.role === 'user' ? 'text-secondary-100' : 'text-gray-400'}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(event) => setInputValue(event.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about styles, projects, or booking"
                                    className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500/50 placeholder-gray-500 transition-all border-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="absolute right-2 p-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:opacity-50 disabled:hover:bg-secondary-600 transition-colors shadow-md"
                                    aria-label="Send message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-center mt-2 text-[10px] text-gray-400">Private on-page guide. Messages are not submitted.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((open) => !open)}
                className="pointer-events-auto p-4 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all relative group"
                aria-label={isOpen ? 'Close website guide' : 'Open website guide'}
                aria-expanded={isOpen}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? <X key="close" className="w-7 h-7" /> : <MessageCircle key="open" className="w-7 h-7" />}
                </AnimatePresence>

                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 whitespace-nowrap hidden group-hover:block"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Website guide</span>
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white dark:bg-slate-800 rotate-45 border-r border-t border-gray-100 dark:border-gray-700" />
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
