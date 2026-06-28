interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  posterImage: string;
  images: string[];
}

export const projectsData: Record<string, Project> = {
  'phoenix-kessaku': {
    id: 'phoenix-kessaku',
    title: "Phoenix Kessaku",
    category: "Luxury Residential",
    description: `An epitome of luxury living, Phoenix Kessaku represents the perfect harmony between Japanese minimalism and modern sophistication. This 3BHK residence showcases meticulous attention to detail, featuring custom-designed furniture pieces, premium materials, and thoughtfully curated spaces that elevate everyday living to an art form. The design philosophy embraces clean lines, natural materials, and a seamless flow between spaces, creating an atmosphere of tranquility and refined elegance.`,
    videoUrl: "/assets/videos/project-1.mp4",
    posterImage: "/assets/images/Project%201/photorealistic-3d-render-of-a-master-bedroom-tv-un-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project%201/photorealistic-3d-render-of-a-master-bedroom-tv-un-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/hyper-detailed-3d-render-of-a-spa-like-master-bath-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/hyper-detailed-interior-visualization-of-a-contemp-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/photorealistic-3d-render-of-a-sophisticated-guest--gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/ultra-realistic-3d-render-of-a-luxurious-master-be-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/ultra-realistic-3d-render-of-a-sophisticated-livin-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/ultra-realistic-3d-render-of-the-master-bedroom-fr-gigapixel-redefine-2x-min.png",
      "/assets/images/Project%201/ultra-realistic-architectural-visualization-of-a-c-gigapixel-redefine-2x-min.png"
    ]
  },
  'brigade-exotica': {
    id: 'brigade-exotica',
    title: "Brigade Exotica",
    category: "Modern Minimalism",
    description: `Brigade Exotica stands as a testament to modern minimalist design principles, where sophistication meets functionality in this stunning 3BHK apartment. The design capitalizes on the panoramic views while creating intimate spaces that reflect contemporary luxury. Each room is thoughtfully crafted with a focus on clean aesthetics, premium materials, and innovative space utilization, resulting in a home that's both visually striking and supremely comfortable.`,
    videoUrl: "/assets/videos/project-2.mp4",
    posterImage: "/assets/images/Project%202/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project%202/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      // Add Project 2 image paths here
    ]
  },
  'prestige-golf-view': {
    id: 'prestige-golf-view',
    title: "Prestige Golf View",
    category: "Sustainable Luxury",
    description: `Prestige Golf View represents the perfect blend of sustainable design and luxury living. This 4BHK villa showcases how eco-conscious choices can coexist with premium finishes and sophisticated design. The project features energy-efficient systems, sustainable materials, and biophilic design elements that create a harmonious connection with nature, all while maintaining the highest standards of luxury and comfort.`,
    videoUrl: "/assets/videos/project-3.mp4",
    posterImage: "/assets/images/Project%203/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project%203/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      // Add Project 3 image paths here
    ]
  },
  'urban-oasis': {
    id: 'urban-oasis',
    title: "Urban Oasis",
    category: "Contemporary Living",
    description: `Urban Oasis redefines contemporary living with its seamless indoor-outdoor flow and innovative design solutions. This project demonstrates how modern architecture can create spaces that are both luxurious and livable, featuring custom installations, smart home integration, and carefully curated design elements that come together to create a truly unique living experience.`,
    videoUrl: "/assets/videos/project-4.mp4",
    posterImage: "/assets/images/Project%204/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project%204/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      // Add Project 4 image paths here
    ]
  },
  'skyline-retreat': {
    id: 'skyline-retreat',
    title: "Skyline Retreat",
    category: "Urban Luxury",
    description: `Skyline Retreat is a penthouse that offers the perfect balance of urban sophistication and comfortable living. With stunning city views as its backdrop, this residence features modern amenities, custom-designed furniture, and innovative space planning that maximizes both functionality and aesthetic appeal. The design embraces contemporary luxury while creating intimate spaces for relaxation and entertainment.`,
    videoUrl: "/assets/videos/project-5.mp4",
    posterImage: "/assets/images/Project%205/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project%205/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      // Add Project 5 image paths here
    ]
  },
  'serenity-haven': {
    id: 'serenity-haven',
    title: "Serenity Haven",
    category: "Classic Elegance",
    description: `Serenity Haven combines traditional architectural elements with modern touches to create a timeless living space. This villa showcases how classical design principles can be reimagined for contemporary living, featuring elegant moldings, premium materials, and sophisticated furnishings that create an atmosphere of refined luxury and comfort.`,
    videoUrl: "/assets/videos/project-6.mp4",
    posterImage: "/assets/images/Project%206/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project%206/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      // Add Project 6 image paths here
    ]
  }
};
