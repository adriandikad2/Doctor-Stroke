-- CreateEnum
CREATE TYPE "exercise_adherence_status_enum" AS ENUM ('taken', 'missed');

-- CreateEnum
CREATE TYPE "nutrition_adherence_status_enum" AS ENUM ('taken', 'missed');

-- CreateEnum
CREATE TYPE "nutrition_food_category_enum" AS ENUM ('vegetable', 'main_course', 'snack', 'beverages');

-- AlterTable
ALTER TABLE "patient_profiles" ADD COLUMN     "documents" JSONB;

-- CreateTable
CREATE TABLE "medication_catalogs" (
    "catalog_id" UUID NOT NULL,
    "medication_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dosage_standard" TEXT NOT NULL,
    "side_effects" TEXT,
    "contraindications" TEXT,
    "image_url" TEXT,
    "manufacturer" TEXT,
    "registration_no" TEXT,
    "product_category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_catalogs_pkey" PRIMARY KEY ("catalog_id")
);

-- CreateTable
CREATE TABLE "patient_medication_catalogs" (
    "patient_med_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "catalog_id" UUID NOT NULL,
    "doctor_user_id" UUID NOT NULL,
    "prescribed_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_medication_catalogs_pkey" PRIMARY KEY ("patient_med_id")
);

-- CreateTable
CREATE TABLE "medication_adherence_logs_v2" (
    "adherence_id" UUID NOT NULL,
    "patient_med_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "logged_by_user_id" UUID NOT NULL,
    "status" "medication_adherence_status_enum" NOT NULL,
    "scheduled_time" TIMESTAMP(6),
    "taken_time" TIMESTAMP(6),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_adherence_logs_v2_pkey" PRIMARY KEY ("adherence_id")
);

-- CreateTable
CREATE TABLE "exercise_catalogs" (
    "catalog_id" UUID NOT NULL,
    "exercise_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specialization" "therapist_specialization_enum" NOT NULL,
    "frequency_per_day" INTEGER NOT NULL,
    "duration_minutes" INTEGER,
    "image_url" TEXT,
    "tutorial_url" TEXT,
    "instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_catalogs_pkey" PRIMARY KEY ("catalog_id")
);

-- CreateTable
CREATE TABLE "patient_exercise_catalogs" (
    "patient_ex_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "catalog_id" UUID NOT NULL,
    "therapist_user_id" UUID NOT NULL,
    "prescribed_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_exercise_catalogs_pkey" PRIMARY KEY ("patient_ex_id")
);

-- CreateTable
CREATE TABLE "exercise_adherence_logs" (
    "adherence_id" UUID NOT NULL,
    "patient_ex_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "logged_by_user_id" UUID NOT NULL,
    "status" "exercise_adherence_status_enum" NOT NULL DEFAULT 'taken',
    "scheduled_date" DATE,
    "actual_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_adherence_logs_pkey" PRIMARY KEY ("adherence_id")
);

-- CreateTable
CREATE TABLE "nutrition_food_catalogs" (
    "catalog_id" UUID NOT NULL,
    "food_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "food_category" "nutrition_food_category_enum" NOT NULL,
    "meal_type" "meal_type_enum" NOT NULL,
    "image_url" TEXT,
    "calories" INTEGER,
    "sodium_mg" INTEGER,
    "fiber_g" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_food_catalogs_pkey" PRIMARY KEY ("catalog_id")
);

-- CreateTable
CREATE TABLE "patient_nutrition_catalogs" (
    "patient_food_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "catalog_id" UUID NOT NULL,
    "doctor_user_id" UUID NOT NULL,
    "prescribed_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_nutrition_catalogs_pkey" PRIMARY KEY ("patient_food_id")
);

-- CreateTable
CREATE TABLE "nutrition_adherence_logs" (
    "adherence_id" UUID NOT NULL,
    "patient_food_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "logged_by_user_id" UUID NOT NULL,
    "status" "nutrition_adherence_status_enum" NOT NULL DEFAULT 'taken',
    "scheduled_date" DATE,
    "actual_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_adherence_logs_pkey" PRIMARY KEY ("adherence_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_medication_catalogs_patient_id_catalog_id_key" ON "patient_medication_catalogs"("patient_id", "catalog_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_exercise_catalogs_patient_id_catalog_id_key" ON "patient_exercise_catalogs"("patient_id", "catalog_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_nutrition_catalogs_patient_id_catalog_id_key" ON "patient_nutrition_catalogs"("patient_id", "catalog_id");

-- AddForeignKey
ALTER TABLE "patient_medication_catalogs" ADD CONSTRAINT "patient_medication_catalogs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medication_catalogs" ADD CONSTRAINT "patient_medication_catalogs_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "medication_catalogs"("catalog_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medication_catalogs" ADD CONSTRAINT "patient_medication_catalogs_doctor_user_id_fkey" FOREIGN KEY ("doctor_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence_logs_v2" ADD CONSTRAINT "medication_adherence_logs_v2_logged_by_user_id_fkey" FOREIGN KEY ("logged_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence_logs_v2" ADD CONSTRAINT "medication_adherence_logs_v2_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_adherence_logs_v2" ADD CONSTRAINT "medication_adherence_logs_v2_patient_med_id_fkey" FOREIGN KEY ("patient_med_id") REFERENCES "patient_medication_catalogs"("patient_med_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_exercise_catalogs" ADD CONSTRAINT "patient_exercise_catalogs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_exercise_catalogs" ADD CONSTRAINT "patient_exercise_catalogs_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "exercise_catalogs"("catalog_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_exercise_catalogs" ADD CONSTRAINT "patient_exercise_catalogs_therapist_user_id_fkey" FOREIGN KEY ("therapist_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_adherence_logs" ADD CONSTRAINT "exercise_adherence_logs_logged_by_user_id_fkey" FOREIGN KEY ("logged_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_adherence_logs" ADD CONSTRAINT "exercise_adherence_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_adherence_logs" ADD CONSTRAINT "exercise_adherence_logs_patient_ex_id_fkey" FOREIGN KEY ("patient_ex_id") REFERENCES "patient_exercise_catalogs"("patient_ex_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nutrition_catalogs" ADD CONSTRAINT "patient_nutrition_catalogs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nutrition_catalogs" ADD CONSTRAINT "patient_nutrition_catalogs_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "nutrition_food_catalogs"("catalog_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nutrition_catalogs" ADD CONSTRAINT "patient_nutrition_catalogs_doctor_user_id_fkey" FOREIGN KEY ("doctor_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_adherence_logs" ADD CONSTRAINT "nutrition_adherence_logs_logged_by_user_id_fkey" FOREIGN KEY ("logged_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_adherence_logs" ADD CONSTRAINT "nutrition_adherence_logs_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patient_profiles"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_adherence_logs" ADD CONSTRAINT "nutrition_adherence_logs_patient_food_id_fkey" FOREIGN KEY ("patient_food_id") REFERENCES "patient_nutrition_catalogs"("patient_food_id") ON DELETE CASCADE ON UPDATE CASCADE;
