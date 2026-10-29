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
  Activity,
  Syringe,
  HeartPulse,
} from "lucide-react";

export const hospital = {
  name: "City Hospital",
  nameHindi: "सिटी हॉस्पिटल",
  tagline: "Multi-specialty care in the heart of Varanasi",
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
    full:
      "D64/26-K-3-P-4, Chandrika Nagar Colony, Sigra, Varanasi, Uttar Pradesh 221002",
  },
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
  // Real details confirmed via hospital's own social posts & specialist profiles
  facilities: [
    { icon: Ambulance, label: "24×7 Emergency & Trauma Care" },
    { icon: Stethoscope, label: "Multi-Specialty OPD & IPD" },
    { icon: Microscope, label: "Advanced Diagnostic Facilities" },
    { icon: Activity, label: "Operation Theatres & ICU" },
    { icon: Syringe, label: "In-house Pharmacy" },
    { icon: ShieldCheck, label: "Ayushman Bharat Yojana (free treatment)" },
  ],
  specialist: {
    name: "Dr. Anjali Yadav",
    credential: "MD (Gynecology), IMS BHU",
    fellowship: "Advanced Fellowship in Reproductive Medicine",
    specialty: "Gynaecologist, Obstetrician & Maternity Specialist",
    experience: "6+ years",
    locations: "Shiv Clinic (Kandwa) & City Hospital, Sigra",
    blurb:
      "The most consistently praised name across City Hospital's reviews. Patients describe her as patient, professional, thorough and reassuring, from first consultation through delivery.",
    points: [
      "MD in Gynecology from IMS BHU, one of India's top medical institutions",
      "Advanced Fellowship in Reproductive Medicine",
      "Repeatedly recommended for normal & assisted deliveries",
      "Known for clear, unhurried explanations at every step of pregnancy",
      "Consults at City Hospital (Sigra) and Shiv Clinic (Kandwa)",
      "Ayushman Bharat Yojana eligible patients treated free under her care",
    ],
  },
  // Additional specialists referenced in real hospital posts
  team: [
    {
      name: "Dr. Anjali Yadav",
      role: "Gynaecology & Maternity",
      detail: "MD (Gyn), IMS BHU · Fellowship in Reproductive Medicine",
      highlight: true,
    },
    {
      name: "Dr. Deepankar Mishra",
      role: "Physician & Critical Care",
      detail: "Recently joined City Hospital's multi-specialty team",
      highlight: false,
    },
    {
      name: "Dr. Saurabh Singh",
      role: "Orthopedics",
      detail: "Knee & fracture care, mobility rehabilitation",
      highlight: false,
    },
    {
      name: "Dr. Manjari Gupta",
      role: "Consultant",
      detail: "Part of City Hospital's multi-specialty OPD",
      highlight: false,
    },
    {
      name: "Dr. Vivek Tripathi",
      role: "Consultant",
      detail: "Part of City Hospital's multi-specialty OPD",
      highlight: false,
    },
  ],
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
    desc: "Antenatal care, normal and assisted delivery, and women's health under Dr. Anjali Yadav, MD (Gyn), IMS BHU. The hospital's most recommended specialty.",
    accent: "rose",
  },
  {
    icon: Ambulance,
    title: "Emergency & Trauma Care",
    desc: "Round-the-clock emergency response with doctors on site 24×7, ready for critical, accident and urgent care cases with a fully equipped trauma unit.",
    accent: "teal",
  },
  {
    icon: Stethoscope,
    title: "General Surgery & Medicine",
    desc: "Minor and major surgical procedures in modern operating theatres, supported by a multi-specialty OPD and in-patient recovery wards.",
    accent: "teal",
  },
  {
    icon: Bone,
    title: "Orthopedics",
    desc: "Fracture management, joint and knee care, and mobility rehabilitation delivered by experienced orthopedic specialists including Dr. Saurabh Singh.",
    accent: "gold",
  },
  {
    icon: Microscope,
    title: "Diagnostics & ICU",
    desc: "On-site advanced diagnostic labs, imaging, ICU and operation theatres so treatment decisions happen fast, without sending patients elsewhere.",
    accent: "teal",
  },
  {
    icon: HeartPulse,
    title: "Ayushman Bharat Care",
    desc: "Empanelled for Ayushman Bharat Yojana, offering free treatment to eligible patients so cost is never a barrier to quality care.",
    accent: "gold",
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
    desc: "Review after review highlights Dr. Anjali Yadav's patient, thorough and reassuring approach, from first visit through delivery.",
  },
  {
    icon: Clock,
    title: "Genuinely 24×7 Availability",
    desc: "The hospital is open all day, every day, so emergencies at any hour are met with doctors on site, not just an answering service.",
  },
  {
    icon: Ambulance,
    title: "Emergency Responsiveness",
    desc: "Patients consistently note quick attention when it mattered most. A real strength for a neighbourhood multi-specialty hospital.",
  },
  {
    icon: Building2,
    title: "Modern, Spacious Facility",
    desc: "Multi-specialty OPD, IPD, ICU, operation theatres, pharmacy and diagnostics under one roof, suited to a wide range of patients.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible & Inclusive",
    desc: "Wheelchair-accessible parking, entrance and toilets, gender-neutral toilets, plus debit card and NFC payments for convenience.",
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
  {
    name: "Family F.",
    tag: "General Care",
    text: "Found the hospital and staff good and professional overall.",
  },
];

export const stats = [
  { label: "Google Rating", value: 3.8, suffix: "★", decimals: 1 },
  { label: "Google Reviews", value: 169, suffix: "+", decimals: 0 },
  { label: "Open", value: 24, suffix: "×7", decimals: 0 },
  { label: "Specialties", value: 6, suffix: "+", decimals: 0 },
] as const;

// Pre-filled prompt sent to AI platforms when a visitor clicks one of the
// AI buttons. Asks the AI to summarise the hospital using its real details.
export const aiPrompt = `Tell me everything about City Hospital in Sigra, Varanasi. Address: D64/26-K-3-P-4, Chandrika Nagar Colony, Sigra, Varanasi, Uttar Pradesh 221002. Phone: +91 99360 00099. It is a multi-specialty hospital open 24 hours, rated 3.8 stars across 169 Google reviews. The lead specialist is Dr. Anjali Yadav, Gynaecologist and Obstetrician, who holds an MD in Gynecology from IMS BHU and an Advanced Fellowship in Reproductive Medicine, with 6+ years of experience. She is widely praised in patient reviews for being patient, thorough and reassuring, especially for maternity and delivery care. The hospital offers 24×7 emergency and trauma care, general surgery, orthopedics, diagnostics, ICU, operation theatres, in-house pharmacy, and is empanelled under the Ayushman Bharat Yojana for free treatment of eligible patients. It is wheelchair accessible and accepts debit cards and NFC payments. Please summarise the hospital's strengths, the specialists, and what patients say about it.`;
