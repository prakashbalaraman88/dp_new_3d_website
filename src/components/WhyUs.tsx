import { motion } from 'framer-motion';
import { Award, Shield, Users, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: "Space Alchemists",
    description: "We don't just design spaces – we perform architectural alchemy, transforming ordinary rooms into extraordinary experiences. Each project is a carefully crafted potion of innovation, elegance, and just a touch of audacity."
  },
  {
    icon: Shield,
    title: "Obsessive Quality",
    description: "We're perfectionists with a sense of humor. Our attention to detail is so intense, we can spot a misaligned tile from outer space. Yes, we're that good (and slightly neurotic)."
  },
  {
    icon: Users,
    title: "Dream Team",
    description: "Our team is like the Avengers of design – minus the capes, plus better taste in furniture. Each expert brings decades of experience and an unhealthy obsession with perfect symmetry."
  },
  {
    icon: Sparkles,
    title: "Future-Forward",
    description: "We're so ahead of the curve, we're practically in next season. Our innovative designs combine cutting-edge technology with timeless elegance, because the future should look good too."
  }
];

export default function WhyUs() {
  return (
    <section className="py-24 bg-main relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif mb-4">Why Choose Us?</h2>
          <p className="text-xl text-accent max-w-2xl mx-auto">
            Because excellence with a side of wit is our specialty. We don't just raise the bar – we redesign it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
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
                    <feature.icon className="h-16 w-16 text-secondary relative z-10" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-secondary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-accent">
                    {feature.description}
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