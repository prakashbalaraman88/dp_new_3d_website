import { motion } from 'framer-motion';
import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Team = () => {
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});
  const sectionRef = useScrollAnimation({ threshold: 0.2, triggerOnce: true });

  const team = [
    {
      name: "Kishan NS",
      role: "Chief Interior Designer",
      image: "/assets/images/team-kishan.png",
      thumbnailImage: "/assets/images/team-kishan.png",
      bio: "The Michelangelo of modern interiors with a PhD in perfection. Known to redesign entire rooms because a shadow fell at a 43° angle instead of the intended 45°. His designs are so perfect, they make minimalists feel overdressed."
    },
    {
      name: "Krupanka Gowda",
      role: "Senior Designer",
      image: "/assets/images/team-krupanka.png",
      thumbnailImage: "/assets/images/team-krupanka.png",
      bio: "A perfectionist who can spot a misaligned tile from the International Space Station. Has been known to engage in heated debates about the psychological impact of different shades of beige. Yes, we timed these debates."
    },
    {
      name: "Ar. Prashanth Kumar",
      role: "Lead Architect",
      image: "/assets/images/team-prashanth.png",
      thumbnailImage: "/assets/images/team-prashanth.png",
      bio: "The architectural maverick who makes gravity question its life choices. When he's not defying physics with his designs, he's probably sketching buildings that make the Burj Khalifa feel like a garden shed."
    },
    {
      name: "Ashwini",
      role: "Interior Designer",
      image: "/assets/images/team-ashwini.png",
      thumbnailImage: "/assets/images/team-ashwini.png",
      bio: "Our resident color whisperer who firmly believes beige is not a personality trait. She can turn your Pinterest board disasters into masterpieces, because let's face it, your pins need professional intervention."
    },
    {
      name: "Nithin Kumar",
      role: "Senior Project Engineer",
      image: "/assets/images/team-nithin.png",
      thumbnailImage: "/assets/images/team-nithin.png",
      bio: "The wizard who turns architectural fantasies into structural realities. So meticulous, he once spent three hours debating the perfect angle for a doorknob. The door ended up winning an award, so we can't really complain."
    },
    {
      name: "Adarsh HY",
      role: "Sales Head",
      image: "/assets/images/team-adarsh.jpg",
      thumbnailImage: "/assets/images/team-adarsh.jpg",
      bio: "Our charismatic cash flow maestro who could sell ice to penguins and make them thank him for it. Warning: May spontaneously break into passionate monologues about design possibilities until your wallet voluntarily opens itself."
    }
  ];

  const handleImageLoad = (name: string) => {
    setLoadedImages(prev => ({ ...prev, [name]: true }));
  };

  return (
    <section 
      ref={sectionRef}
      className="scroll-section py-24 bg-main relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.6,
              delay: 0 
            }
          }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif mb-4">Meet the Dream Team</h2>
          <p className="text-xl text-accent max-w-2xl mx-auto">
            Not your average design squad. We're the rebels who color outside the lines (but only when it's aesthetically pleasing).
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.6,
                  delay: index * 0.1 
                }
              }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative p-8 bg-secondary/10 backdrop-blur-sm rounded-2xl border border-secondary/20 hover:border-secondary/50 transition-all duration-300 overflow-hidden">
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
                
                <div className="relative">
                  <div className="mb-6 transform-gpu transition-all duration-500 group-hover:scale-105">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-accent-gradient opacity-20 blur-xl rounded-full transition-opacity duration-500 group-hover:opacity-40" />
                      <div className="relative w-32 h-32 mx-auto">
                        {/* Blur placeholder */}
                        <img
                          src={member.thumbnailImage}
                          alt={`Loading ${member.name}`}
                          className={`absolute inset-0 w-full h-full rounded-full object-cover transition-opacity duration-500 ${loadedImages[member.name] ? 'opacity-0' : 'opacity-100'}`}
                          style={{
                            objectPosition: member.name === "Adarsh HY" ? "center top" : "center"
                          }}
                        />
                        {/* Main image */}
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`w-full h-full rounded-full object-cover ring-4 ring-secondary/20 group-hover:ring-secondary/40 transition-all duration-500 ${loadedImages[member.name] ? 'opacity-100' : 'opacity-0'}`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(member.name)}
                          style={{
                            objectPosition: member.name === "Adarsh HY" ? "center top" : "center"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-secondary transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-secondary mb-4">{member.role}</p>
                    <p className="text-accent">{member.bio}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;