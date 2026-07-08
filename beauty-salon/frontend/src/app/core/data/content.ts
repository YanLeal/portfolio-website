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
    /* Imagen recomendada: 800×600px, primer plano de corte o styling */
    image: '/images/corte-de-cabello.webp',
  },
  {
    id: 'color',
    name: 'Coloración',
    description: 'Tinte, mechas, balayage y más técnicas de color.',
    price: 3500,
    duration: '2 hs',
    category: 'cabello',
    /* Imagen recomendada: 800×600px, aplicación de color o resultado final */
    image: '/images/coloracion.webp',
  },
  {
    id: 'manicuria',
    name: 'Manicuría',
    description: 'Esmaltado tradicional, semipermanente o en gel.',
    price: 1200,
    duration: '40 min',
    category: 'uñas',
    /* Imagen recomendada: 800×600px, manos con esmaltado */
    image: '/images/manicuria.webp',
  },
  {
    id: 'pedicuria',
    name: 'Pedicuría',
    description: 'Cuidado completo de pies con esmaltado.',
    price: 1400,
    duration: '45 min',
    category: 'uñas',
    /* Imagen recomendada: 800×600px, pedicuría en tratamiento */
    image: '/images/pedicuria.webp',
  },
  {
    id: 'maquillaje',
    name: 'Maquillaje profesional',
    description: 'Maquillaje para eventos, sociales o producción.',
    price: 2500,
    duration: '1 hs',
    category: 'maquillaje',
    /* Imagen recomendada: 800×600px, aplicación de maquillaje o look final */
    image: '/images/maquillaje-profesional.webp',
  },
  {
    id: 'tratamiento-facial',
    name: 'Tratamiento facial',
    description: 'Limpieza profunda, hidratación y revitalización.',
    price: 2800,
    duration: '1 hs',
    category: 'tratamientos',
    /* Imagen recomendada: 800×600px, sesión de tratamiento facial */
    image: '/images/tratamiento-facial.webp',
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
