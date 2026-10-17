export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  xp: number;
  level: number;
  badges: string[];
  classId?: number | null;   // Lop cua hoc sinh (chi STUDENT)
  className?: string | null;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Molecule {
  id: number;
  name: string;
  formula: string;
  description: string;
  atomData: string;
  atomsData?: any;
  bondsData?: any;
}

export interface MoleculeData {
  atoms: Atom[];
  bonds: Bond[];
}

export interface Atom {
  element: string;
  x: number;
  y: number;
  z: number;
}

export interface Bond {
  from: number;
  to: number;
  order: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  topic: string;
  difficulty: string;
  molecule?: Molecule;
}

export interface Question {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  topic: string;
  difficulty: string;
  explanation?: string;
}

export interface QuizSubmission {
  answers: AnswerItem[];
  topic: string;
}

export interface AnswerItem {
  questionId: number;
  selectedAnswer: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  details: QuestionResult[];
}

export interface QuestionResult {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// === Reaction Simulation ===
export interface Reaction {
  id: number;
  name: string;
  equation: string;
  description: string;
  reactionType: string;
  reactantsData: string;
  productsData: string;
  animationSteps: string;
}

export interface ReactionMoleculeGroup {
  molecules: ReactionMolecule[];
}

export interface ReactionMolecule {
  name: string;
  atoms: Atom[];
  bonds: Bond[];
}

export interface AnimationData {
  steps: AnimationStep[];
}

export interface AnimationStep {
  label: string;
  description: string;
  phase: string; // initial, breaking, transition, forming, final
}

// === AI Question Generator ===
export interface AiQuestionRequest {
  topic: string;
  difficulty: string;
  count: number;
}

// === Progress Dashboard ===
export interface Dashboard {
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  totalQuizzesTaken: number;
  totalStudyMinutes: number;
  weeklyStudyTime: WeeklyStudy[];
  scoreHistory: ScoreHistory[];
}

export interface WeeklyStudy {
  day: string;
  minutes: number;
}

export interface ScoreHistory {
  date: string;
  topic: string;
  percentage: number;
}

// === Learning Recommendation ===
export interface Recommendation {
  weakTopics: WeakTopic[];
  suggestions: Suggestion[];
}

export interface WeakTopic {
  topic: string;
  averageScore: number;
  quizzesTaken: number;
}

export interface Suggestion {
  type: string; // LESSON, QUIZ, REVIEW
  title: string;         // Van ban tieng Anh tu backend (du phong)
  description: string;   // Van ban tieng Anh tu backend (du phong)
  referenceId: number | null;
  /** Khoa i18n do backend tra ve de dich theo ngon ngu dang chon. */
  titleKey?: string;
  descriptionKey?: string;
  /** Tham so noi suy cho khoa i18n. */
  params?: Record<string, any>;
}

// === Online Exam System ===
export interface Exam {
  id: number;
  title: string;
  description: string;
  timeLimitMinutes: number;
  randomOrder: boolean;
  topic: string;
  difficulty: string;
  active: boolean;
  createdAt: string;
  createdByName: string;
  questionCount: number;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  topic: string;
  difficulty: string;
}

export interface CreateExamRequest {
  title: string;
  description: string;
  timeLimitMinutes: number;
  randomOrder: boolean;
  topic: string;
  difficulty: string;
  questionIds?: number[];
  randomQuestionCount?: number;
  aiGenerated?: boolean;
}

export interface ExamSubmissionRequest {
  examId: number;
  answers: ExamAnswerItem[];
  startedAt: string;
}

export interface ExamAnswerItem {
  questionId: number;
  selectedAnswer: string;
}

export interface ExamResult {
  examId: number;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  details: ExamQuestionResult[];
}

export interface ExamQuestionResult {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  correct: boolean;
  // Noi dung dap an va loi giai, dung cho man hinh chua de.
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  explanation?: string;
}

// === Teacher Dashboard ===
/** Thong ke cua MOT lop; chi giao vien duoc phan cong vao lop (hoac admin) xem duoc. */
export interface TeacherDashboard {
  classId: number;
  className: string;
  totalStudents: number;
  totalExams: number;
  totalLessons: number;
  classAverageScore: number;
  totalSubmissions: number;
  examSummaries: ExamSummary[];
  lessonSummaries: LessonSummary[];
  studentProgressList: StudentProgress[];
}

export interface LessonSummary {
  lessonId: number;
  lessonTitle: string;
  completedCount: number;
  totalStudents: number;
}

export interface ExamSummary {
  examId: number;
  examTitle: string;
  submissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export interface StudentProgress {
  studentId: number;
  studentName: string;
  studentEmail: string;
  examsCompleted: number;
  averageScore: number;
  lessonsCompleted: number;
  totalStudyMinutes: number;
}
export interface AiMoleculeRequest {
  query: string;
}

// === Assignment ===
export interface Assignment {
  id: number;
  title: string;
  description: string;
  teacherName: string;
  createdAt: string;
  dueDate: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  classId?: number | null;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
  classId?: number | null;  // null = chua xep lop
}

export interface ClassMember {
  id: number;
  name: string;
  email: string;
}

export interface ClassLessonItem {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
}

export interface ClassExamItem {
  id: number;
  title: string;
  questionCount: number;
  active: boolean;
  createdByName: string;
}

/** Lop hoc do quan tri vien tao; cac danh sach chi co khi xem chi tiet lop. */
export interface ClassRoom {
  id: number;
  name: string;
  gradeLevel?: number | null;
  schoolYear?: string | null;
  description?: string | null;
  createdAt?: string;
  studentCount: number;
  lessonCount: number;
  examCount: number;
  teacherNames: string[];
  students?: ClassMember[];
  teachers?: ClassMember[];
  lessons?: ClassLessonItem[];
  exams?: ClassExamItem[];
}

export interface ClassRoomRequest {
  name: string;
  gradeLevel?: number | null;
  schoolYear?: string | null;
  description?: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CreateMoleculeRequest {
  name: string;
  formula: string;
  description?: string;
  atomData?: string;
  atomsData?: string;
  bondsData?: string;
}

export interface CreateLessonRequest {
  title: string;
  content?: string;
  topic: string;
  difficulty: string;
  moleculeId?: number;
}

export interface CreateQuestionRequest {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  topic?: string;
  difficulty?: string;
  explanation?: string;
}
