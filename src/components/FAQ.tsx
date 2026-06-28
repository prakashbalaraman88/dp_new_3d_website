import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "What services does DezignPool offer?",
    answer: "We offer comprehensive design services including architectural design, interior design, construction management, and custom solutions for both residential and commercial projects."
  },
  {
    question: "How long does a typical project take?",
    answer: "Project timelines vary based on scope and complexity. A typical residential project can take 3-6 months for design and 6-12 months for execution. We provide detailed timelines during initial consultation."
  },
  {
    question: "What is your design process?",
    answer: "Our design process includes initial consultation, concept development, detailed design, material selection, and execution supervision. We maintain transparent communication throughout the project."
  },
  {
    question: "Do you handle permits and approvals?",
    answer: "Yes, we handle all necessary permits and approvals as part of our service, ensuring your project complies with local regulations and building codes."
  },
  {
    question: "What is your pricing structure?",
    answer: "Our pricing is customized based on project scope, size, and requirements. We provide detailed quotes after initial consultation and site visit."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-main relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-accent max-w-2xl mx-auto">
            Everything you need to know about our services and process
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 bg-secondary/10 backdrop-blur-sm rounded-xl border border-secondary/20 hover:border-secondary/50 transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium pr-8">{faq.question}</h3>
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-secondary flex-shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-secondary flex-shrink-0" />
                  )}
                </div>
                {openIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-accent"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}