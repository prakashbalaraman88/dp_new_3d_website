import { motion } from 'framer-motion';

interface IllustratedSectionProps {
  image: string;
  title: string;
  description: string;
  reverse?: boolean;
  alt: string;
}

export default function IllustratedSection({ image, title, description, reverse = false, alt }: IllustratedSectionProps) {
  return (
    <section className="py-24 md:py-48 bg-main relative overflow-visible">
      {/* Geometric Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large floating shapes */}
        <div className={`absolute ${reverse ? 'left-0' : 'right-0'} top-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl`} />
        <div className={`absolute ${reverse ? 'right-0' : 'left-0'} bottom-0 w-[500px] h-[500px] bg-accent-light/5 rounded-full blur-3xl`} />
        
        {/* Small geometric elements */}
        <div className="absolute left-1/4 top-1/4 w-8 h-8 border-2 border-secondary/20 rotate-45 animate-pulse" />
        <div className="absolute right-1/3 bottom-1/3 w-12 h-12 border-2 border-accent-light/20 rounded-full animate-pulse" />
        <div className="absolute left-2/3 top-1/2 w-6 h-6 bg-accent-dark/20 rotate-12 animate-pulse" />
      </div>

      <div className="relative max-w-[90rem] mx-auto px-4">
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 lg:gap-0`}>
          <motion.div 
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8 }}
            className={`w-full lg:w-2/3 ${reverse ? 'lg:-ml-24' : 'lg:-mr-24'} z-10`}
          >
            <div className="relative group">
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-accent-gradient opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] z-10" />
              
              {/* Main image */}
              <div className="relative overflow-hidden rounded-xl md:rounded-[2rem] shadow-2xl">
                <div className="relative h-[50vh] md:h-[70vh] transform-gpu transition-transform duration-1000 ease-out group-hover:scale-110">
                  <img
                    src={image}
                    alt={alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    width="1200"
                    height="800"
                  />
                </div>
              </div>

              {/* Decorative border */}
              <div className="absolute -inset-2 border border-secondary/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform-gpu group-hover:scale-105" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 p-8 md:p-12 lg:p-24 bg-main/80 backdrop-blur-sm rounded-3xl shadow-xl z-20 relative overflow-hidden"
          >
            {/* Content background decorations */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-accent-light/5 rounded-full blur-xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-serif mb-6 md:mb-8 leading-tight">
                <span className="text-accent-light">{title}</span>
              </h2>
              <p className="text-lg md:text-xl text-accent-light leading-relaxed">
                {description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}