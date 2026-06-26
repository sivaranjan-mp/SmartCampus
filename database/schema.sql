-- ============================================================
--  SmartCampus — Reference PostgreSQL Schema
--  Generated to match the JPA entity model in
--  backend/src/main/java/com/smartcampus/model/**
--
--  NOTE: spring.jpa.hibernate.ddl-auto=update (see application.properties)
--  means Hibernate creates/updates these tables automatically at
--  application startup — you do NOT need to run this file to get the
--  app working. It exists as accurate, human-readable documentation
--  of the schema, and as a reference for anyone setting up the
--  database manually (e.g. on Supabase) or writing reports/migrations.
-- ============================================================

-- Clean up existing views and tables
DROP VIEW IF EXISTS vw_pending_approvals CASCADE;
DROP VIEW IF EXISTS vw_active_resources CASCADE;

DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS semester_timetables CASCADE;
DROP TABLE IF EXISTS booking_approvals CASCADE;
DROP TABLE IF EXISTS booking_documents CASCADE;
DROP TABLE IF EXISTS booking_faculty_supports CASCADE;
DROP TABLE IF EXISTS booking_coordinators CASCADE;
DROP TABLE IF EXISTS booking_outcomes CASCADE;
DROP TABLE IF EXISTS booking_objectives CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ============================================================
-- TABLE: departments
-- ============================================================

CREATE TABLE departments (
    id              BIGSERIAL,
    name            VARCHAR(255)    NOT NULL,
    code            VARCHAR(20),
    description     TEXT,
    hod_name        VARCHAR(255),
    hod_email       VARCHAR(255),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_departments      PRIMARY KEY (id),
    CONSTRAINT uq_departments_name UNIQUE (name),
    CONSTRAINT uq_departments_code UNIQUE (code)
);

CREATE INDEX idx_departments_is_active ON departments (is_active);


-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE users (
    id                  BIGSERIAL,
    full_name           VARCHAR(100)    NOT NULL,
    email               VARCHAR(150)    NOT NULL,
    register_number     VARCHAR(30),
    password            VARCHAR(255)    NOT NULL,
    role                VARCHAR(20)     NOT NULL CHECK (role IN ('STUDENT','FACULTY','HOD','ADMIN')),
    department_name     VARCHAR(150),
    year_of_study       INTEGER,
    graduation_year     INTEGER,
    phone_number        VARCHAR(15),
    profile_image_url   VARCHAR(500),
    is_verified         BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at       TIMESTAMP,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_users                 PRIMARY KEY (id),
    CONSTRAINT uq_users_email           UNIQUE (email),
    CONSTRAINT uq_users_register_number UNIQUE (register_number),
    CONSTRAINT chk_users_email_format   CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    CONSTRAINT chk_users_phone_format   CHECK (phone_number IS NULL OR phone_number ~ '^[0-9]{10,15}$')
);

CREATE INDEX idx_users_role             ON users (role);
CREATE INDEX idx_users_department_name  ON users (department_name);
CREATE INDEX idx_users_is_active        ON users (is_active);
CREATE INDEX idx_users_is_verified      ON users (is_verified);
CREATE INDEX idx_users_register_number  ON users (register_number);


-- ============================================================
-- TABLE: resources
-- ============================================================

CREATE TABLE resources (
    id                      BIGSERIAL,
    name                    VARCHAR(150)    NOT NULL,
    resource_code           VARCHAR(30)     NOT NULL,
    category                VARCHAR(30)     NOT NULL CHECK (category IN (
                                'LAB','CLASSROOM','SEMINAR_HALL','CONFERENCE_ROOM',
                                'EQUIPMENT','PROJECTOR','SPORTS_FACILITY','AUDITORIUM',
                                'LIBRARY','WORKSHOP','OTHER'
                            )),
    scope                   VARCHAR(20)     NOT NULL DEFAULT 'COMMON' CHECK (scope IN ('DEPARTMENT','COMMON')),
    department_id           BIGINT,
    approval_authority      VARCHAR(20)     NOT NULL DEFAULT 'ADMIN' CHECK (approval_authority IN ('HOD','ADMIN','AUTO')),
    capacity                INTEGER,
    location                VARCHAR(150),
    floor_number            VARCHAR(10),
    building_name           VARCHAR(100),
    description             TEXT,
    amenities               TEXT,
    image_url               VARCHAR(500),
    available_from          TIME            DEFAULT '08:00:00',
    available_to            TIME            DEFAULT '18:00:00',
    available_days          VARCHAR(40)     DEFAULT 'MON,TUE,WED,THU,FRI',
    min_advance_days        INTEGER         NOT NULL DEFAULT 1,
    max_advance_days        INTEGER         NOT NULL DEFAULT 30,
    max_booking_hours       INTEGER         NOT NULL DEFAULT 4,
    buffer_days_before      INTEGER         NOT NULL DEFAULT 0,
    buffer_days_after       INTEGER         NOT NULL DEFAULT 0,
    is_active               BOOLEAN         NOT NULL DEFAULT TRUE,
    is_under_maintenance    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_by              BIGINT,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_resources              PRIMARY KEY (id),
    CONSTRAINT uq_resource_code          UNIQUE (resource_code),
    CONSTRAINT fk_resource_department    FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_resource_created_by    FOREIGN KEY (created_by)    REFERENCES users (id)       ON DELETE SET NULL,
    CONSTRAINT chk_resources_advance_days CHECK (min_advance_days <= max_advance_days),
    CONSTRAINT chk_resources_capacity     CHECK (capacity IS NULL OR capacity > 0)
);

CREATE INDEX idx_resources_category          ON resources (category);
CREATE INDEX idx_resources_scope             ON resources (scope);
CREATE INDEX idx_resources_department_id     ON resources (department_id);
CREATE INDEX idx_resources_is_active         ON resources (is_active);
CREATE INDEX idx_resources_is_maintenance    ON resources (is_under_maintenance);
CREATE INDEX idx_resources_scope_active      ON resources (scope, is_active, is_under_maintenance);


-- ============================================================
-- TABLE: bookings
-- ============================================================

CREATE TABLE bookings (
    id                      BIGSERIAL,
    booking_reference       VARCHAR(20)     NOT NULL,
    resource_id             BIGINT          NOT NULL,
    booked_by               BIGINT          NOT NULL,
    department_id           BIGINT,
    event_name              VARCHAR(200)    NOT NULL,
    event_domain            VARCHAR(30)     NOT NULL CHECK (event_domain IN (
                                'TECHNICAL','CULTURAL','SPORTS','ACADEMIC','WORKSHOP',
                                'SEMINAR','HACKATHON','COMPETITION','EXHIBITION',
                                'GUEST_LECTURE','INDUSTRY_VISIT','OTHER'
                            )),
    participants_count      INTEGER         NOT NULL,
    remarks                 VARCHAR(1000),
    booking_date            DATE            NOT NULL,
    start_time              TIME            NOT NULL,
    end_time                TIME            NOT NULL,
    status                  VARCHAR(20)     NOT NULL DEFAULT 'PENDING' CHECK (status IN (
                                'DRAFT','PENDING','PENDING_HOD','PENDING_ADMIN',
                                'APPROVED','REJECTED','CANCELLED','COMPLETED','NO_SHOW'
                            )),
    priority                VARCHAR(10)     NOT NULL DEFAULT 'NORMAL',
    cancellation_reason     VARCHAR(500),
    cancelled_at            TIMESTAMP,
    cancelled_by            BIGINT,
    rejection_reason        VARCHAR(500),
    approved_at             TIMESTAMP,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_bookings              PRIMARY KEY (id),
    CONSTRAINT uq_booking_reference     UNIQUE (booking_reference),
    CONSTRAINT fk_booking_resource      FOREIGN KEY (resource_id)   REFERENCES resources (id)   ON DELETE RESTRICT,
    CONSTRAINT fk_booking_user          FOREIGN KEY (booked_by)     REFERENCES users (id)        ON DELETE RESTRICT,
    CONSTRAINT fk_booking_dept          FOREIGN KEY (department_id) REFERENCES departments (id)  ON DELETE SET NULL,
    CONSTRAINT fk_booking_cancelled_by  FOREIGN KEY (cancelled_by)  REFERENCES users (id)        ON DELETE SET NULL,
    CONSTRAINT chk_bookings_time_order  CHECK (start_time < end_time),
    CONSTRAINT chk_bookings_participants CHECK (participants_count > 0)
);

CREATE INDEX idx_bookings_resource_id    ON bookings (resource_id);
CREATE INDEX idx_bookings_booked_by      ON bookings (booked_by);
CREATE INDEX idx_bookings_status         ON bookings (status);
CREATE INDEX idx_bookings_booking_date   ON bookings (booking_date);
CREATE INDEX idx_bookings_reference      ON bookings (booking_reference);
CREATE INDEX idx_bookings_conflict_check ON bookings (resource_id, booking_date, status);
CREATE INDEX idx_bookings_user_date      ON bookings (booked_by, booking_date, status);


-- ============================================================
-- TABLE: booking_objectives
-- ============================================================

CREATE TABLE booking_objectives (
    id              BIGSERIAL,
    booking_id      BIGINT          NOT NULL,
    sequence_number INTEGER         NOT NULL,
    description     VARCHAR(500)    NOT NULL,

    CONSTRAINT pk_booking_objectives PRIMARY KEY (id),
    CONSTRAINT fk_obj_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

CREATE INDEX idx_obj_booking_id ON booking_objectives (booking_id);


-- ============================================================
-- TABLE: booking_outcomes
-- ============================================================

CREATE TABLE booking_outcomes (
    id              BIGSERIAL,
    booking_id      BIGINT          NOT NULL,
    sequence_number INTEGER         NOT NULL,
    description     VARCHAR(500)    NOT NULL,

    CONSTRAINT pk_booking_outcomes PRIMARY KEY (id),
    CONSTRAINT fk_outcome_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

CREATE INDEX idx_outcome_booking_id ON booking_outcomes (booking_id);


-- ============================================================
-- TABLE: booking_coordinators
-- ============================================================

CREATE TABLE booking_coordinators (
    id              BIGSERIAL,
    booking_id      BIGINT          NOT NULL,
    user_id         BIGINT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    register_number VARCHAR(30),
    department      VARCHAR(150),
    year_of_study   INTEGER,
    phone_number    VARCHAR(15),

    CONSTRAINT pk_booking_coordinators PRIMARY KEY (id),
    CONSTRAINT uq_booking_coordinator  UNIQUE (booking_id, email),
    CONSTRAINT fk_coord_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_coord_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE SET NULL
);

CREATE INDEX idx_coord_booking_id ON booking_coordinators (booking_id);
CREATE INDEX idx_coord_user_id    ON booking_coordinators (user_id);


-- ============================================================
-- TABLE: booking_faculty_supports
-- ============================================================

CREATE TABLE booking_faculty_supports (
    id              BIGSERIAL,
    booking_id      BIGINT          NOT NULL,
    user_id         BIGINT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    department      VARCHAR(150),
    phone_number    VARCHAR(15),

    CONSTRAINT pk_booking_faculty_supports PRIMARY KEY (id),
    CONSTRAINT uq_booking_faculty UNIQUE (booking_id),
    CONSTRAINT fk_faculty_user    FOREIGN KEY (user_id)    REFERENCES users (id)    ON DELETE SET NULL
);

CREATE INDEX idx_faculty_booking_id ON booking_faculty_supports (booking_id);
CREATE INDEX idx_faculty_user_id    ON booking_faculty_supports (user_id);


-- ============================================================
-- TABLE: booking_documents
-- ============================================================

CREATE TABLE booking_documents (
    id                  BIGSERIAL,
    booking_id          BIGINT          NOT NULL,
    document_type       VARCHAR(30)     NOT NULL CHECK (document_type IN ('PERMISSION_LETTER','FACULTY_SUPPORT_LETTER','POSTER','OTHER')),
    original_file_name  VARCHAR(255)    NOT NULL,
    stored_file_name    VARCHAR(255)    NOT NULL,
    file_path           VARCHAR(500)    NOT NULL,
    content_type        VARCHAR(100),
    file_size_bytes     BIGINT,
    uploaded_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_booking_documents PRIMARY KEY (id),
    CONSTRAINT fk_doc_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

CREATE INDEX idx_doc_booking_id ON booking_documents (booking_id);


-- ============================================================
-- TABLE: booking_approvals
-- ============================================================

CREATE TABLE booking_approvals (
    id              BIGSERIAL,
    booking_id      BIGINT          NOT NULL,
    approval_level  VARCHAR(10)     NOT NULL CHECK (approval_level IN ('HOD','ADMIN')),
    status          VARCHAR(30)     NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','REVISION_REQUESTED')),
    reviewed_by     BIGINT,
    remarks         VARCHAR(1000),
    reviewed_at     TIMESTAMP,
    sequence_order  INTEGER         NOT NULL DEFAULT 1,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_booking_approvals    PRIMARY KEY (id),
    CONSTRAINT uq_booking_approval_level UNIQUE (booking_id, approval_level),
    CONSTRAINT fk_approval_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id)    ON DELETE SET NULL
);

CREATE INDEX idx_approval_booking_id   ON booking_approvals (booking_id);
CREATE INDEX idx_approval_reviewed_by  ON booking_approvals (reviewed_by);
CREATE INDEX idx_approval_status       ON booking_approvals (status);
CREATE INDEX idx_approval_level_status ON booking_approvals (approval_level, status);


-- ============================================================
-- TABLE: semester_timetables
-- ============================================================

CREATE TABLE semester_timetables (
    id              BIGSERIAL,
    department_id   BIGINT          NOT NULL,
    academic_year   VARCHAR(9)      NOT NULL, -- e.g. 2025-2026
    semester        INTEGER         NOT NULL,
    section         VARCHAR(10),
    year_of_study   INTEGER         NOT NULL,
    effective_from  DATE            NOT NULL,
    effective_to    DATE            NOT NULL,
    created_by      BIGINT          NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_semester_timetables PRIMARY KEY (id),
    CONSTRAINT uq_timetable_dept_year_sem_section UNIQUE (department_id, academic_year, semester, section),
    CONSTRAINT fk_tt_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_tt_created_by FOREIGN KEY (created_by)    REFERENCES users (id)       ON DELETE RESTRICT,
    CONSTRAINT chk_tt_effective_dates CHECK (effective_from < effective_to)
);

CREATE INDEX idx_tt_department_id ON semester_timetables (department_id);
CREATE INDEX idx_tt_academic_year ON semester_timetables (academic_year);
CREATE INDEX idx_tt_is_active     ON semester_timetables (is_active);


-- ============================================================
-- TABLE: timetable_slots
-- ============================================================

CREATE TABLE timetable_slots (
    id              BIGSERIAL,
    timetable_id    BIGINT          NOT NULL,
    resource_id     BIGINT,
    faculty_id      BIGINT,
    subject_code    VARCHAR(20)     NOT NULL,
    subject_name    VARCHAR(150)    NOT NULL,
    day_of_week     VARCHAR(3)      NOT NULL, -- MON..SAT
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    slot_type       VARCHAR(15)     NOT NULL DEFAULT 'LECTURE',
    week_type       VARCHAR(5)      NOT NULL DEFAULT 'ALL',
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_timetable_slots PRIMARY KEY (id),
    CONSTRAINT fk_slot_timetable FOREIGN KEY (timetable_id) REFERENCES semester_timetables (id) ON DELETE CASCADE,
    CONSTRAINT fk_slot_resource  FOREIGN KEY (resource_id)  REFERENCES resources (id)            ON DELETE SET NULL,
    CONSTRAINT fk_slot_faculty   FOREIGN KEY (faculty_id)   REFERENCES users (id)                ON DELETE SET NULL,
    CONSTRAINT chk_slot_time_order CHECK (start_time < end_time)
);

CREATE INDEX idx_slot_timetable_id ON timetable_slots (timetable_id);
CREATE INDEX idx_slot_resource_id  ON timetable_slots (resource_id);
CREATE INDEX idx_slot_faculty_id   ON timetable_slots (faculty_id);
CREATE INDEX idx_slot_day_of_week  ON timetable_slots (day_of_week);
CREATE INDEX idx_slot_resource_day ON timetable_slots (resource_id, day_of_week, is_active);
CREATE INDEX idx_slot_faculty_day  ON timetable_slots (faculty_id, day_of_week, is_active);


-- ============================================================
-- TABLE: otp_verifications
-- ============================================================

CREATE TABLE otp_verifications (
    id              BIGSERIAL,
    email           VARCHAR(150)    NOT NULL,
    otp             CHAR(6)         NOT NULL,
    purpose         VARCHAR(20)     NOT NULL CHECK (purpose IN ('REGISTRATION','PASSWORD_RESET')),
    expires_at      TIMESTAMP       NOT NULL,
    is_used         BOOLEAN         NOT NULL DEFAULT FALSE,
    attempt_count   INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_otp_verifications PRIMARY KEY (id),
    CONSTRAINT chk_otp_format   CHECK (otp ~ '^[0-9]{6}$'),
    CONSTRAINT chk_otp_attempts CHECK (attempt_count <= 10)
);

CREATE INDEX idx_otp_email         ON otp_verifications (email);
CREATE INDEX idx_otp_email_purpose ON otp_verifications (email, purpose, is_used);
CREATE INDEX idx_otp_expires_at    ON otp_verifications (expires_at);


-- ============================================================
-- VIEWS
-- ============================================================

-- Active, bookable resource summary
CREATE OR REPLACE VIEW vw_active_resources AS
SELECT
    r.id, r.name, r.resource_code, r.category, r.scope,
    r.capacity, r.location, r.building_name, r.floor_number,
    r.available_from, r.available_to, r.available_days,
    r.min_advance_days, r.max_advance_days, r.max_booking_hours,
    r.approval_authority,
    d.name AS department_name
FROM  resources r
LEFT  JOIN departments d ON r.department_id = d.id
WHERE r.is_active = TRUE
AND   r.is_under_maintenance = FALSE;


-- Pending approvals queue
CREATE OR REPLACE VIEW vw_pending_approvals AS
SELECT
    ba.id            AS approval_id,
    ba.booking_id,
    ba.approval_level,
    b.booking_reference,
    b.event_name,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.priority,
    r.name           AS resource_name,
    r.resource_code,
    r.scope          AS resource_scope,
    u.full_name      AS requested_by_name,
    u.email          AS requested_by_email,
    u.role           AS requested_by_role,
    ba.created_at    AS pending_since
FROM  booking_approvals ba
JOIN  bookings  b  ON ba.booking_id = b.id
JOIN  resources r  ON b.resource_id = r.id
JOIN  users     u  ON b.booked_by   = u.id
WHERE ba.status = 'PENDING';


-- ============================================================
-- SEED DATA
-- ============================================================

-- Default admin account — Password: Admin@1234 (BCrypt, cost=12)
INSERT INTO users
    (full_name, email, register_number, password, role, department_name, is_verified, is_active)
VALUES (
    'System Administrator',
    'admin@smartcampus.edu',
    NULL,
    '$2a$12$LKpToQwRfbDt8g2CyRb7cO5Y0VFMS1uM.5eeMXsFAQWHiU0nY9wWi',
    'ADMIN',
    'Administration',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Seed departments
INSERT INTO departments (name, code, description) VALUES
('Computer Science and Engineering',         'CSE',  'Department of CSE'),
('Electronics and Communication Engineering','ECE',  'Department of ECE'),
('Electrical and Electronics Engineering',   'EEE',  'Department of EEE'),
('Mechanical Engineering',                   'MECH', 'Department of Mechanical Engineering'),
('Civil Engineering',                        'CIVIL','Department of Civil Engineering'),
('Information Technology',                   'IT',   'Department of IT'),
('Artificial Intelligence and Data Science', 'AIDS', 'Department of AI & Data Science'),
('Biomedical Engineering',                   'BME',  'Department of Biomedical Engineering'),
('Chemical Engineering',                     'CHEM', 'Department of Chemical Engineering'),
('Aeronautical Engineering',                 'AERO', 'Department of Aeronautical Engineering')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
--  END OF SCHEMA
-- ============================================================
