CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- EXTENSION & ENUMS
CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE');

CREATE TYPE doctor_specialization_enum AS ENUM ('NEUROLOGIST', 'PHYSIATRIST');

CREATE TYPE therapist_specialization_enum AS ENUM 
  ('PHYSICAL', 'OCCUPATIONAL', 'RECREATIONAL', 'SPEECH', 'PSYCHOLOGIST');

CREATE TYPE user_role_enum AS ENUM ('admin', 'doctor', 'therapist', 'patient', 'caregiver');

CREATE TYPE weekly_slot_enum AS ENUM (
  'Monday 09:00–11:00','Monday 13:00–16:00','Monday 17:30–20:00','Monday 21:00–22:00',
  'Tuesday 09:00–11:00','Tuesday 13:00–16:00','Tuesday 17:30–20:00','Tuesday 21:00–22:00',
  'Wednesday 09:00–11:00','Wednesday 13:00–16:00','Wednesday 17:30–20:00','Wednesday 21:00–22:00',
  'Thursday 09:00–11:00','Thursday 13:00–16:00','Thursday 17:30–20:00','Thursday 21:00–22:00',
  'Friday 09:00–11:00','Friday 13:00–16:00','Friday 17:30–20:00','Friday 21:00–22:00',
  'Saturday 09:00–11:00','Saturday 13:00–16:00','Saturday 17:30–20:00','Saturday 21:00–22:00',
  'Sunday 09:00–11:00','Sunday 13:00–16:00','Sunday 17:30–20:00','Sunday 21:00–22:00'
);

-- USERS TABLE (Auth & role management)
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'patient',
  specialty VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAMILY 
CREATE TABLE family (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender gender_enum NOT NULL,
  email VARCHAR(100) UNIQUE,
  home_address TEXT,
  contact_number VARCHAR(20),
  date_of_birth DATE,
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENT
CREATE TABLE patients (
  patient_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  medical_record VARCHAR(25) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender gender_enum,
  email VARCHAR(100) UNIQUE,
  home_address TEXT,
  contact_number VARCHAR(20),
  date_of_birth DATE NOT NULL,
  age INTEGER,
  medical_history TEXT,
  family_contact UUID REFERENCES family(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCTOR
CREATE TABLE doctor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  medical_license VARCHAR(100) UNIQUE NOT NULL,
  specialization doctor_specialization_enum NOT NULL,
  schedule_availability weekly_slot_enum[] NOT NULL,
  hospital_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  contact_number VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- THERAPIST
CREATE TABLE therapist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  medical_license VARCHAR(100) UNIQUE NOT NULL,
  specialization therapist_specialization_enum NOT NULL,
  schedule_availability weekly_slot_enum[] NOT NULL,
  hospital_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  contact_number VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENT_CARE_TEAM (Links patients to their care team members)
CREATE TABLE patient_care_team (
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role VARCHAR(50),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (patient_id, user_id)
);

-- APPOINTMENT
CREATE TABLE appointments (
  appointment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctor(id),
  caregiver_id UUID REFERENCES users(user_id),
  therapist_id UUID REFERENCES therapist(id),
  date_time TIMESTAMPTZ,
  doctor_appointment_schedule weekly_slot_enum,
  therapist_appointment_schedule weekly_slot_enum,
  notes TEXT,
  status VARCHAR(100) DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTION
CREATE TABLE prescriptions (
  prescription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(user_id),
  medication_name VARCHAR(100) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  instructions VARCHAR(255),
  frequency_per_day INTEGER NOT NULL CHECK (frequency_per_day > 0),
  dosing_times VARCHAR(100)[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  reminder_window_minutes INTEGER DEFAULT 15 CHECK (reminder_window_minutes BETWEEN 5 AND 120),
  is_critical BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICATION_ADHERENCE_LOGS (Track adherence to prescriptions)
CREATE TABLE medication_adherence_logs (
  adherence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES users(user_id),
  status VARCHAR(100) NOT NULL CHECK (status IN ('taken','missed','delayed')),
  scheduled_time TIMESTAMPTZ,
  taken_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICATION_INTERACTIONS (Reference database of drug interactions)
CREATE TABLE medication_interactions (
  interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_a VARCHAR(100) NOT NULL,
  medication_b VARCHAR(100) NOT NULL,
  severity VARCHAR(100) NOT NULL CHECK (severity IN ('low','moderate','high')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_medication_pair UNIQUE (medication_a, medication_b)
);

-- PATIENT_PROGRESS_SNAPSHOTS (Track patient health metrics)
CREATE TABLE patient_progress_snapshots (
  entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES users(user_id),
  recorded_at TIMESTAMPTZ NOT NULL,
  mood VARCHAR(100),
  symptom_score INTEGER CHECK (symptom_score BETWEEN 0 AND 10),
  mobility_score INTEGER CHECK (mobility_score BETWEEN 0 AND 10),
  exercise_completed BOOLEAN,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  medication_adherence_score NUMERIC(5,2),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NUTRITION_PROFILES (Personalized nutrition targets)
CREATE TABLE nutrition_profiles (
  patient_id UUID PRIMARY KEY REFERENCES patients(patient_id) ON DELETE CASCADE,
  calorie_target_min INTEGER DEFAULT 1400,
  calorie_target_max INTEGER DEFAULT 1800,
  sodium_limit_mg INTEGER DEFAULT 1500,
  fiber_target_g INTEGER DEFAULT 25,
  fluid_limit_ml INTEGER DEFAULT 2000,
  updated_by UUID REFERENCES users(user_id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEAL_LOGS (Track daily meal intake)
CREATE TABLE meal_logs (
  meal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES users(user_id),
  meal_type VARCHAR(100) NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  foods VARCHAR(100)[],
  sodium_mg INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  fiber_g INTEGER DEFAULT 0,
  sugar_g INTEGER,
  logged_for DATE NOT NULL,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for better performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_adherence_logs_patient_id ON medication_adherence_logs(patient_id);
CREATE INDEX idx_adherence_logs_prescription_id ON medication_adherence_logs(prescription_id);
CREATE INDEX idx_progress_snapshots_patient_id ON patient_progress_snapshots(patient_id);
CREATE INDEX idx_meal_logs_patient_id ON meal_logs(patient_id);
CREATE INDEX idx_patient_care_team_patient_id ON patient_care_team(patient_id);
CREATE INDEX idx_patient_care_team_user_id ON patient_care_team(user_id);


