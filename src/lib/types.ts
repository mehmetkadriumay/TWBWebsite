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

export type StudentType = "foreign" | "turkish";

type StudentBase = {
  id: number;
  applicationId: number | null;
  studentType: StudentType;
  studentName: string;
  schoolOrCoordinatorRegion: string;
  projectLeader: boolean;
  details: string;
};

export type ForeignStudent = StudentBase & {
  studentType: "foreign";
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  dateOfBirth: string;
  state: string;
  city: string;
  referrerFirstName: string;
  referrerLastName: string;
  referrerEmail: string;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
};

export type TurkishStudent = StudentBase & {
  studentType: "turkish";
  teacherFirstName: string;
  teacherLastName: string;
  teacherEmail: string;
  teacherPhone: string;
  schoolName: string;
  province: string;
  district: string;
  principalName: string;
  studentCount: string;
  ageGroup: string;
  englishLevel: string;
};

export type Student = ForeignStudent | TurkishStudent;
export type StudentInput =
  | Omit<ForeignStudent, "id" | "applicationId" | "studentName" | "schoolOrCoordinatorRegion">
  | Omit<TurkishStudent, "id" | "applicationId" | "studentName" | "schoolOrCoordinatorRegion">;

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ParticipationApplication = {
  id: number;
  formType: "turkiye" | "us";
  locale: "tr" | "en";
  fields: Record<string, string>;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  studentId: number | null;
  studentType: StudentType | null;
};
