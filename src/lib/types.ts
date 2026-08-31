export type ContentPage = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  body: string;
};

export type Week = {
  id: number;
  title: string;
  importedAt: string;
  topics: Topic[];
};

export type Topic = {
  id: number;
  position: number;
  title: string;
  question: string;
};

export type AcademicCalendar = {
  semester1Start: string;
  semester1End: string;
  semester2Start: string;
  semester2End: string;
};

export type School = {
  id: number;
  schoolName: string;
  coordinatorName: string;
  responsibleTeacherName: string;
  foreignStudentIds: number[];
  turkishStudentIds: number[];
  coordinatorWhatsappGroupName: string;
  studentWhatsappGroupName: string;
  meetingLink: string;
};

export type SchoolInput = Omit<School, "id">;

export type StudentRole = "facilitator" | "student";

export type Student = {
  id: number;
  studentName: string;
  schoolOrCoordinatorRegion: string;
  role: StudentRole;
  projectLeader: boolean;
};

export type StudentInput = Omit<Student, "id">;
