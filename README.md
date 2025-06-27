<h1 align="center">🌄 Explore Jharkhand</h1>

<p align="center"><strong>Discover. Explore. Experience Jharkhand with our full-stack tourism platform.</strong></p>

<p align="center">
  <a href="https://explore-jharkhand.onrender.com">
    <img src="https://img.shields.io/badge/Live%20Demo-🌐%20Visit-green?style=for-the-badge" alt="Live Demo"/>
  </a>
  &nbsp;
  <a href="https://drive.google.com/file/d/1UIPCNYIaWq6Zp9ZXiC4S9zwDn44tBRkt/view?usp=drivesdk">
    <img src="https://img.shields.io/badge/Download%20APK-📱%20Android-blue?style=for-the-badge" alt="APK Download"/>
  </a>
</p>

---

## 🖼️ UI Previews

<p align="center"><i>Interactive snapshots from Explore Jharkhand dashboard,</i></p>

<table>
  <tr>
    <td align="center" width="33.33%">
      <img src="https://github.com/user-attachments/assets/21d43ac1-a32d-4e9b-9354-c78323f6cdac" width="95%" height="180px" />
    </td>
    <td align="center" width="33.33%">
      <img src="https://github.com/user-attachments/assets/3fee609d-830c-4d77-a3da-4c067518072b" width="95%" height="180px" />
    </td>
    <td align="center" width="33.33%">
      <img src="https://github.com/user-attachments/assets/3d5dd5bc-d263-4eba-8ea1-e35d2c554918" width="95%" height="180px" />
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/efab0759-0e32-4ab9-9d0a-41ecc17f751d" width="95%" height="180px" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/15e5d5e5-2400-424f-8d93-2205ff9e1751" width="95%" height="180px" />
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/cb6e40f0-0680-435f-a7aa-c158f1b54621" width="95%" height="180px" />
    </td>
  </tr>
</table>

---

## 🚀 Features

- Explore curated tourist destinations 🏞️  
- Secure hotel booking system 🏨  
- Hire local certified guides 🧑‍💼  
- Role-based dashboards (Admin/Guide/Traveler)  
- Real-time chat via Socket.IO 💬  
- Authentication with bcrypt & sessions 🛡️  
- Fully responsive Android APK available 📱

---

## 💻 Technology Stack

| Layer         | Technologies                                     |
|---------------|--------------------------------------------------|
| **Frontend**  | HTML5, CSS3, JavaScript, Bootstrap, EJS          |
| **Backend**   | Node.js, Express.js                              |
| **Database**  | MongoDB Atlas                                    |
| **Auth**      | bcrypt, express-session                          |
| **APIs**      | Google Maps, Socket.IO                           |
| **Deployment**| Render (web), Google Drive (APK), Android studio |

---

## 📁 Folder Structure

```plaintext
explore-jharkhand/
├── backend/
│   ├── server.js
│   ├── models/
│   ├── routes/
│   └── controllers/
├── host/
│   └── frontend/
│       ├── index.html
│       ├── dashboard/
│       ├── assets/
│       └── auth/
├── assets
├── home.html
├── package.json
└── README.md
```

## 👨‍💻 Developer Info

| Field      | Details                        |
|------------|--------------------------------|
| **Name**   | Ankit Kumar                    |
| **Role**   | Fullstack Developer            |
| **Project**| B.Tech CSE Final Year Major Project |
| **Location**| Jharkhand, India              |
| **GitHub** | [github.com](https://github.com/villan7667) |
| **Email**  | noob766709@gmail.com  |

---

## 🔐 How to Log In / Log Out

### 👤 User Login

1. Go to the homepage: [Explore Jharkhand](https://explore-jharkhand.onrender.com)
2. Click on `Login` or go directly to `/auth/index.html`
3. Enter your **username** and **password**
   - If you're a new user, click **Sign Up** to register.
4. After logging in:
   - **Traveler** will be redirected to the explore dashboard
   - **Guide** or **Admin** will be redirected to their respective dashboards

### 🚪 Log Out Process

- Click on the **Logout** button at the top/right corner of any dashboard page.
- Your session will be destroyed, and you'll return to the login page.

> ✅ Note: All session data is securely handled using `express-session`.

---

## 🧩 How to Fully Install This Project (For Any User)

Here’s how **any new user** can run this project locally or on their system:

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/villan7667/Explore-Jharkhand.git
cd Explore-Jharkhand
cd backend
nodemon server.js
```
---
2️⃣ Install Node Modules
      npm install
3️⃣ Setup MongoDB
    Create a free MongoDB Atlas account
    Set up a cluster and database
    Copy the connection URI
    In backend/server.js, paste the URI: mongoose.connect("your-mongodb-uri", {useNewUrlParser: true,
    useUnifiedTopology: true,});



---



