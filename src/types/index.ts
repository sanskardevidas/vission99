export interface Project {
  id: string;
  name: string;
  slug: string;
  builder: string;
  location: string;
  address: string;
  price: string;
  priceRange: string;
  configuration: string;
  carpetArea: string;
  possession: string;
  reraNumber: string;
  description: string;
  amenities: string[];
  images: string[];
  floorPlans: string[];
  brochure: string;
  vrTourType: string;
  vrTourUrl: string;
  featured: boolean;
  vrAvailable: boolean;
  status: 'draft' | 'published';
  badge: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredLocation: string;
  interestedProject: string;
  budget: string;
  message: string;
  source: string;
  status: 'new' | 'contacted' | 'site-visit-booked' | 'closed' | 'lost';
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  projectCount: number;
  tagline: string;
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  location: string;
  name: string;
  property: string;
  quote: string;
  avatar: string;
  image: string;
}
