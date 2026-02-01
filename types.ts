export enum Stream {
  Engineering = 'Engineering',
  Pharmacy = 'Pharmacy',
  Nursing = 'Nursing',
  Management = 'Management',
  ASC = 'ASC'
}

export enum CourseType {
  BPharm = 'B-Pharmacy (Degree)',
  DPharm = 'D-Pharmacy (Diploma)',
  MPharm = 'M-Pharmacy (Post-Grad)',
  MBA = 'MBA (Management)',
  MCA = 'MCA (Computer Apps)',
  BBA = 'BBA (Management)',
  BCA = 'BCA (Computer Apps)',
  BA = 'Bachelor of Arts (BA)',
  BSc = 'Bachelor of Science (BSc)',
  BCom = 'Bachelor of Commerce (BCom)',
  MA = 'Master of Arts (MA)',
  MSc = 'Master of Science (MSc)',
  MCom = 'Master of Commerce (MCom)'
}

export type Category = 'Open' | 'OBC' | 'SC' | 'ST' | 'SBC' | 'VJNT' | 'SEBC' | 'Minority';

export type Language = 'en' | 'hi' | 'mr';

export interface AppState {
  language: Language;
  step: number;
  stream: Stream | null;
  courseType: CourseType | null;
  category: Category | null;
  currentYear: number | null;
  isHosteller: boolean;
  hadGap: boolean;
  loginReady: {
    username: boolean;
    password: boolean;
    mobile: boolean;
  };
}