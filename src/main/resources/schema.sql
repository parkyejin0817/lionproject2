-- ============================================================
-- DevSolve Database Schema
-- 멘토-멘티 매칭 과외 ?�랫??
-- ============================================================

-- 문자???�정
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 기존 ?�이�???�� (?�존????��)
DROP TABLE IF EXISTS `answers`;
DROP TABLE IF EXISTS `questions`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `tutorial_skills`;
DROP TABLE IF EXISTS `tutorials`;
DROP TABLE IF EXISTS `mentor_skills`;
DROP TABLE IF EXISTS `mentors`;
DROP TABLE IF EXISTS `skills`;
DROP TABLE IF EXISTS `refresh_token_storage`;
DROP TABLE IF EXISTS `users`;

-- ============================================================
-- 1. users (?�용??
-- ============================================================
CREATE TABLE `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'MENTEE' COMMENT 'MENTOR, MENTEE, ADMIN',
  `introduction` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_nickname` (`nickname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. refresh_token_storage (리프?�시 ?�큰)
-- ============================================================
CREATE TABLE `refresh_token_storage` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `refresh_token` VARCHAR(500),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_refresh_user` (`user_id`),
  CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. skills (?�킬 마스??
-- ============================================================
CREATE TABLE `skills` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `skill_name` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_skill_name` (`skill_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. mentors (멘토)
-- ============================================================
CREATE TABLE `mentors` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `career` TEXT COMMENT '경력 ?�항',
  `status` VARCHAR(20) NOT NULL DEFAULT 'APPROVED' COMMENT 'APPROVED',
  `review_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_mentor_user` (`user_id`),
  CONSTRAINT `fk_mentor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. mentor_skills (멘토-?�킬 매핑)
-- ============================================================
CREATE TABLE `mentor_skills` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `mentor_id` BIGINT NOT NULL,
  `skill_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_mentor_skill` (`mentor_id`, `skill_id`),
  INDEX `idx_mentor_skills_mentor` (`mentor_id`),
  INDEX `idx_mentor_skills_skill` (`skill_id`),
  CONSTRAINT `fk_mentorskill_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mentorskill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. tutorials (과외)
-- ============================================================
CREATE TABLE `tutorials` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `mentor_id` BIGINT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `price` INT NOT NULL COMMENT '1???�업 가�?,
  `duration` INT NOT NULL COMMENT '?�업 ?�간(�?',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 0.00 COMMENT '?�균 ?�점',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, PENDING, DELETED',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_tutorials_mentor` (`mentor_id`),
  INDEX `idx_tutorials_status` (`status`),
  CONSTRAINT `fk_tutorial_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. tutorial_skills (과외-?�킬 매핑)
-- ============================================================
CREATE TABLE `tutorial_skills` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `tutorial_id` BIGINT NOT NULL,
  `skill_id` BIGINT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_tutorial_skill` (`tutorial_id`, `skill_id`),
  INDEX `idx_tutorial_skills_tutorial` (`tutorial_id`),
  INDEX `idx_tutorial_skills_skill` (`skill_id`),
  CONSTRAINT `fk_tutorialskill_tutorial` FOREIGN KEY (`tutorial_id`) REFERENCES `tutorials` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tutorialskill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. payments (결제)
-- ============================================================
CREATE TABLE `payments` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `tutorial_id` BIGINT NOT NULL,
  `mentee_id` BIGINT NOT NULL,
  `imp_uid` VARCHAR(100) COMMENT 'PortOne 결제 고유 ID',
  `merchant_uid` VARCHAR(100) COMMENT '가맹점 주문 ID',
  `amount` INT NOT NULL COMMENT '결제 금액',
  `count` INT NOT NULL COMMENT '구매 ?�수 (?�용�?개수)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, PAID, CANCELLED, REFUNDED',
  `paid_at` TIMESTAMP NULL COMMENT '결제 ?�료 ?�간',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_merchant_uid` (`merchant_uid`),
  INDEX `idx_payments_tutorial` (`tutorial_id`),
  INDEX `idx_payments_mentee` (`mentee_id`),
  INDEX `idx_payments_status` (`status`),
  CONSTRAINT `fk_payment_tutorial` FOREIGN KEY (`tutorial_id`) REFERENCES `tutorials` (`id`),
  CONSTRAINT `fk_payment_mentee` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. tickets (?�용�?
-- ============================================================
CREATE TABLE `tickets` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `payment_id` BIGINT NOT NULL,
  `tutorial_id` BIGINT NOT NULL,
  `mentee_id` BIGINT NOT NULL,
  `total_count` INT NOT NULL COMMENT '�?구매 ?�수',
  `remaining_count` INT NOT NULL COMMENT '?��? ?�수',
  `expired_at` TIMESTAMP NULL COMMENT '?�효기간 (기본: 구매??+6개월)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_tickets_payment` (`payment_id`),
  INDEX `idx_tickets_tutorial` (`tutorial_id`),
  INDEX `idx_tickets_mentee` (`mentee_id`),
  INDEX `idx_tickets_expired` (`expired_at`),
  CONSTRAINT `fk_ticket_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`),
  CONSTRAINT `fk_ticket_tutorial` FOREIGN KEY (`tutorial_id`) REFERENCES `tutorials` (`id`),
  CONSTRAINT `fk_ticket_mentee` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. lessons (?�업)
-- ============================================================
CREATE TABLE `lessons` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `ticket_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'REQUESTED' COMMENT 'REQUESTED, CONFIRMED, REJECTED, SCHEDULED, COMPLETED, CANCELLED',
  `request_message` TEXT COMMENT '?�업 ?�청 메시지',
  `reject_reason` TEXT COMMENT '거절 ?�유',
  `scheduled_at` TIMESTAMP NOT NULL COMMENT '?�업 ?�정 ?�간',
  `completed_at` TIMESTAMP NULL COMMENT '?�업 ?�료 ?�간',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_lessons_ticket` (`ticket_id`),
  INDEX `idx_lessons_status` (`status`),
  INDEX `idx_lessons_scheduled` (`scheduled_at`),
  CONSTRAINT `fk_lesson_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. reviews (리뷰)
-- ============================================================
CREATE TABLE `reviews` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `tutorial_id` BIGINT NOT NULL,
  `mentee_id` BIGINT NOT NULL,
  `mentor_id` BIGINT NOT NULL,
  `rating` INT NOT NULL COMMENT '?�점 (1-5)',
  `content` TEXT NOT NULL COMMENT '리뷰 ?�용',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY `uk_review_mentee_tutorial` (`mentee_id`, `tutorial_id`) COMMENT '멘티??과외??1�?리뷰',
  INDEX `idx_reviews_tutorial` (`tutorial_id`),
  INDEX `idx_reviews_mentee` (`mentee_id`),
  INDEX `idx_reviews_mentor` (`mentor_id`),
  CONSTRAINT `fk_review_tutorial` FOREIGN KEY (`tutorial_id`) REFERENCES `tutorials` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_mentee` FOREIGN KEY (`mentee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_review_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `mentors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. questions (질문)
-- ============================================================
CREATE TABLE `questions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `lesson_id` BIGINT NOT NULL,
  `title` VARCHAR(200) NOT NULL COMMENT '질문 ?�목',
  `content` TEXT NOT NULL COMMENT '질문 ?�용',
  `code_content` TEXT COMMENT '코드 ?�니??,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_questions_lesson` (`lesson_id`),
  CONSTRAINT `fk_question_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. answers (?��?)
-- ============================================================
CREATE TABLE `answers` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `question_id` BIGINT NOT NULL,
  `content` TEXT NOT NULL COMMENT '?��? ?�용',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_answers_question` (`question_id`),
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
