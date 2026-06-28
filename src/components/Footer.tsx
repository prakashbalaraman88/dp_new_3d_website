import { motion } from 'framer-motion';
import Logo from './Logo';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-main relative overflow-hidden">
      {/* Geometric Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        
        {/* Small geometric elements */}
        <div className="absolute left-1/4 top-1/4 w-8 h-8 border-2 border-secondary/20 rotate-45 animate-pulse" />
        <div className="absolute right-1/3 bottom-1/3 w-12 h-12 border-2 border-accent/20 rounded-full animate-pulse" />
        <div className="absolute left-2/3 top-1/2 w-6 h-6 bg-accent/20 rotate-12 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-1 flex items-start"
          >
            <Logo showText={false} className="scale-125" />
          </motion.div>
          
          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <a href="#services" className="text-accent hover:text-secondary transition-colors">Services</a>
              </li>
              <li>
                <a href="#projects" className="text-accent hover:text-secondary transition-colors">Projects</a>
              </li>
              <li>
                <a href="#about" className="text-accent hover:text-secondary transition-colors">About Us</a>
              </li>
              <li>
                <a href="#contact" className="text-accent hover:text-secondary transition-colors">Contact</a>
              </li>
            </ul>
          </motion.div>
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-accent">
                <MapPin className="h-5 w-5 text-secondary mr-3 shrink-0 mt-1" />
                <span className="break-words">Goodu. No 1, Greenvalley Cleartitle, Mylasandra, Bangalore 560100</span>
              </li>
              <li className="flex items-center text-accent">
                <Phone className="h-5 w-5 text-secondary mr-3 shrink-0" />
                <a href="tel:+917892434663" className="hover:text-secondary transition-colors">
                  +91 7892434663
                </a>
              </li>
              <li className="flex items-center text-accent">
                <Mail className="h-5 w-5 text-secondary mr-3 shrink-0" />
                <a href="mailto:info@dezignpool.com" className="hover:text-secondary transition-colors break-all">
                  info@dezignpool.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
        
        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8 border-t border-accent/20"
        >
          <div className="flex flex-wrap gap-4 justify-center">
            <a 
              href="https://www.instagram.com/dezignpool"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-secondary/20 transition-colors group"
            >
              <Instagram className="h-5 w-5 text-accent group-hover:text-secondary transition-colors" />
            </a>
            <a 
              href="https://www.facebook.com/dezignpool"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-secondary/20 transition-colors group"
            >
              <Facebook className="h-5 w-5 text-accent group-hover:text-secondary transition-colors" />
            </a>
            <a 
              href="https://www.youtube.com/@dezignpool"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center hover:bg-secondary/20 transition-colors group"
            >
              <Youtube className="h-5 w-5 text-accent group-hover:text-secondary transition-colors" />
            </a>
          </div>
        </motion.div>
        
        {/* Copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-accent">
            &copy; {new Date().getFullYear()} DezignPool. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}