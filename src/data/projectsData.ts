export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  video: string;
  poster: string;
  images: string[];
  details: {
    client: string;
    location: string;
    year: string;
    size: string;
    scope: string[];
  };
}

export const projects: Project[] = [
  {
    id: 'phoenix-kessaku',
    title: "Phoenix Kessaku",
    category: "Luxury Residential",
    description: "Modern 3BHK with Japanese minimalist design",
    video: "/assets/videos/project-1.mp4",
    poster: "/assets/images/Project 1/photorealistic-3d-render-of-a-master-bedroom-tv-un-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project 1/ultra-realistic-3d-render-of-a-contemporary-luxury-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/ultra-realistic-3d-render-of-a-luxurious-master-be-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/ultra-realistic-3d-render-of-a-sophisticated-livin-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/ultra-realistic-3d-render-of-the-master-bedroom-fr-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/ultra-realistic-architectural-visualization-of-a-c-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/hyper-detailed-3d-render-of-a-spa-like-master-bath-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/hyper-detailed-interior-visualization-of-a-contemp-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/photorealistic-3d-render-of-a-master-bedroom-tv-un-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 1/photorealistic-3d-render-of-a-sophisticated-guest--gigapixel-redefine-2x-min.png"
    ],
    details: {
      client: "Phoenix Group",
      location: "Bangalore, India",
      year: "2023",
      size: "3,200 sq.ft",
      scope: ["Interior Design", "Space Planning", "Furniture Selection", "Lighting Design", "Art Curation"]
    }
  },
  {
    id: 'brigade-exotica',
    title: "Brigade Exotica",
    category: "Modern Minimalism",
    description: "Sophisticated 3BHK with panoramic views",
    video: "/assets/videos/project-2.mp4",
    poster: "/assets/images/Project 2/ultra-realistic-3d-render-of-a-sophisticated-famil-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project 2/ultra-realistic-3d-render-of-a-sophisticated-famil-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/ultra-realistic-3d-render-of-a-contemporary-living-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/ultra-realistic-3d-render-of-a-modern-guest-bedroo-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/ultra-detailed-visualization-of-a-modern-entrance--gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/ultra-realistic-visualization-of-a-modern-white-ki (1)-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/hyper-detailed-3d-render-of-a-contemporary-bedroom-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/hyper-detailed-3d-render-of-a-serene-master-bedroo-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/photorealistic-render-of-a-contemporary-dining-spa-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 2/photorealistic-visualization-of-a-sophisticated-be-gigapixel-redefine-2x-min.png"
    ],
    details: {
      client: "Brigade Group",
      location: "Bangalore, India",
      year: "2023",
      size: "2,800 sq.ft",
      scope: ["Interior Design", "Space Planning", "Custom Furniture", "Material Selection", "Styling"]
    }
  },
  {
    id: 'prestige-golf-view',
    title: "Prestige Golf View",
    category: "Sustainable Luxury",
    description: "Eco-conscious 4BHK villa with premium finishes",
    video: "/assets/videos/project-3.mp4",
    poster: "/assets/images/Project 3/photorealistic-render-of-a-luxury-guest-suite-comb-gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project 3/photorealistic-render-of-a-luxury-guest-suite-comb-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/ultra-realistic-3d-render-of-a-contemporary-living-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/ultra-realistic-3d-render-of-a-modern-kitchen-feat-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/hyper-detailed-3d-render-of-a-luxurious-master-sui-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/hyper-detailed-3d-render-of-a-serene-master-suite--gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/photorealistic-render-of-a-contemporary-bedroom-fe-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/photorealistic-visualization-of-an-intimate-entert-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/ultra-realistic-3d-render-of-a-contemporary-living (1)-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 3/ultra-realistic-3d-render-of-a-contemporary-living (2)-gigapixel-redefine-2x-min.png"
    ],
    details: {
      client: "Prestige Group",
      location: "Bangalore, India",
      year: "2023",
      size: "4,500 sq.ft",
      scope: ["Interior Design", "Sustainable Design", "Custom Furniture", "Smart Home Integration", "Landscape Design"]
    }
  },
  {
    id: 'urban-oasis',
    title: "Urban Oasis",
    category: "Contemporary Living",
    description: "Luxurious living space with seamless indoor-outdoor flow",
    video: "/assets/videos/project-4.mp4",
    poster: "/assets/images/Project 4/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project 4/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min.png",
      "/assets/images/Project 4/ultra-realistic-3d-render-of-a-modern-guest-bedroo-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 4/ultra-realistic-render-of-an-eco-conscious-kitchen-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 4/hyper-detailed-visualization-of-a-serene-master-su-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 4/photorealistic-render-of-a-comfortable-family-spac-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 4/photorealistic-visualization-of-a-modern-living-sp-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 4/photorealistic-visualization-of-a-sophisticated-be-gigapixel-redefine-2x-min.png"
    ],
    details: {
      client: "Private Residence",
      location: "Bangalore, India",
      year: "2023",
      size: "3,800 sq.ft",
      scope: ["Interior Design", "Space Planning", "Custom Millwork", "Outdoor Living Design", "Lighting Design"]
    }
  },
  {
    id: 'skyline-retreat',
    title: "Skyline Retreat",
    category: "Urban Luxury",
    description: "Penthouse with stunning city views and modern amenities",
    video: "/assets/videos/project-5.mp4",
    poster: "/assets/images/Project 5/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min.png",
    images: [
      "/assets/images/Project 5/ultra-realistic-3d-render-of-a-contemporary-three--gigapixel-redefine-2x-min.png",
      "/assets/images/Project 5/ultra-realistic-render-of-a-contemporary-kitchen-f-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 5/ultra-realistic-visualization-of-a-contemporary-be-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 5/hyper-detailed-visualization-of-a-sophisticated-ma-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 5/photorealistic-render-of-a-modern-bedroom-featurin-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 5/photorealistic-render-of-a-modern-family-space-fea-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 5/photorealistic-visualization-of-a-modern-living-sp-gigapixel-redefine-2x-min.png"
    ],
    details: {
      client: "Private Residence",
      location: "Bangalore, India",
      year: "2023",
      size: "5,200 sq.ft",
      scope: ["Interior Design", "Space Planning", "Custom Furniture", "Smart Home Integration", "Art Curation"]
    }
  },
  {
    id: 'serenity-haven',
    title: "Serenity Haven",
    category: "Classic Elegance",
    description: "Traditional villa with modern touches and timeless design",
    video: "/assets/videos/project-6.mp4",
    poster: "/assets/images/Project 6/photorealistic-3d-render-of-a-sophisticated-1600-s-gigapixel-redefine-2x-min-min.png",
    images: [
      "/assets/images/Project 6/photorealistic-3d-render-of-a-sophisticated-1600-s-gigapixel-redefine-2x-min-min.png",
      "/assets/images/Project 6/ultra-realistic-3d-render-of-an-elegant-living-spa-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 6/ultra-realistic-visualization-of-a-modern-kitchen--gigapixel-redefine-2x-min.png",
      "/assets/images/Project 6/hyper-detailed-render-of-a-luxurious-master-suite--gigapixel-redefine-2x-min.png",
      "/assets/images/Project 6/photorealistic-render-of-a-sophisticated-bedroom-f-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 6/photorealistic-render-of-a-sophisticated-bedroom-f (1)-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 6/photorealistic-visualization-of-a-refined-family-s-gigapixel-redefine-2x-min.png",
      "/assets/images/Project 6/ultra-detailed-visualization-of-a-refined-bedroom--gigapixel-redefine-2x-min.png"
    ],
    details: {
      client: "Private Residence",
      location: "Bangalore, India",
      year: "2023",
      size: "6,000 sq.ft",
      scope: ["Interior Design", "Space Planning", "Custom Millwork", "Material Selection", "Styling"]
    }
  }
];
