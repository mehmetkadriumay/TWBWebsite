CREATE TABLE IF NOT EXISTS pages (
  slug VARCHAR(191) PRIMARY KEY,
  title TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  summary TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weeks (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_id INT NOT NULL,
  position INT NOT NULL,
  category VARCHAR(255) NOT NULL DEFAULT '',
  question TEXT NOT NULL,
  CONSTRAINT topics_week_fk
    FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE,
  INDEX topics_week_position_idx (week_id, position, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(191) PRIMARY KEY,
  value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  coordinator_name VARCHAR(255) NOT NULL DEFAULT '',
  responsible_teacher_name VARCHAR(255) NOT NULL DEFAULT '',
  coordinator_whatsapp_group_name VARCHAR(255) NOT NULL DEFAULT '',
  student_whatsapp_group_name VARCHAR(255) NOT NULL DEFAULT '',
  meeting_link TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS foreign_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NULL UNIQUE,
  applicant_first_name VARCHAR(255) NOT NULL,
  applicant_last_name VARCHAR(255) NOT NULL,
  applicant_email VARCHAR(320) NOT NULL,
  date_of_birth VARCHAR(32) NOT NULL DEFAULT '',
  state VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(150) NOT NULL DEFAULT '',
  referrer_first_name VARCHAR(255) NOT NULL DEFAULT '',
  referrer_last_name VARCHAR(255) NOT NULL DEFAULT '',
  referrer_email VARCHAR(320) NOT NULL DEFAULT '',
  parent_first_name VARCHAR(255) NOT NULL DEFAULT '',
  parent_last_name VARCHAR(255) NOT NULL DEFAULT '',
  parent_email VARCHAR(320) NOT NULL DEFAULT '',
  parent_phone VARCHAR(100) NOT NULL DEFAULT '',
  details TEXT NOT NULL,
  project_leader TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX foreign_students_name_idx (applicant_last_name, applicant_first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS turkish_students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NULL UNIQUE,
  teacher_first_name VARCHAR(255) NOT NULL,
  teacher_last_name VARCHAR(255) NOT NULL,
  teacher_email VARCHAR(320) NOT NULL,
  teacher_phone VARCHAR(100) NOT NULL DEFAULT '',
  school_name VARCHAR(255) NOT NULL,
  province VARCHAR(100) NOT NULL DEFAULT '',
  district VARCHAR(150) NOT NULL DEFAULT '',
  principal_name VARCHAR(255) NOT NULL DEFAULT '',
  student_count VARCHAR(20) NOT NULL DEFAULT '',
  age_group VARCHAR(100) NOT NULL DEFAULT '',
  english_level VARCHAR(100) NOT NULL DEFAULT '',
  details TEXT NOT NULL,
  project_leader TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX turkish_students_school_idx (school_name),
  INDEX turkish_students_teacher_idx (teacher_last_name, teacher_first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS school_foreign_students (
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  PRIMARY KEY (school_id, student_id),
  CONSTRAINT school_foreign_students_school_fk
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT school_foreign_students_student_fk
    FOREIGN KEY (student_id) REFERENCES foreign_students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS school_turkish_students (
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  PRIMARY KEY (school_id, student_id),
  CONSTRAINT school_turkish_students_school_fk
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT school_turkish_students_student_fk
    FOREIGN KEY (student_id) REFERENCES turkish_students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS participation_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_type ENUM('turkiye', 'us') NOT NULL,
  locale ENUM('tr', 'en') NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMP NULL,
  student_id INT NULL,
  student_type ENUM('foreign', 'turkish') NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
