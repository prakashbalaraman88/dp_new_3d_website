import { motion } from 'framer-motion';
import { Compass, PenTool, Building2, HomeIcon } from 'lucide-react';

const services = [
  {
    icon: Compass,
    title: 'Architectural Alchemy',
    description: 'Where physics meets fantasy. We create architectural masterpieces that make gravity jealous.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000'
  },
  {
    icon: Building2,
    title: 'Construction Couture',
    description: 'We turn "impossible" blueprints into reality. Our construction team treats every project like a Swiss watch.',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000'
  },
  {
    icon: HomeIcon,
    title: 'Interior Wizardry',
    description: 'Because "Live, Laugh, Love" signs are not our idea of decor. We create spaces that whisper luxury.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000'
  },
  {
    icon: PenTool,
    title: 'Custom Solutions',
    description: 'For when "off the shelf" feels too much like settling. We create custom solutions that fit like a tailored suit.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000'
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-main relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-serif mb-4"
          >
            Our Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-accent max-w-2xl mx-auto"
          >
            Comprehensive design and construction solutions for the most discerning clients
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-full bg-secondary/10 backdrop-blur-sm rounded-2xl border border-secondary/20 hover:border-secondary/50 transition-all duration-300 overflow-hidden">
                {/* Abstract Lines */}
                <div className="absolute inset-0 overflow-hidden">
                  {/* Circular patterns */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 border-2 border-secondary/20 rounded-full group-hover:border-secondary/40 transition-colors duration-500" />
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 border-2 border-accent/20 rounded-full group-hover:border-accent/40 transition-colors duration-500" />
                  
                  {/* Diagonal lines */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 border-t-2 border-r-2 border-secondary/10 rounded-tr-full transform rotate-6 origin-bottom-left group-hover:border-secondary/30 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-b-2 border-l-2 border-accent/10 rounded-bl-full transform -rotate-6 origin-top-right group-hover:border-accent/30 transition-colors duration-500" />
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-accent-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                <div className="relative p-8 flex flex-col items-center text-center">
                  {/* Icon with animated background */}
                  <div className="relative mb-6 transform-gpu transition-transform duration-500 group-hover:scale-110">
                    <div className="absolute -inset-4 bg-accent-gradient opacity-20 blur-xl rounded-full transition-opacity duration-500 group-hover:opacity-40" />
                    <service.icon className="h-16 w-16 text-secondary relative z-10" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-secondary transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-accent">
                    {service.description}
                  </p>

                  {/* Additional decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}