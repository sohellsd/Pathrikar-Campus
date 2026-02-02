export enum Stream {
  Engineering = 'Engineering',
  Pharmacy = 'Pharmacy',
  Nursing = 'Nursing',
  Management = 'Management',
  ASC = 'ASC'
}

export enum CourseType {
  BPharm = 'B-Pharmacy',
  DPharm = 'D-Pharmacy',
  MPharm = 'M-Pharmacy',
  MBA = 'MBA',
  MCA = 'MCA',
  BBA = 'BBA',
  BCA = 'BCA',
  BA = 'BA',
  BSc = 'BSc',
  BCom = 'B.Com',
  MA = 'MA',
  MSc = 'MSc',
  MCom = 'M.Com'
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
  isDirectSecondYear: boolean | null;
  loginReady: {
    username: boolean;
    password: boolean;
    mobile: boolean;
  };
}