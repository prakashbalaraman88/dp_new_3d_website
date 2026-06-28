import { LucideIcon, Compass, Palette, Building2, HomeIcon, Hotel, Store, Landmark } from 'lucide-react';

export interface Designer {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  mainImage: string;
  images: string[];
  icon: LucideIcon;
  features: string[];
  designer: Designer;
  stats: {
    area: string;
    duration: string;
    cost: string;
  };
}

export const projects: Project[] = [
  {
    id: 'luxury-villa-bangalore',
    title: "Luxury Villa",
    category: "Architecture & Interior",
    location: "Bangalore, India",
    year: "2023",
    description: "An exquisite fusion of contemporary architecture and traditional Indian elements, this luxury villa stands as a testament to sophisticated living. The design emphasizes open spaces, natural light, and seamless indoor-outdoor transitions.",
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000"
    ],
    icon: HomeIcon,
    features: [
      "Infinity Pool",
      "Smart Home Integration",
      "Sustainable Materials",
      "Private Garden"
    ],
    designer: {
      name: "Aria Patel",
      role: "Lead Architect",
      image: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?q=80&w=400",
      bio: "With over 15 years of experience in luxury residential design, Aria brings a unique perspective that blends contemporary aesthetics with traditional elements."
    },
    stats: {
      area: "12,000 sq ft",
      duration: "18 months",
      cost: "Premium"
    }
  },
  {
    id: 'modern-office-space',
    title: "Modern Office Space",
    category: "Commercial Design",
    location: "Bangalore, India",
    year: "2023",
    description: "A state-of-the-art commercial space that redefines workplace design. This project seamlessly integrates technology, comfort, and aesthetics to create an inspiring environment that promotes productivity and collaboration.",
    mainImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2000",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2000",
      "https://images.unsplash.com/photo-1536163493384-0007e248bcc3?q=80&w=2000"
    ],
    icon: Building2,
    features: [
      "Open Floor Plan",
      "Collaborative Spaces",
      "Biophilic Design",
      "Advanced Acoustics"
    ],
    designer: {
      name: "Raj Sharma",
      role: "Commercial Design Specialist",
      image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400",
      bio: "Raj specializes in creating innovative workplace environments that foster creativity and enhance employee well-being."
    },
    stats: {
      area: "25,000 sq ft",
      duration: "12 months",
      cost: "Premium"
    }
  },
  {
    id: 'penthouse-suite',
    title: "Penthouse Suite",
    category: "Interior Design",
    location: "Bangalore, India",
    year: "2023",
    description: "This luxurious penthouse represents the pinnacle of urban living, featuring custom-designed furniture, premium materials, and panoramic city views. Every detail has been carefully curated to create an unparalleled living experience.",
    mainImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2000"
    ],
    icon: Palette,
    features: [
      "360° City Views",
      "Custom Furniture",
      "Home Automation",
      "Private Terrace"
    ],
    designer: {
      name: "Maya Reddy",
      role: "Senior Interior Designer",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
      bio: "Maya's designs are known for their perfect balance of luxury and functionality, creating spaces that are both beautiful and livable."
    },
    stats: {
      area: "6,000 sq ft",
      duration: "8 months",
      cost: "Ultra Premium"
    }
  },
  {
    id: 'boutique-hotel',
    title: "Boutique Hotel",
    category: "Hospitality Design",
    location: "Bangalore, India",
    year: "2023",
    description: "A boutique hotel that redefines luxury hospitality through its distinctive design language. Each space tells a story, combining local artisanship with contemporary luxury to create an immersive guest experience.",
    mainImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=2000",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2000"
    ],
    icon: Hotel,
    features: [
      "Signature Restaurant",
      "Wellness Spa",
      "Rooftop Lounge",
      "Curated Art Collection"
    ],
    designer: {
      name: "Vikram Mehta",
      role: "Hospitality Design Director",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400",
      bio: "Vikram's approach to hospitality design focuses on creating memorable experiences through thoughtful spatial design and attention to detail."
    },
    stats: {
      area: "45,000 sq ft",
      duration: "24 months",
      cost: "Ultra Premium"
    }
  },
  {
    id: 'luxury-retail',
    title: "Luxury Retail Space",
    category: "Retail Design",
    location: "Bangalore, India",
    year: "2023",
    description: "A flagship retail space that elevates the shopping experience through innovative design. The architecture creates a journey of discovery, using materials and lighting to showcase products in their best light.",
    mainImage: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2000",
      "https://images.unsplash.com/photo-1604014238170-4def1e4e6fcf?q=80&w=2000"
    ],
    icon: Store,
    features: [
      "Interactive Displays",
      "VIP Lounge",
      "Digital Integration",
      "Custom Lighting"
    ],
    designer: {
      name: "Priya Kapoor",
      role: "Retail Design Specialist",
      image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=400",
      bio: "Priya specializes in creating immersive retail environments that blend digital innovation with physical design to enhance the customer journey."
    },
    stats: {
      area: "15,000 sq ft",
      duration: "10 months",
      cost: "Premium"
    }
  },
  {
    id: 'heritage-restoration',
    title: "Heritage Restoration",
    category: "Conservation & Renovation",
    location: "Bangalore, India",
    year: "2023",
    description: "A meticulous restoration project that breathes new life into a historic structure while preserving its cultural significance. Modern amenities are seamlessly integrated while maintaining the building's original character.",
    mainImage: "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=2000",
    images: [
      "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?q=80&w=2000",
      "https://images.unsplash.com/photo-1577495508512-e56fa96c1a58?q=80&w=2000",
      "https://images.unsplash.com/photo-1577495508444-60148d75f3cf?q=80&w=2000"
    ],
    icon: Landmark,
    features: [
      "Heritage Conservation",
      "Period Details",
      "Modern Infrastructure",
      "Sustainable Upgrades"
    ],
    designer: {
      name: "Dr. Arun Kumar",
      role: "Conservation Architect",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
      bio: "Dr. Kumar brings 25 years of expertise in heritage conservation, specializing in the delicate balance between preservation and adaptive reuse."
    },
    stats: {
      area: "35,000 sq ft",
      duration: "30 months",
      cost: "Ultra Premium"
    }
  }
];