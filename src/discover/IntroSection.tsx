import { motion } from 'framer-motion';
import KineticText from '../components/KineticText';

export default function IntroSection() {
  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-secondary tracking-[0.3em] uppercase text-[11px] sm:text-xs mb-6"
      >
        DezignPool · Your designer
      </motion.p>

      <h1 className="font-serif font-light text-white text-[2.3rem] leading-[1.1] sm:text-5xl md:text-6xl mb-6">
        <KineticText text="First, let’s understand your taste." highlight={['your']} trigger="inView" stagger={0.09} />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="text-white/70 text-sm sm:text-base max-w-md mx-auto mb-12"
      >
        Pick what you love across a few rooms — it’s how your designer learns your style before drawing a single wall.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="text-accent/70 text-[11px] tracking-[0.25em] uppercase"
      >
        Scroll to begin
        <div className="mt-3 mx-auto w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1">
          <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1 h-1.5 rounded-full bg-secondary" />
        </div>
      </motion.div>
    </div>
  );
}
