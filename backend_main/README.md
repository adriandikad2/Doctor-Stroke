# Doctor Stroke Backend (Node.js + Express + PostgreSQL)

This backend powers the Doctor Stroke platform. It exposes REST APIs for authentication, patient management, appointments, medication schedules, and the new feature set requested in the `Doctor Stroke_FeatureandModelFix` document (points e–g).

## Quick start

```bash
cd backend_main
npm install
cp .env.example .env    # Update JWT_SECRET if needed
npm run dev             # or npm start
```

The backend expects `DATABASE_URL`, `JWT_SECRET`, and optional `PORT` in `.env`.

## Database notes

* PostgreSQL (Neon connection string provided in `.env.example`).
* `src/config/migrations/2024-11-05-feature-e-g.sql` contains the SQL to create the new tables:
  * `prescriptions`, `medication_adherence_logs`, `medication_interactions`
  * `patient_progress_snapshots`
  * `nutrition_profiles`, `meal_logs`
* Apply the migration before running the API, e.g.:

```bash
psql "postgresql://neondb_owner:npg_3BvYlqajT0MG@ep-little-dew-a1ebcdzg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  -f src/config/migrations/2024-11-05-feature-e-g.sql
```

## Feature overview (points e–g)

### Medication & Prescription Management (`/api/prescriptions`)

| Endpoint | Description |
| --- | --- |
| `POST /` | Doctors/Admins create prescriptions (Prescription Entry). |
| `PUT /:prescriptionId` | Update dosage, schedule, instructions. |
| `PATCH /:prescriptionId/status` | Activate/deactivate prescriptions. |
| `GET /patient/:patientId` | List active (or all) prescriptions for a patient. |
| `POST /:prescriptionId/adherence` | Log adherence events (Adherence Tracking). |
| `GET /:prescriptionId/adherence?days=7` | Retrieve adherence summary. |
| `GET /:prescriptionId/reminders?days=3` | Compute upcoming smart reminders. |
| `POST /interactions/check` | Run interaction checks vs. active meds. |

All prescription routes require authentication and patient access checks.

### Progress Monitoring & Reporting (`/api/progress`)

| Endpoint | Description |
| --- | --- |
| `POST /` | Real-time progress snapshots (symptoms, mobility, vitals). |
| `GET /patient/:patientId` | Paginated snapshots (filter by date). |
| `GET /patient/:patientId/report` | Aggregated averages/trends for clinician reports. |
| `GET /patient/:patientId/alerts` | Predictive alerts (missed meds, low mobility, etc.). |

### Diet & Nutrition Management (`/api/nutrition`)

| Endpoint | Description |
| --- | --- |
| `PUT /patient/:patientId/profile` | Upsert personalized nutrition targets. |
| `GET /patient/:patientId/plan?days=7` | Generate low-salt/high-fiber diet plans. |
| `POST /patient/:patientId/meals` | Log meals, receive immediate feedback. |
| `GET /patient/:patientId/meals` | List logged meals (filter by date range). |
| `GET /patient/:patientId/profile` | Retrieve the saved nutrition profile. |

Each module enforces JWT auth plus `patient_care_team` linkage (caregivers, doctors, admins).
