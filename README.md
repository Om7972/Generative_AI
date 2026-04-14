# MediGuide AI 🩺 ✨

**MediGuide AI** is an advanced MERN-stack medical application utilizing Generative AI to provide state-of-the-art health insights, medication adherence tracking, and personalized risk analysis. Designed with an ultra-premium dynamic UI, it integrates with OpenAI, Groq (Llama 3.1), and Gemini to deliver highly reliable, AI-driven guidance via a graceful fallback framework.

---

## 🚀 Key Features

*   **Multi-Model AI Gateway:** A resilient `aiService` architecture prioritizing OpenAI -> Groq (`llama-3.1-8b-instant`) -> Google Gemini. Ensures 100% uptime through graceful degradation to Mock Data if all API quotas become exhausted.
*   **Comprehensive Health Risk Assessment:** Dynamically scores patient health (0-100) based on age, conditions, allergies, and complex interactions between concurrent prescriptions.
*   **Intelligent Missed Dose Recovery:** AI-driven specific advice to clinically manage missed medication doses (Skip, Adjust Next Dose, or Take Now).
*   **Digital Health Twin Simulation:** Predicts a patient's energy levels, side effects, and risks mapped over an entire 24-hour cycle.
*   **Medication Adherence Coach:** Observes patterns in user logs and outputs direct motivational coaching to rebuild habit streaks.
*   **Medical Report Scanner (OCR + AI):** Scans uploads of prescriptions or medical records, extracts structural schema data, and returns a simplistic translated `aiSummary`.
*   **Notification Engine:** Automated scheduling for UI alerts ensuring users consume upcoming doses and review their specific daily health summaries.
*   **Premium Web Aesthetic:** Constructed utilizing standard modern framework components, Framer Motion for complex micro-animations, styling utilities, and dynamic dashboards featuring interactive SVG heatmaps.

---

## 🛠 Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Axios.
*   **Backend:** Node.js, Express.js, Mongoose.
*   **Database:** MongoDB.
*   **AI Frameworks:** `@google/genai`, `openai` SDK mapped directly to OpenAI and Groq APIs.

---

## 🗄️ Database Setup

Ensure a local instance of MongoDB is running on `mongodb://localhost:27017/` prior to initialization (or supply an external cluster URI in the `.env` strings). The Mongoose models natively generate the following schemas:

1.  **Users:** Stores securely hashed (bcrypt) user credentials and JWT authenticators.
2.  **HealthProfiles:** Retains physical metric history: user age, weight, active conditions, and allergy limitations.
3.  **Medications:** Extrapolates prescription configurations, strict dosages, tracked missed doses, and specific timing requirements.
4.  **AIReports / AIResults:** Persists generated AI responses (calculated risk metrics, interactions, tips) ensuring analytical guidance acts as a historical log block for tracking overall trend progress.

---

## 🌐 API Endpoints

### 🔐 Authentication (`/api/auth`)
*   `POST /register` - Provision a new patient account.
*   `POST /login` - Verify credentials & generate Bearer token.

### 💊 Meds & User Profile (`/api/medications` | `/api/reminders`)
*   `GET /api/medications` - Retrieve all user's bound medications.
*   `POST /api/medications` - Add a new medication mapping.
*   `PUT /api/medications/:id` - Update current medication tracking parameters.
*   `DELETE /api/medications/:id` - Remove medication from the patient context.
*   `POST /api/reminders/send` - Transmit real-time patient reminders.

### 🧠 AI Gateway (`/api/ai/*`)
Requires a verified Bearer JWT Authorization token.
*   `POST /risk-score`: Computes health interactions resulting in a `safe|moderate|high|critical` categorization.
*   `POST /full-analysis`: Deep analysis evaluating specific interactions, schedule tracking limits, and lifestyle tips dependent on active `Medications`.
*   `POST /daily-summary`: Returns a short narrative brief factoring in missed doses and schedule optimization.
*   `POST /missed-dose`: Advises users based strictly on hours elapsed (`action`, `adjusted_timing`, warnings).
*   `POST /adherence-coach`: Assesses recent streak behavior to output customized coaching insight arrays.
*   `POST /mark-taken`: Increments active streaks natively within the tracking module.
*   `GET /history`: Dumps the historical timeline of saved AI logs allowing the UI to display progression tracking.

---

## 💻 Installation & Environment Setup

1. **Clone the repository into a local working directory.**

2. **Configure Node Backend:**
   ```bash
   cd server
   npm install
   ```

3. **Secure Environment Variables:**
   Initialize `.env` exclusively inside the `/server` directory utilizing the following variables:
   ```env
   # d:\Generative_AI\server\.env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/
   JWT_SECRET=super_secret_jwt_key_here
   
   # AI Service Keys
   OPENAI_API_KEY=your_openai_key
   GEMINI_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key
   
   # Transport/Mailer (For Notifications)
   SMTP_HOST=smtp.ethereal.email
   SMTP_USER=dummy_user@ethereal.email
   SMTP_PASS=dummy_pass
   ```

4. **Initialize Frontend Client Build:**
   ```bash
   cd ../client
   npm install
   ```

5. **Engage Application Stack:**
   From the `/server` baseline directory, boot the monolithic concurrent script:
   ```bash
   npm run dev
   ```
   **Express.js hooks immediately onto port 5000**, whilst the compiled **Vite.js client establishes itself on port `5173`**. Access the platform over `http://localhost:5173`.
