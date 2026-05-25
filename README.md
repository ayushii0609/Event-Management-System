# EventSphere — Event Management System

A web application where admins can create and manage events, and students can browse and register for them. Built as a semester project for Web Technology.

---

## What You Can Do

- Sign up as an Admin or User
- Admins can add and delete events
- Viewer can register for any event
- Duplicate registrations are blocked automatically
- Seats are limited — no overbooking

---

## Tech Used

| Part     | Technology            |
|----------|-----------------------|
| Frontend | HTML, CSS, JavaScript |
| Backend  | Node.js + Express     |
| Database | MySQL                 |

---

## Folder Structure

```
event-management/
│
├── server.js                 ← starts the server
├── package.json              ← project dependencies
├── database.sql              ← run this to set up the database
│
├── config/
│   └── db.js                 ← database connection settings
│
├── routes/
│   ├── auth.js               ← login, signup, logout
│   ├── programmes.js         ← add, view, delete events
│   └── registrations.js      ← register and cancel registrations
│
└── public/
    ├── index.html            ← main page
    ├── login.html            ← login and signup page
    ├── css/style.css         ← styling
    └── js/app.js             ← frontend logic
```

---

## How to Run

1. Install Node.js from https://nodejs.org
2. Open MySQL and run `database.sql` to create the database
3. Open `config/db.js` and put your MySQL password
4. Open terminal in the project folder and run `npm install`
5. Then run `node server.js`
6. Open browser and go to `http://localhost:3000`

---

## API Endpoints

| Method | URL                          | What it does                 |
|--------|------------------------------|------------------------------|
| POST   | /api/auth/signup             | Create a new account         |
| POST   | /api/auth/login              | Login                        |
| POST   | /api/auth/logout             | Logout                       |
| GET    | /api/events                  | Get all events               |
| POST   | /api/events                  | Add a new event (admin only) |
| DELETE | /api/events/:id              | Delete an event (admin only) |
| GET    | /api/registrations/:event_id | Get attendees of an event    |
| POST   | /api/registrations           | Register for an event        |
| DELETE | /api/registrations/:id       | Cancel a registration        |

---

## Database Tables

### users

| Column     | Type         | Description                 |
|------------|--------------|-----------------------------|
| id         | INT (PK)     | Auto ID                     |
| name       | VARCHAR(100) | Full name                   |
| email      | VARCHAR(100) | Email (unique)              |
| password   | VARCHAR(255) | Encrypted password          |
| role       | ENUM         | Either 'admin' or 'student' |
| created_at | TIMESTAMP    | When account was created    |

### programmes

| Column      | Type         | Description               |
|-------------|--------------|---------------------------|
| id          | INT (PK)     | Auto ID                   |
| title       | VARCHAR(100) | Event name                |
| description | TEXT         | What the event is about   |
| location    | VARCHAR(150) | Where it is happening     |
| event_date  | DATE         | Date of event             |
| event_time  | TIME         | Time of event             |
| organizer   | VARCHAR(100) | Who is organizing         |
| max_seats   | INT          | Max allowed registrations |
| created_at  | TIMESTAMP    | When event was added      |

### registrations

| Column        | Type         | Description               |
|---------------|--------------|---------------------------|
| id            | INT (PK)     | Auto ID                   |
| event_id      | INT (FK)     | Links to programmes table |
| user_id       | INT (FK)     | Links to users table      |
| name          | VARCHAR(100) | Attendee name             |
| email         | VARCHAR(100) | Attendee email            |
| phone         | VARCHAR(15)  | Phone number              |
| registered_at | TIMESTAMP    | When they registered      |

---

## Key Concepts Covered

- REST API with GET, POST, DELETE methods
- Role based access control (Admin vs Student)
- Password encryption using bcrypt
- Session management to keep users logged in
- Foreign keys linking tables together
- Input validation on both frontend and backend
- JSON used for communication between frontend and backend
