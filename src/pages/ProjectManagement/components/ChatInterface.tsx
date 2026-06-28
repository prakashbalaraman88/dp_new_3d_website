import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import { parseTransaction } from '../utils/transactionParser';
import { processImage } from '../utils/imageProcessor';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  error?: boolean;
  image?: string;
}

interface ChatInterfaceProps {
  projectId?: string;
  onClose?: () => void;
}

export default function ChatInterface({ projectId, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { projects, addTransaction } = useProjects();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{
      id: 'welcome',
      text: projectId 
        ? 'Send messages or upload receipts to add transactions to this project.'
        : 'Hi! Send me messages or upload receipts to add transactions.',
      type: 'assistant'
    }]);
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (text: string, type: 'user' | 'assistant', error = false, image?: string) => {
    const newMessage = { id: crypto.randomUUID(), text, type, error, image };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(scrollToBottom, 100);
    return newMessage;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      addMessage('Processing image...', 'assistant');

      // Create image preview URL
      const imageUrl = URL.createObjectURL(file);
      addMessage('Receipt uploaded', 'user', false, imageUrl);

      const result = await processImage(file);
      
      if (!result) {
        addMessage('Could not extract transaction details. Please try again.', 'assistant', true);
        return;
      }

      if (projectId) {
        addTransaction(projectId, {
          ...result,
          date: new Date().toISOString().split('T')[0]
        });
        addMessage('Transaction added successfully!', 'assistant');
      } else {
        setPendingTransaction(result);
        addMessage(
          `I found a ${result.type} of ₹${result.amount} for ${result.description}. Which project should I add this to?`,
          'assistant'
        );
      }
    } catch (error) {
      console.error('Image processing error:', error);
      addMessage(
        error instanceof Error ? error.message : 'Failed to process the receipt. Please try again.',
        'assistant',
        true
      );
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    setInputValue('');
    addMessage(userInput, 'user');

    try {
      const result = await parseTransaction(userInput);
      
      if (!result) {
        addMessage(
          'Sorry, I couldn\'t understand that. Please try again with a clearer message.',
          'assistant',
          true
        );
        return;
      }

      if (projectId) {
        addTransaction(projectId, {
          ...result,
          date: new Date().toISOString().split('T')[0]
        });
        addMessage('Transaction added successfully!', 'assistant');
      } else {
        setPendingTransaction(result);
        addMessage(
          `I found a ${result.type} of ₹${result.amount} for ${result.description}. Which project should I add this to?`,
          'assistant'
        );
      }
    } catch (error) {
      console.error('Message processing error:', error);
      addMessage(
        error instanceof Error ? error.message : 'Failed to process message. Please try again.',
        'assistant',
        true
      );
    }
  };

  const confirmTransaction = async (pid: string) => {
    if (!pendingTransaction) return;

    try {
      addTransaction(pid, {
        ...pendingTransaction,
        date: new Date().toISOString().split('T')[0]
      });
      addMessage('Transaction added successfully!', 'assistant');
      setPendingTransaction(null);
    } catch (error) {
      console.error('Transaction confirmation error:', error);
      addMessage(
        error instanceof Error ? error.message : 'Failed to add transaction. Please try again.',
        'assistant',
        true
      );
    }
  };

  return (
    <div className="bg-secondary/10 backdrop-blur-sm rounded-xl border border-secondary/20 overflow-hidden h-[600px] flex flex-col">
      <div className="p-4 border-b border-secondary/20 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-serif">Project Assistant</h2>
          <p className="text-sm text-accent">Send messages or upload receipts</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-secondary text-main'
                  : message.error
                  ? 'bg-red-400/10 text-white'
                  : 'bg-secondary/10 text-white'
              }`}
            >
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Receipt" 
                  className="max-w-full rounded-lg mb-2"
                />
              )}
              {message.text}
            </div>
          </motion.div>
        ))}

        {pendingTransaction && !projectId && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mt-4"
          >
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => confirmTransaction(project.id)}
                className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-lg transition-colors"
              >
                {project.name}
              </button>
            ))}
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-secondary/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
            disabled={isProcessing}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-6 h-6" />
          </button>
          <button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            className="p-2 hover:bg-secondary/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}