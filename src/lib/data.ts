import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Stethoscope,
  Bone,
  Ambulance,
  Microscope,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Building2,
} from "lucide-react";

export const hospital = {
  name: "City Hospital",
  nameHindi: "सिटी हॉस्पिटल",
  tagline: "Multi-Specialty Care, Led by Compassion",
  category: "Multi-Specialty Hospital",
  rating: 3.8,
  reviewCount: 169,
  phoneDisplay: "099360 00099",
  phoneTel: "+919936000099",
  whatsapp: "919936000099",
  hours: "Open 24 Hours",
  address: {
    line1: "D64/26-K-3-P-4, Chandrika Nagar Colony",
    line2: "Sigra, Varanasi",
    line3: "Uttar Pradesh 221002",
    full: "D64/26-K-3-P-4, Chandrika Nagar Colony, Sigra, Varanasi, Uttar Pradesh 221002",
  },
  mapsQuery:
    "City Hospital Sigra Varanasi Chandrika Nagar",
  googleReviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=City+Hospital+Sigra+Varanasi+Chandrika+Nagar",
  mapsEmbedQuery: "City+Hospital+Chandrika+Nagar+Colony+Sigra+Varanasi",
  amenities: [
    "Wheelchair-accessible car park",
    "Wheelchair-accessible entrance",
    "Wheelchair-accessible toilet",
    "Gender-neutral toilets",
    "Debit cards accepted",
    "NFC mobile payments",
  ],
  specialist: {
    name: "Dr. Anjali Yadav",
    specialty: "Gynaecologist & Maternity Specialist",
    blurb:
      "The most consistently praised name across City Hospital's reviews — patients describe her as patient, professional, thorough and reassuring, from first consultation through delivery.",
    points: [
      "Repeatedly recommended for maternity & delivery care",
      "Known for clear, unhurried explanations at every step",
      "Trusted across multiple families for gynaecology treatment",
    ],
  },
};

export type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: "teal" | "gold" | "rose";
};

export const services: Service[] = [
  {
    icon: Baby,
    title: "Gynaecology & Maternity",
    desc: "Antenatal care, normal & assisted delivery, and women's health under Dr. Anjali Yadav — the hospital's most recommended specialty.",
    accent: "rose",
  },
  {
    icon: Ambulance,
    title: "Emergency Care",
    desc: "Round-the-clock emergency response with doctors on site 24×7, ready for critical, accident and urgent care cases.",
    accent: "teal",
  },
  {
    icon: Stethoscope,
    title: "General Surgery",
    desc: "Minor and major surgical procedures performed in modern, well-equipped operating suites with in-patient recovery support.",
    accent: "teal",
  },
  {
    icon: Bone,
    title: "Orthopedics",
    desc: "Fracture management, joint and knee care, and mobility rehabilitation delivered by experienced orthopedic specialists.",
    accent: "gold",
  },
  {
    icon: Microscope,
    title: "Diagnostics",
    desc: "On-site lab and imaging support for accurate, timely diagnosis that feeds directly into your treatment plan.",
    accent: "teal",
  },
];

export type WhyItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const whyChoose: WhyItem[] = [
  {
    icon: HeartHandshake,
    title: "Attentive Gynaecology Care",
    desc: "Review after review highlights Dr. Anjali Yadav's patient, thorough and reassuring approach — from first visit through delivery.",
  },
  {
    icon: Clock,
    title: "Genuinely 24×7 Availability",
    desc: "The hospital is open all day, every day, so emergencies at any hour are met with doctors on site, not just an answering service.",
  },
  {
    icon: Ambulance,
    title: "Emergency Responsiveness",
    desc: "Patients consistently note quick attention when it mattered most — a real strength for a neighbourhood multi-specialty hospital.",
  },
  {
    icon: Building2,
    title: "Spacious, Modern Facility",
    desc: "Visitors describe a well-equipped, spacious setup suited to a wide range of patients and care needs under one roof.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible for Everyone",
    desc: "Wheelchair-accessible parking, entrance and toilets, gender-neutral toilets, plus debit card & NFC payments for convenience.",
  },
];

export type Review = {
  name: string;
  text: string;
  tag: string;
};

export const reviews: Review[] = [
  {
    name: "Gaurav K.",
    tag: "Gynaecology",
    text: "Grateful for Dr. Anjali's professionalism, kindness and patience while caring for his mother.",
  },
  {
    name: "Bhanu S.",
    tag: "Maternity",
    text: "Highly recommends Dr. Anjali as his wife's gynaecologist; felt completely at ease from the first visit.",
  },
  {
    name: "Rinki K.",
    tag: "Gynaecology",
    text: "Dr. Anjali Yadav treated his mother completely; calls her the best gynaecologist.",
  },
  {
    name: "Vineeta R.",
    tag: "Consultation",
    text: "Smooth, reassuring consultation; considers Dr. Anjali one of the best gynaecologists here.",
  },
  {
    name: "Supriya R.",
    tag: "Women's Health",
    text: "Dr. Anjali explained every step clearly without overwhelming her; a true expert in her field.",
  },
  {
    name: "Muntazir",
    tag: "Delivery",
    text: "Wife's delivery went smoothly under Dr. Anjali's care; recommends the hospital to others.",
  },
  {
    name: "Sonal R.",
    tag: "Gynaecology",
    text: "Dr. Anjali listens calmly to every concern and responds thoughtfully.",
  },
  {
    name: "Sitapatel P.",
    tag: "Gynaecology",
    text: "Considers Dr. Anjali Yadav the best doctor at the hospital.",
  },
  {
    name: "Himanish",
    tag: "Maternity",
    text: "Describes Dr. Anjali Yadav as a very caring, supportive gynaecologist.",
  },
  {
    name: "Amit K.",
    tag: "General Care",
    text: "Positive experience overall; appreciated the guidance given during his visit.",
  },
  {
    name: "Rajkumar G.",
    tag: "General Care",
    text: "Praised doctor and staff behaviour; found the hospital well-suited for all types of patients.",
  },
  {
    name: "Family F.",
    tag: "General Care",
    text: "Found the hospital and staff good and professional overall.",
  },
  {
    name: "Aditya S.",
    tag: "Facility",
    text: "Staff attentive, doctors thorough, facility spacious and well-equipped.",
  },
  {
    name: "Amit M.",
    tag: "Doctors",
    text: "Rates the doctors' team highly overall.",
  },
  {
    name: "Suman S.",
    tag: "Maternity",
    text: "Positive experience during his wife's pregnancy care at the hospital.",
  },
];

export const stats = [
  { label: "Google Rating", value: 3.8, suffix: "★", decimals: 1 },
  { label: "Google Reviews", value: 169, suffix: "+", decimals: 0 },
  { label: "Open", value: 24, suffix: "×7", decimals: 0 },
  { label: "Specialties", value: 5, suffix: "+", decimals: 0 },
] as const;
