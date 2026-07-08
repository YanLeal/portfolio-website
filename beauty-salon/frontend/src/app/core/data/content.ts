import { Service } from '../models/service.model';
import { Testimonial } from '../models/testimonial.model';
import { TeamMember } from '../models/team-member.model';

export const SITE_NAME = 'Belleza & Estilo';

export const SERVICES: Service[] = [
  {
    id: 'corte',
    name: 'Corte de cabello',
    description: 'Corte personalizado según tu estilo y tipo de cabello.',
    price: 1500,
    duration: '45 min',
    category: 'cabello',
  },
  {
    id: 'color',
    name: 'Coloración',
    description: 'Tinte, mechas, balayage y más técnicas de color.',
    price: 3500,
    duration: '2 hs',
    category: 'cabello',
  },
  {
    id: 'manicuria',
    name: 'Manicuría',
    description: 'Esmaltado tradicional, semipermanente o en gel.',
    price: 1200,
    duration: '40 min',
    category: 'uñas',
  },
  {
    id: 'pedicuria',
    name: 'Pedicuría',
    description: 'Cuidado completo de pies con esmaltado.',
    price: 1400,
    duration: '45 min',
    category: 'uñas',
  },
  {
    id: 'maquillaje',
    name: 'Maquillaje profesional',
    description: 'Maquillaje para eventos, sociales o producción.',
    price: 2500,
    duration: '1 hs',
    category: 'maquillaje',
  },
  {
    id: 'tratamiento-facial',
    name: 'Tratamiento facial',
    description: 'Limpieza profunda, hidratación y revitalización.',
    price: 2800,
    duration: '1 hs',
    category: 'tratamientos',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'María García',
    text: 'Excelente atención, salí hermosísima. Recomiendo 100%.',
    rating: 5,
    date: new Date('2025-12-15'),
  },
  {
    id: '2',
    name: 'Lucía Fernández',
    text: 'El mejor corte que me han hecho. Muy profesionales.',
    rating: 5,
    date: new Date('2026-01-20'),
  },
  {
    id: '3',
    name: 'Carla Martínez',
    text: 'La pedicuría es espectacular. Vuelvo cada mes.',
    rating: 4,
    date: new Date('2026-02-10'),
  },
];

export const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Sofía Romero',
    role: 'Directora & Estilista Senior',
    bio: 'Más de 10 años de experiencia en el rubro. Especialista en coloración y cortes de tendencia.',
  },
  {
    id: '2',
    name: 'Valentina López',
    role: 'Maquilladora Profesional',
    bio: 'Apasionada por el maquillaje artístico y social. Formada en Buenos Aires.',
  },
  {
    id: '3',
    name: 'Camila Torres',
    role: 'Manicurista',
    bio: 'Especialista en nail art y cuidado de uñas. Siempre al tanto de las últimas tendencias.',
  },
];
