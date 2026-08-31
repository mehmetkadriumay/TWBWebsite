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

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  school_or_coordinator_region VARCHAR(255) NOT NULL,
  role ENUM('facilitator', 'student') NOT NULL,
  project_leader TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX students_name_idx (student_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS school_students (
  school_id INT NOT NULL,
  student_id INT NOT NULL,
  group_type ENUM('foreign', 'turkish') NOT NULL,
  PRIMARY KEY (school_id, student_id, group_type),
  CONSTRAINT school_students_school_fk
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  CONSTRAINT school_students_student_fk
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS participation_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_type ENUM('turkiye', 'us') NOT NULL,
  locale ENUM('tr', 'en') NOT NULL,
  payload JSON NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
