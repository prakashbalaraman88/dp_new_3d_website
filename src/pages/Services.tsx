import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Compass, PenTool, Building2, HomeIcon, Ruler, Palette } from 'lucide-react';
import ProjectForm from '../components/ProjectForm';
import { useState } from 'react';

const services = [
  {
    icon: Compass,
    title: 'Architectural Alchemy',
    description: 'Where physics meets fantasy. We create architectural masterpieces that make gravity jealous and your neighbors question their life choices.',
    features: [
      'Project Management (Like A Symphony, But With More Hard Hats)',
      'Quality Control (We\'re Professionally Obsessive)',
      'Timeline Mastery (We Make Deadlines Our BFFs)',
      'Budget Brilliance (Luxury That Won\'t Require Selling A Kidney)'
    ],
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000'
  },
  {
    icon: Building2,
    title: 'Construction Couture',
    description: 'We turn "impossible" blueprints into reality. Our construction team treats every project like a Swiss watch – precise, reliable, and worth bragging about.',
    features: [
      'Precision Engineering (Because "Close Enough" Isn\'t In Our Vocabulary)',
      'Safety First (But Style Is A Close Second)',
      'Innovation Integration (Future-Proofing Your Investment)',
      'Master Craftsmanship (No Rookie Moves Here)'
    ],
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000'
  },
  {
    icon: HomeIcon,
    title: 'Interior Wizardry',
    description: 'Because "Live, Laugh, Love" signs are not our idea of decor. We create spaces that whisper luxury while making bold statements.',
    features: [
      'Space Planning (Making Square Feet Feel Like Acres)',
      'Material Selection (Only The Cream Of The Crop)',
      'Custom Furniture (Because Basic Is Not In Our DNA)',
      'Lighting Design (Setting The Mood, Always)'
    ],
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000'
  },
  {
    icon: Ruler,
    title: 'Space Symphony',
    description: 'We orchestrate spaces like Mozart composed symphonies – with precision, passion, and just a touch of showing off.',
    features: [
      'Flow Analysis (No More Awkward Corner Moments)',
      'Ergonomic Excellence (Comfort Is King)',
      'Storage Solutions (Hide & Chic)',
      'Accessibility Planning (Style For Everyone)'
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000'
  },
  {
    icon: Palette,
    title: 'Design Therapy',
    description: 'We\'re like design therapists, but instead of asking about your childhood, we ask about your color preferences (though both might come up).',
    features: [
      'Color Psychology (Because Beige Is Not A Personality)',
      'Trend Analysis (Staying Ahead Of The Curve)',
      'Style Consultation (Finding Your Inner Fabulous)',
      'Material Matchmaking (Perfect Pairs Only)'
    ],
    image: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2000'
  },
  {
    icon: PenTool,
    title: 'Bespoke Brilliance',
    description: 'For when "off the shelf" feels too much like settling. We create custom solutions that fit your lifestyle like a tailored suit.',
    features: [
      'Custom Creations (As Unique As Your Fingerprint)',
      'Personalized Planning (Your Dreams, Our Expertise)',
      'Detail Mastery (Obsession Is Our Profession)',
      'Innovation Integration (Tomorrow\'s Solutions Today)'
    ],
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000'
  }
];

export default function Services() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-32 bg-main">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000"
            alt="Services"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-main via-main/90 to-main" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif mb-6"
          >
            Services That Make <span className="text-secondary">Jaws Drop</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-accent max-w-3xl mx-auto mb-8"
          >
            Warning: Our designs may cause spontaneous gasps of delight and severe cases of neighbor envy
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => setIsFormOpen(true)}
            className="px-8 py-3 bg-secondary text-main rounded-md hover:bg-secondary-600 transition-all duration-300 transform hover:scale-105"
          >
            Start Your Masterpiece
          </motion.button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-main relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-secondary/10 backdrop-blur-sm border border-secondary/20 hover:border-secondary/50 transition-all duration-300">
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

                  <div className="relative p-8">
                    <service.icon className="h-16 w-16 text-secondary mb-6" />
                    <h3 className="text-2xl font-serif text-white mb-4">{service.title}</h3>
                    <p className="text-accent mb-6">{service.description}</p>
                    <ul className="space-y-3">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-accent">
                          <span className="w-2 h-2 rounded-full bg-secondary mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}