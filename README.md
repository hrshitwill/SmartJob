# SmartJob (CredX Match) - Smart Job Matching Dashboard

SmartJob (CredX Match) is a premium, full-stack job board and hiring platform. It connects student candidates with custom job postings using a dedicated **Smart Matching Engine** that evaluates skills overlap, GPA thresholds, and work authorization compatibility in real time.

---

## 🚀 Key Features

### 👨‍🎓 Student Portal
- **Secure Authentication**: Register and log in using robust JSON Web Token (JWT) state-less authorization.
- **Interactive Onboarding Wizard**: A step-by-step profile builder to capture GPA, preferred role, location, preferred work mode (remote/onsite/hybrid), skills, portfolio links, and certifications.
- **Interactive Dashboard**: Real-time widgets tracking profile completeness, overall application counts, and job recommendations.
- **Smart Job Search & Filtering**: Discover jobs filtering by work mode, location, and matching categories.
- **Detailed Match Analysis**: Drill down into any job to view a compatibility breakdown including:
  - Match score (percentage).
  - List of matching skills.
  - List of missing skills.
  - Dynamically generated learning roadmaps/guides (e.g., official Angular, Spring Boot, or MDN docs) to help bridge the skill gap.
- **Visual Application Tracker**: Track applied positions across a status pipeline (`Applied`, `Reviewing`, `Interviewing`, `Offered`, `Rejected`).

### 💼 Recruiter Portal
- **Candidate Application Tracking**: View details of all candidates applying for company roles.
- **Status Pipeline Management**: Update applicant status instantly (e.g., transition application from "Reviewing" to "Interviewing" or "Accepted").

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: [Angular 19.x](https://angular.dev/) (Standalone Components, Signals, Router, and forms validation)
- **Styling**: Custom CSS/SCSS with fully responsive layouts
- **Animations**: [GSAP (GreenSock Animation Platform)](https://gsap.com/) for fluid, premium transitions and micro-animations
- **Reactive Programming**: RxJS for event orchestration and API interactions

### Backend
- **Framework**: [Spring Boot 3.2.3](https://spring.io/projects/spring-boot) (Java 17)
- **Security**: Spring Security & JWT for secure session management
- **ORM & Database**: Spring Data JPA with an in-memory H2 Database
- **Validation**: Jakarta Bean Validation for robust request payloads

---

## 🧠 Smart Matching Engine Algorithm

The core compatibility algorithm parses applicant profiles against job criteria using a weighted grading system:

1. **Technical Skill Alignment (50% weight)**:
   - Measures the percentage of required job skills possessed by the student:
     $$\text{Skill Score} = \left( \frac{\text{Skills Match Count}}{\text{Total Required Skills}} \right) \times 50\%$$
2. **Academic Verification (30% weight)**:
   - Evaluates whether the candidate meets or exceeds the job's minimum GPA requirement:
     - Full $30\%$ awarded if candidate GPA $\ge$ Job threshold.
     - Pro-rated score if below threshold: $\left( \frac{\text{Student GPA}}{\text{Job Threshold}} \right) \times 30\%$.
3. **Work Authorization Verification (20% weight)**:
   - Checks compliance between applicant status and position sponsorship:
     - Full $20\%$ awarded if candidate is authorized or the job sponsors visas.
     - $0\%$ awarded if candidate needs sponsorship and the job does not sponsor.

*The overall compatibility score is clamped between a baseline of **35%** and a ceiling of **98%** to keep suggestions grounded and motivate candidates.*

---

## 📋 API Endpoint Reference

All backend endpoints are prefixed with `/api` and run on port `8080`.

| Category | Method | Endpoint | Request Payload / DTO | Access / Role | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/auth/register` | `RegisterRequestDTO` | Public | Create student/recruiter account |
| | `POST` | `/api/auth/login` | `AuthRequestDTO` | Public | Sign in and retrieve JWT token |
| | `GET` | `/api/auth/me` | *None* | Authenticated | Fetch current user info |
| **Student Profiles**| `GET` | `/api/students/me` | *None* | Student | Retrieve user profile details |
| | `PUT` | `/api/students/me` | `StudentProfileDTO` | Student | Create/update onboarding details |
| | `GET` | `/api/students/{id}` | *None* | Authenticated | View profile by database ID |
| | `GET` | `/api/students/me/profile-strength` | *None* | Student | Calculate completeness index |
| **Job Board** | `GET` | `/api/jobs` | *None* | Authenticated | Fetch all job listings |
| | `GET` | `/api/jobs/{id}` | *None* | Authenticated | Get detailed single job posting |
| | `POST` | `/api/jobs` | `JobDTO` | Recruiter | Post a new job opportunity |
| | `GET` | `/api/jobs/recommended` | *None* | Student | Get matching list sorted by score |
| | `GET` | `/api/jobs/{id}/match` | *None* | Student | Analyze candidate-job fit metrics |
| **Applications** | `POST` | `/api/applications` | `ApplicationRequestDTO` | Student | Submit application for a job |
| | `GET` | `/api/applications/me` | *None* | Student | Retrieve student's applications |
| | `GET` | `/api/recruiter/applications` | *None* | Recruiter | Retrieve all submissions |
| | `PATCH` | `/api/recruiter/applications/{id}/status` | `{"status": "..."}` | Recruiter | Update applicant review status |

---

## 📂 Project Structure

```bash
SmartJob/
├── backend/
│   ├── src/main/java/com/credx/match/
│   │   ├── config/          # SecurityConfig, DatabaseSeeder
│   │   ├── controller/      # Auth, Profile, Job, Application Controllers
│   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   ├── entity/          # JPA Entities (User, StudentProfile, Job, Application, Skill)
│   │   ├── repository/      # JPA Data repositories
│   │   └── service/         # Core business logic & MatchEngineService
│   └── src/main/resources/
│       └── application.yml  # H2 database & JWT app configuration
├── src/
│   └── app/
│       ├── core/            # Authentication guards, interceptors, and services
│       ├── features/        # Landing page, Auth, Dashboard, Jobs, Onboarding, Tracker
│       └── shared/          # Shared components (layouts, UI controls, navigation)
└── README.md                # Project documentation
```

---

## 🛠️ Local Setup & Getting Started

### 📋 Prerequisite
- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18.x or higher
- **npm**: Version 10.x or higher

### ⚙️ Step 1: Run the Backend (Spring Boot)
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Build and run using the Maven Wrapper:
   - **Windows Powershell**:
     ```powershell
     ./mvnw.cmd spring-boot:run
     ```
   - **macOS / Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```
3. The Spring Boot backend starts at `http://localhost:8080`.
4. To access the interactive H2 Database Console, open your browser to `http://localhost:8080/h2-console` and use:
   - **JDBC URL**: `jdbc:h2:mem:credxdb`
   - **User Name**: `sa`
   - **Password**: *[Keep Blank]*

### 💻 Step 2: Run the Frontend (Angular)
1. From the project root, install frontend packages:
   ```bash
   npm install
   ```
2. Launch the Angular CLI development server:
   ```bash
   npm start
   ```
3. Open `http://localhost:4200` in your web browser.

---

## 🔑 Demo Test Accounts

The backend automatically seeds two roles upon startup to speed up local verification:

### 🎓 Student User (Pre-populated Profile)
- **Email**: `student@credx.com`
- **Password**: `password`
- **Pre-populated Skills**: Angular, TypeScript, SCSS, RxJS, Java, Spring Boot, SQL

### 💼 Recruiter User
- **Email**: `recruiter@credx.com`
- **Password**: `password`