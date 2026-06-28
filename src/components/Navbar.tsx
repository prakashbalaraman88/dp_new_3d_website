import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import ProjectForm from './ProjectForm';

export default function Navbar() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    if (href === '/#contact') {
      setIsFormOpen(true);
      return;
    }
    
    if (location.pathname !== '/' && href.startsWith('/#')) {
      window.location.href = href;
      return;
    }

    const id = href.split('#')[1];
    if (!id) return;

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/#projects', label: 'Projects' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled ? 'py-2' : 'py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`
          relative
          rounded-full
          transition-all duration-500
          overflow-hidden
          ${scrolled 
            ? 'bg-main/95 backdrop-blur-sm border border-accent/20 shadow-lg' 
            : 'bg-main/40 backdrop-blur-sm'}
        `}>
          <div 
            className="absolute inset-0 bg-secondary/20 origin-left transition-transform duration-300"
            style={{ 
              transform: `scaleX(${scrollProgress / 100})`,
              opacity: scrolled ? 1 : 0
            }}
          />

          <div className="relative flex justify-between items-center h-16 px-4">
            <Link 
              to="/"
              className="flex items-center transform transition-transform duration-300 hover:scale-105"
            >
              <Logo showText={false} className="md:-my-8 -my-12 scale-100 md:scale-75" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={(e) => item.href.includes('#') ? handleNavClick(e, item.href) : undefined}
                  className={`relative text-accent hover:text-secondary transition-colors duration-300 py-2 group ${
                    location.pathname === item.href ? 'text-secondary' : ''
                  }`}
                >
                  {item.label}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-secondary transform origin-left transition-transform duration-300 ${
                    location.pathname === item.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              ))}
              <button 
                onClick={() => setIsFormOpen(true)}
                className="px-6 py-2 rounded-full bg-secondary text-main hover:bg-secondary-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Contact Us
              </button>
            </div>

            <button 
              onClick={() => setIsFormOpen(true)}
              className="md:hidden px-6 py-2 rounded-full bg-secondary text-main hover:bg-secondary-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </nav>
  );
}