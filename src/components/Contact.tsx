import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, Mail, Send, Sparkles } from 'lucide-react';
import { sendEmail } from '../utils/emailjs';
import ProjectForm from './ProjectForm';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  message: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

export default function Contact() {
  const [isFormOpen, setIsFormOpen] = useState(false);
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
          form_type: "Contact Form"
        }
      });

      setSubmitStatus('success');
      reset();
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="contact" className="py-24 bg-main relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-stretch">
            {/* Left Column - Contact Info */}
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-8 w-8 text-secondary" />
                <h2 className="text-4xl font-serif">Let's Create Magic</h2>
              </div>
              
              <p className="text-xl text-accent mb-12">
                Ready to transform your space into something extraordinary? Let's start a conversation about your vision. Whether it's a cozy home, a stunning office, or a luxurious commercial space, we're here to bring your dreams to life.
              </p>
              
              <div className="space-y-8 flex-grow">
                <div className="group">
                  <div className="relative p-6 bg-secondary/10 backdrop-blur-sm rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl" />
                    <div className="flex items-start">
                      <MapPin className="h-6 w-6 text-secondary mt-1 shrink-0" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium mb-2">Visit Us</h3>
                        <p className="text-accent">Goodu. No 1, Greenvalley Cleartitle,<br />Mylasandra, Bangalore 560100</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="relative p-6 bg-secondary/10 backdrop-blur-sm rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl" />
                    <div className="flex items-start">
                      <Phone className="h-6 w-6 text-secondary mt-1 shrink-0" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium mb-2">Call Us</h3>
                        <a href="tel:+917892434663" className="text-accent hover:text-secondary transition-colors">
                          +91 7892434663
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="relative p-6 bg-secondary/10 backdrop-blur-sm rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl" />
                    <div className="flex items-start">
                      <Mail className="h-6 w-6 text-secondary mt-1 shrink-0" />
                      <div className="ml-4">
                        <h3 className="text-lg font-medium mb-2">Email Us</h3>
                        <a href="mailto:info@dezignpool.com" className="text-accent hover:text-secondary transition-colors break-all">
                          info@dezignpool.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="h-full">
              <div className="h-full p-8 bg-secondary/10 backdrop-blur-sm rounded-2xl border border-secondary/20">
                <h3 className="text-2xl font-serif mb-6">Send Us a Message</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 h-full flex flex-col">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-accent mb-1">
                      Name <span className="text-secondary">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-accent mb-1">
                      Email <span className="text-secondary">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className="w-full px-4 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-accent mb-1">
                      Phone <span className="text-secondary">*</span>
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="flex-grow">
                    <label htmlFor="message" className="block text-sm font-medium text-accent mb-1">
                      Your Vision
                    </label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={6}
                      className="w-full h-full px-4 py-2 bg-white/5 border border-accent/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-white"
                      placeholder="Tell us about your dream space..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-secondary text-main rounded-lg hover:bg-secondary-600 transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-main border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>

                  {submitStatus === 'success' && (
                    <p className="text-green-400 text-center">Message sent successfully!</p>
                  )}
                  {submitStatus === 'error' && (
                    <p className="text-red-400 text-center">Failed to send message. Please try again.</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}