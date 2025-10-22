# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Sign up for activities

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity                                             |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.

## Frontend / Static Preview

The project includes a small static frontend in `src/static` demonstrating the activities UI. After running the backend (see above), open http://localhost:8000 to view the redesigned kid-friendly page. Files changed during the redesign:

- `src/static/index.html` — new hero, activity cards, and layout
- `src/static/styles.css` — colorful, responsive styles for kids
- `src/static/app.js` — renders cartoon SVGs, enroll buttons, and improved interactivity

If you prefer a quick preview without the backend, you can serve `src/static` using Python's simple HTTP server (from within the `src/static` directory):

```bash
python -m http.server 8001
# then open http://localhost:8001 in your browser
```
