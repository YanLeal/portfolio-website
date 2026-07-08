export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio: string;
  experience: string;
  social: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
}
