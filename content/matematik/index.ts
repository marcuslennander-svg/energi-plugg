import type { SubjectSeed } from '../types';
import { matte1aCourse, matte1bCourse, matte1cCourse } from './matte-1';
import { matte2aCourse, matte2bCourse, matte2cCourse } from './matte-2';
import { matte3bCourse, matte3cCourse } from './matte-3';
import { matte4Course, matte5Course } from './matte-4-5';

export {
  matte1aCourse,
  matte1bCourse,
  matte1cCourse,
  matte2aCourse,
  matte2bCourse,
  matte2cCourse,
  matte3bCourse,
  matte3cCourse,
  matte4Course,
  matte5Course,
};

export const matematikSubject: SubjectSeed = {
  id: 'subj-matematik',
  slug: 'matematik',
  nameSv: 'Matematik',
  descriptionSv:
    'Aritmetik, algebra, funktioner, geometri, trigonometri, derivata, integraler, sannolikhet och differentialekvationer för alla gymnasiespår.',
  sortOrder: 2,
  courses: [
    matte1aCourse,
    matte1bCourse,
    matte1cCourse,
    matte2aCourse,
    matte2bCourse,
    matte2cCourse,
    matte3bCourse,
    matte3cCourse,
    matte4Course,
    matte5Course,
  ],
};
