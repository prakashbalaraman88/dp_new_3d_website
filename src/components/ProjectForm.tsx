import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendEmail } from '../utils/emailjs';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectForm({ isOpen, onClose }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await sendEmail({
        template_id: "template_g0npg5i",
        service_id: "service_s4zfuyo",
        user_id: "98i8Pncvl-khTXgn5",
        template_params: {
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          message: data.message || 'No message provided',
          to_name: "DezignPool Team",
          reply_to: data.email,
          form_type: "Project Form"
        }
      });

      setSubmitStatus('success');
      reset();
      setTimeout(() => {
        setSubmitStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-main/95 rounded-2xl shadow-2xl overflow-y-auto"
          >
            {/* Abstract Background Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48">
                <div className="absolute inset-0 border-2 border-secondary/20 rounded-full transform rotate-45" />
                <div className="absolute inset-4 border-2 border-secondary/10 rounded-full" />
              </div>
              
              <div className="absolute -bottom-16 -left-16 w-48 h-48">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full transform -rotate-45" />
                <div className="absolute inset-4 border-2 border-accent/10 rounded-full" />
              </div>

              <div className="absolute top-0 right-0 w-1/2 h-1/2 border-t-2 border-r-2 border-secondary/10 rounded-tr-full transform rotate-12" />
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-b-2 border-l-2 border-accent/10 rounded-bl-full transform -rotate-12" />
            </div>

            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-accent hover:text-secondary transition-colors z-10 p-1.5 rounded-full bg-main/50 backdrop-blur-sm border border-accent/20 hover:border-secondary/50"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-3">
                  <div className="relative">
                    <div className="absolute -inset-3 bg-accent-gradient opacity-20 blur-xl rounded-full" />
                    <Sparkles className="h-8 w-8 text-secondary relative z-10" />
                  </div>
                </div>
                <h2 className="text-2xl font-serif mb-2">Let's Create Something Extraordinary</h2>
                <p className="text-accent text-sm">
                  Warning: Side effects may include increased property value and severe neighbor envy.
                </p>
              </div>
              
              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="text-secondary text-xl mb-3">Brilliance is Brewing!</div>
                  <p className="text-accent">We'll be in touch faster than you can say "accent wall".</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-accent mb-1">
                      Your Name <span className="text-secondary">*</span>
                    </label>
                    <input
                      {...register('name')}
                      className="w-full px-3 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-accent/50 transition-all duration-300"
                      placeholder="How shall we address you?"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-accent mb-1">
                      Email <span className="text-secondary">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-3 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-accent/50 transition-all duration-300"
                      placeholder="Where shall we send the magic?"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-accent mb-1">
                      Phone <span className="text-secondary">*</span>
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-3 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-accent/50 transition-all duration-300"
                      placeholder="For when email just won't do"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-accent mb-1">
                      Your Vision
                    </label>
                    <textarea
                      {...register('message')}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white placeholder-accent/50 transition-all duration-300"
                      placeholder="Tell us about your dream space..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-secondary text-main rounded-lg hover:bg-secondary-600 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-main border-t-transparent rounded-full animate-spin mr-2" />
                          Creating Magic...
                        </div>
                      ) : (
                        'Begin the Journey'
                      )}
                    </span>
                  </button>

                  {submitStatus === 'error' && (
                    <p className="text-red-400 text-center mt-4 text-sm">
                      Oops! Something went wrong. Please try again.
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}