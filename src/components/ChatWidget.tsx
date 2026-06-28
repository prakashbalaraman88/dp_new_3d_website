import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, User, Sparkles, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { sendChatLead } from '../utils/emailjs';
import { dispatchAICommand } from '../utils/aiActions';

// --- Configuration ---
// Key is injected at build time from VITE_OPENROUTER_API_KEY (.env.local for local dev,
// platform env vars on deploy). Never hardcode it: the repo is public and GitHub push
// protection blocks committing the key.
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const CALENDLY_LINK = "https://calendar.app.google/UiboyWruwDtY15nr5"; // Google Calendar Booking Link

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true, // Required for client-side usage
});

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

const ChatWidget: React.FC = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: "Hi there! I'm Sarah from DezignPool. How can I help you with your home construction plans today?",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [leadCaptured, setLeadCaptured] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Lead Capture Logic: Check for phone numbers in user messages
    useEffect(() => {
        if (leadCaptured) return; // Don't capture twice in a session

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'user') {
            // Regex for Indian mobile numbers (allows spaces/dashes, +91 optional)
            const phoneRegex = /(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}/;
            const match = lastMessage.text.match(phoneRegex);

            if (match) {
                const phoneNumber = match[0];
                const transcript = messages.map(m => `${m.role}: ${m.text}`).join('\n');
                console.log("Lead Detected:", phoneNumber);

                // Send to EmailJS
                sendChatLead(phoneNumber, transcript);
                setLeadCaptured(true);
            }
        }
    }, [messages, leadCaptured]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const completion = await client.chat.completions.create({
                model: "deepseek/deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are Sarah, a consultative and highly helpful construction expert at DezignPool.

**Your Goal**: Provide genuine value first, then capture a lead for WhatsApp follow-up.

**Key Guidelines**:
1. **Be Human**: Speak naturally, avoid robotic patterns. Use emojis sparingly but warmly (🏠, ✨).
2. **Consultative Approach**: Before giving final quotes, ask 1-2 probing questions to understand their needs better:
   - "Where in Bangalore is your plot located?"
   - "Do you already have a floor plan or a sanctioned plan?"
   - "What is the approximate built-up area you're planning?"
   - "What architectural style do you prefer—Modern, Traditional, or Minimalist?"
3. **Be Concise & Expert**: Give short, direct answers. If they ask about materials, mention DP's "Obsessive Quality" (e.g., using only 53-grade cement or specific wood types).
4. **NO MARKDOWN**: Type in plain text only. No **bold**, ### headers, or code blocks.
5. **Knowledge Base**: Use this data for facts:
${KNOWLEDGE_BASE}

**WHATSAPP LEAD STRATEGY**:
- Your primary goal is to get their phone number to send information on WhatsApp.
- **Value-Add Phase**: Say "I'd love to WhatsApp you our Client Construction Handbook and a few project videos that match your style. What's the best number for you?"
- **Meeting Phase**: "I can share the booking link and a detailed cost breakdown on WhatsApp so you have it handy. What's your number?"
- **Probing First**: Don't ask for the number in the very first message unless they ask for a quote immediately. Build rapport first by answering their initial question and asking a probing question back.

**Behavior**:
- If they ask about price, give a range but explain that site conditions (soil type, road width) affect it. Offer to WhatsApp a detailed PDF.
- If you don't know something, don't guess. Say, "That's a great technical question—let me WhatsApp you a spec sheet or have our architect explain it. What's your number?"

**BROWSER CONTROL CAPABILITIES**:
You have the ability to control the user's browser to help them.
- If they ask to see the calculator or estimate, output a command to navigate them.
- If they give specific details for an estimate (e.g., "I have a 30x40 site", "I want a luxury home", "My name is John"), you can SET these values in the calculator.

**COMMAND FORMAT**:
To take action, output a JSON command block at the end of your message in this EXACT format:
\`\`\`
<<<COMMAND: {"type": "NAVIGATE", "payload": {"path": "/calculator"}}>>>
\`\`\`
OR
\`\`\`
<<<COMMAND: {"type": "UPDATE_CALCULATOR", "payload": {"clientName": "John", "builtUpArea": 2400, "tier": "imperial"}}>>>
\`\`\`
Use the 'UPDATE_CALCULATOR' command to set values. Valid tiers: 'civitas', 'urbane', 'metro', 'cosmo', 'regal', 'veridia', 'imperial', 'sovereign'.
ONLY output the command if the user explicitly asks for an action or gives data for the calculator.
\``
                    },
                    ...messages
                        .filter(m => m.id !== 'welcome')
                        .map(m => ({
                            role: m.role,
                            content: m.text
                        })),
                    {
                        role: "user",
                        content: userMessage.text
                    }
                ],
            }, {
                headers: {
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "DezignPool Website",
                }
            });

            const text = completion.choices[0]?.message?.content || "I couldn't generate a response.";

            // Parse for commands
            const commandRegex = /<<<COMMAND:\s*({.*?})>>>/s;
            const commandMatch = text.match(commandRegex);

            let cleanText = text;

            if (commandMatch) {
                try {
                    const commandJson = JSON.parse(commandMatch[1]);
                    console.log("AI Command Received:", commandJson);

                    // Execute Navigation directly
                    if (commandJson.type === 'NAVIGATE') {
                        navigate(commandJson.payload.path);
                    }

                    // Dispatch other events
                    dispatchAICommand(commandJson);

                    // Remove command from visible text
                    cleanText = text.replace(commandRegex, '').trim();
                    if (!cleanText) cleanText = "I've started that for you!";
                } catch (e) {
                    console.error("Failed to parse AI command:", e);
                }
            }

            // Remove markdown symbols (**, ###) from the response strictly
            cleanText = cleanText.replace(/\*\*/g, '').replace(/###/g, '').replace(/`/g, '');

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: cleanText,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error: any) {
            console.error('OpenAI/OpenRouter Error:', error);

            let userFriendlyError = "I'm having trouble connecting.";
            if (error?.status === 401) {
                userFriendlyError = "Authentication Error. Please check API Key.";
            } else if (error?.status === 402) {
                userFriendlyError = "Credits Expired. Please top up your OpenRouter account.";
            } else if (error?.status === 429) {
                userFriendlyError = "Too many requests. Please try again later.";
            } else {
                userFriendlyError = `Connection Error: ${error.message || 'Unknown error'}`;
            }

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: userFriendlyError,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatMessageText = (text: string) => {
        // Regex to capture URLs. Note: simple regex, might catch trailing punctuation.
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                // Clean trailing punctuation that might have been captured
                let cleanUrl = part;
                let suffix = '';
                const punctuationMatch = part.match(/[.,!?)]+$/);

                if (punctuationMatch) {
                    suffix = punctuationMatch[0];
                    cleanUrl = part.slice(0, -suffix.length);
                }

                if (cleanUrl.includes('calendar.app.google') || cleanUrl.includes('calendly.com')) {
                    return (
                        <span key={index} className="inline-flex items-center">
                            <a
                                href={cleanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-secondary-600 hover:bg-secondary-700 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors mx-1 no-underline"
                            >
                                <Calendar className="w-3 h-3" />
                                Book Call
                            </a>
                            {suffix}
                        </span>
                    );
                }
                return (
                    <span key={index}>
                        <a
                            href={cleanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary-600 hover:underline break-all"
                        >
                            {cleanUrl}
                        </a>
                        {suffix}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
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
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-secondary-600 to-secondary-700 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">Sarah</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-secondary-100 text-xs text-medium">Online Support</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={CALENDLY_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-secondary-700 rounded-full transition-colors flex items-center gap-1.5 shadow-md font-bold"
                                    title="Book Consultation"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs whitespace-nowrap">Book Call</span>
                                </a>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/20 text-white rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-950/50 scroll-smooth">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${message.role === 'user'
                                            ? 'bg-secondary-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                            }`}
                                    >
                                        <div className="markdown-body whitespace-pre-wrap font-sans">
                                            {formatMessageText(message.text)}
                                        </div>
                                        <span className={`text-[10px] mt-1 block opacity-70 ${message.role === 'user' ? 'text-secondary-100' : 'text-gray-400'}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
                                        <span className="text-xs text-gray-500">Typing...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500/50 placeholder-gray-500 transition-all border-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="absolute right-2 p-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:opacity-50 disabled:hover:bg-secondary-600 transition-colors shadow-md"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400">DezignPool Support • Answers may vary</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto p-4 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all relative group"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <X key="close" className="w-7 h-7" />
                    ) : (
                        <MessageCircle key="open" className="w-7 h-7" />
                    )}
                </AnimatePresence>

                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 whitespace-nowrap hidden group-hover:block"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Chat with Sarah</span>
                            <Sparkles className="w-3 h-3 text-yellow-500" />
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45 border-r border-t border-gray-100 dark:border-gray-700"></div>
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
