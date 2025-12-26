# Training Management System (TMS)

A web application for managing training courses, trainers, learners, and enrollments.

## Features

- **Formations Management**: CRUD operations for training courses with image uploads
- **Formateurs Management**: CRUD operations for trainers with photo uploads
- **Apprenants Management**: CRUD operations for learners with photo uploads
- **Inscriptions Management**: Enrollment management with validation rules

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **API Client**: Axios (via Fetch API)
- **File Upload**: Multer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tms
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```
   MONGO_URI=mongodb://localhost:27017/tms
   PORT=5000
   ```

4. Start MongoDB service

5. Start the backend server:
   ```bash
   npm start
   ```

6. Open `index.html` in your browser

## API Endpoints

### Formations
- `GET /api/formations` - Get all formations
- `GET /api/formations/:id` - Get formation by ID
- `POST /api/formations` - Create new formation (with image upload)
- `PUT /api/formations/:id` - Update formation
- `DELETE /api/formations/:id` - Delete formation

### Formateurs
- `GET /api/formateurs` - Get all formateurs
- `GET /api/formateurs/:id` - Get formateur by ID
- `POST /api/formateurs` - Create new formateur (with photo upload)
- `PUT /api/formateurs/:id` - Update formateur
- `DELETE /api/formateurs/:id` - Delete formateur

### Apprenants
- `GET /api/apprenants` - Get all apprenants
- `GET /api/apprenants/:id` - Get apprenant by ID
- `POST /api/apprenants` - Create new apprenant (with photo upload)
- `PUT /api/apprenants/:id` - Update apprenant
- `DELETE /api/apprenants/:id` - Delete apprenant

### Inscriptions
- `GET /api/inscriptions` - Get all inscriptions
- `GET /api/inscriptions/:id` - Get inscription by ID
- `POST /api/inscriptions` - Create new inscription
- `DELETE /api/inscriptions/:id` - Delete inscription

## Business Rules

- One trainer per training course
- Learners can enroll in multiple courses
- No duplicate enrollments for the same learner-course pair
- Enrollment capacity limits enforced
- Image uploads limited to JPG, JPEG, PNG (max 2MB)

## Project Structure

```
tms/
├── index.html
├── frontend/
│   ├── styles.css
│   └── app.js
└── backend/
    ├── server.js
    ├── package.json
    ├── models/
    │   ├── Formation.js
    │   ├── Formateur.js
    │   ├── Apprenant.js
    │   └── Inscription.js
    ├── routes/
    │   ├── formations.js
    │   ├── formateurs.js
    │   ├── apprenants.js
    │   └── inscriptions.js
    └── uploads/
```

## Usage

1. Open the application in your browser
2. Navigate between sections using the top menu
3. Add, edit, or delete records using the provided forms
4. Upload images for formations, trainers, and learners
5. Manage enrollments with built-in validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.
