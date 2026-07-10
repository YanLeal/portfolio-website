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
    image: 'images/services/corte-de-cabello-1200x900.webp',
  },
  {
    id: 'color',
    name: 'Coloración',
    description: 'Tinte, mechas, balayage y más técnicas de color.',
    price: 3500,
    duration: '2 hs',
    category: 'cabello',
    /* Imagen recomendada: 800×600px, aplicación de color o resultado final */
    image: 'images/services/coloracion-1200x900.webp',
  },
  {
    id: 'manicuria',
    name: 'Manicuría',
    description: 'Esmaltado tradicional, semipermanente o en gel.',
    price: 1200,
    duration: '40 min',
    category: 'uñas',
    /* Imagen recomendada: 800×600px, manos con esmaltado */
    image: 'images/services/manicuria-1200x900.webp',
  },
  {
    id: 'pedicuria',
    name: 'Pedicuría',
    description: 'Cuidado completo de pies con esmaltado.',
    price: 1400,
    duration: '45 min',
    category: 'uñas',
    /* Imagen recomendada: 800×600px, pedicuría en tratamiento */
    image: 'images/services/pedicuria-1200x900.webp',
  },
  {
    id: 'maquillaje',
    name: 'Maquillaje profesional',
    description: 'Maquillaje para eventos, sociales o producción.',
    price: 2500,
    duration: '1 hs',
    category: 'maquillaje',
    /* Imagen recomendada: 800×600px, aplicación de maquillaje o look final */
    image: 'images/services/maquillaje-profesional-1200x900.webp',
  },
  {
    id: 'tratamiento-facial',
    name: 'Tratamiento facial',
    description: 'Limpieza profunda, hidratación y revitalización.',
    price: 2800,
    duration: '1 hs',
    category: 'tratamientos',
    /* Imagen recomendada: 800×600px, sesión de tratamiento facial */
    image: 'images/services/tratamiento-facial-1200x900.webp',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'María García',
    photo: 'images/clienta-satisfecha-saliendo-800x600.webp',
    text: 'Excelente atención, salí hermosísima. Recomiendo 100%. Volví por más tratamientos y siempre superan mis expectativas.',
    rating: 5,
    service: 'Corte + Coloración',
    date: new Date('2025-12-15'),
  },
  {
    id: '2',
    name: 'Lucía Fernández',
    photo: 'images/tu-momento-de-brillar-800x600.webp',
    text: 'El mejor corte que me han hecho. Muy profesionales y el ambiente es increíble. Se nota que aman lo que hacen.',
    rating: 5,
    service: 'Corte de cabello',
    date: new Date('2026-01-20'),
  },
  {
    id: '3',
    name: 'Carla Martínez',
    photo: 'images/reserva-tu-turno-800x600.webp',
    text: 'La pedicuría es espectacular. Vuelvo cada mes porque el cuidado y la calidad son incomparables. ¡100% recomendado!',
    rating: 4,
    service: 'Pedicuría',
    date: new Date('2026-02-10'),
  },
];

export const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Sofía Romero',
    role: 'Directora & Estilista Senior',
    photo: 'images/team/sofia-romero-directora-800x800.webp',
    bio: 'Más de 10 años de experiencia en el rubro. Especialista en coloración y cortes de tendencia.',
    experience: '12+ años',
    social: {
      instagram: '#',
      facebook: '#',
    },
  },
  {
    id: '2',
    name: 'Valentina López',
    role: 'Maquilladora Profesional',
    photo: 'images/team/valentina-lopez-maquilladora-800x800.webp',
    bio: 'Apasionada por el maquillaje artístico y social. Formada en Buenos Aires.',
    experience: '8+ años',
    social: {
      instagram: '#',
      whatsapp: '#',
    },
  },
  {
    id: '3',
    name: 'Camila Torres',
    role: 'Manicurista',
    photo: 'images/team/camila-torres-manicurista-800x800.webp',
    bio: 'Especialista en nail art y cuidado de uñas. Siempre al tanto de las últimas tendencias.',
    experience: '6+ años',
    social: {
      instagram: '#',
      facebook: '#',
    },
  },
];
