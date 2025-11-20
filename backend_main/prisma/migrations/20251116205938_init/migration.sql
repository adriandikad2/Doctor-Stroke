-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "doctor_specialization_enum" AS ENUM ('NEUROLOGIST', 'PHYSIATRIST');

-- CreateEnum
CREATE TYPE "therapist_specialization_enum" AS ENUM ('PHYSICAL', 'OCCUPATIONAL', 'RECREATIONAL', 'SPEECH', 'PSYCHOLOGIST', 'DIETITIAN');

-- CreateEnum
CREATE TYPE "user_role_enum" AS ENUM ('doctor', 'therapist', 'family');

-- CreateEnum
CREATE TYPE "author_role_enum" AS ENUM ('family', 'medical');

-- CreateEnum
CREATE TYPE "appointment_status_enum" AS ENUM ('scheduled', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "medication_adherence_status_enum" AS ENUM ('taken', 'missed', 'delayed');

-- CreateEnum
CREATE TYPE "meal_type_enum" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role_enum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "doctor_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "medical_license" TEXT NOT NULL,
    "specialization" "doctor_specialization_enum" NOT NULL,
    "hospital_name" TEXT,
    "contact_number" TEXT,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("doctor_profile_id")
);

-- CreateTable
CREATE TABLE "therapist_profiles" (
    "therapist_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "medical_license" TEXT NOT NULL,
    "specialization" "therapist_specialization_enum" NOT NULL,
    "hospital_name" TEXT,
    "contact_number" TEXT,

    CONSTRAINT "therapist_profiles_pkey" PRIMARY KEY ("therapist_profile_id")
);

-- CreateTable
CREATE TABLE "family_profiles" (
    "family_profile_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" "gender_enum",
    "home_address" TEXT,
    "contact_number" TEXT,

    CONSTRAINT "family_profiles_pkey" PRIMARY KEY ("family_profile_id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "patient_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "gender_enum",
    "medical_history" TEXT,
    "unique_code" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "patient_care_team" (
    "link_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,

    CONSTRAINT "patient_care_team_pkey" PRIMARY KEY ("link_id")
);

-- CreateTable
CREATE TABLE "availability_slots" (
    "slot_id" UUID NOT NULL,
    "medical_user_id" UUID NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,
    "is_booked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("slot_id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" UUID NOT NULL,
    "slot_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "booked_by_user_id" UUID NOT NULL,
    "status" "appointment_status_enum" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "prescription_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_user_id" UUID NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "instructions" TEXT,
    "frequency_per_day" INTEGER NOT NULL,
    "dosing_times" TEXT[],
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("prescription_id")
);

-- CreateTable
CREATE TABLE "medication_adherence_logs" (
    "adherence_id" UUID NOT NULL,
    "prescription_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "logged_by_user_id" UUID NOT NULL,
    "status" "medication_adherence_status_enum" NOT NULL,
    "scheduled_time" TIMESTAMP,
    "taken_time" TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_adherence_logs_pkey" PRIMARY KEY ("adherence_id")
);

-- CreateTable
CREATE TABLE "nutrition_profiles" (
    "patient_id" UUID NOT NULL,
    "calorie_target_min" INTEGER NOT NULL DEFAULT 1400,
    "calorie_target_max" INTEGER NOT NULL DEFAULT 1800,
    "sodium_limit_mg" INTEGER NOT NULL DEFAULT 1500,
    "fiber_target_g" INTEGER NOT NULL DEFAULT 25,
    "fluid_limit_ml" INTEGER NOT NULL DEFAULT 2000,
    "updated_by_user_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "meal_logs" (
    "meal_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "logged_by_user_id" UUID NOT NULL,
    "meal_type" "meal_type_enum" NOT NULL,
    "foods" TEXT[],
    "sodium_mg" INTEGER NOT NULL DEFAULT 0,
    "calories" INTEGER NOT NULL DEFAULT 0,
    "fiber_g" INTEGER NOT NULL DEFAULT 0,
    "logged_for" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("meal_id")
);

-- CreateTable
CREATE TABLE "patient_progress_snapshots" (
    "entry_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "recorded_by_user_id" UUID NOT NULL,
    "recorded_at" TIMESTAMP NOT NULL,
    "mood" TEXT,
    "symptom_score" INTEGER,
    "mobility_score" INTEGER,
    "exercise_completed" BOOLEAN,
    "blood_pressure_systolic" INTEGER,
    "blood_pressure_diastolic" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_progress_snapshots_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "progress_logs" (
    "log_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "author_role" "author_role_enum" NOT NULL,
    "log_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "medication_interactions" (
    "interaction_id" UUID NOT NULL,
    "medication_a" TEXT NOT NULL,
    "medication_b" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "medication_interactions_pkey" PRIMARY KEY ("interaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_user_id_key" ON "doctor_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_medical_license_key" ON "doctor_profiles"("medical_license");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_profiles_user_id_key" ON "therapist_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "therapist_profiles_medical_license_key" ON "therapist_profiles"("medical_license");

-- CreateIndex
CREATE UNIQUE INDEX "family_profiles_user_id_key" ON "family_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_unique_code_key" ON "patient_profiles"("unique_code");

-- CreateIndex
CREATE UNIQUE INDEX "patient_care_team_user_id_patient_id_key" ON "patient_care_team"("user_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "availability_slots_medical_user_id_start_time_key" ON "availability_slots"("medical_user_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_slot_id_key" ON "appointments"("slot_id");

-- CreateIndex
CREATE UNIQUE INDEX "medication_interactions_medication_a_medication_b_key" ON "medication_interactions"("medication_a", "medication_b");

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "therapist_profiles" ADD CONSTRAINT "therapist_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_profiles" ADD CONSTRAINT "family_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_team" ADD CONSTRAINT "patient_care_team_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_care_team" ADD CONSTRAINT "patient_care_team_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_medical_user_id_fkey" FOREIGN KEY ("medical_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "availability_slots"("slot_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_booked_by_user_id_fkey" FOREIGN KEY ("booked_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_user_id_fkey" FOREIGN KEY ("doctor_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence_logs" ADD CONSTRAINT "medication_adherence_logs_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("prescription_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence_logs" ADD CONSTRAINT "medication_adherence_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence_logs" ADD CONSTRAINT "medication_adherence_logs_logged_by_user_id_fkey" FOREIGN KEY ("logged_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_profiles" ADD CONSTRAINT "nutrition_profiles_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_logged_by_user_id_fkey" FOREIGN KEY ("logged_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_progress_snapshots" ADD CONSTRAINT "patient_progress_snapshots_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_progress_snapshots" ADD CONSTRAINT "patient_progress_snapshots_recorded_by_user_id_fkey" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_logs" ADD CONSTRAINT "progress_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_logs" ADD CONSTRAINT "progress_logs_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
