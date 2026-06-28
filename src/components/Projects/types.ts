export interface ProjectDetails {
  area: string;
  duration: string;
  location: string;
  features: string[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  video: string;
  image: string;
  gallery: string[];
  details: ProjectDetails;
}