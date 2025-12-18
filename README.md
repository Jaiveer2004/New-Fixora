# Fixora - Service Marketplace

**Tagline:** Smart Services, Simplified.

---

## 🔹 Project Overview

Fixora is a full-stack, on-demand service marketplace inspired by Urban Company. It connects customers seeking home and professional services with skilled service partners. The platform is designed with a modern tech stack and includes AI-powered features for an enhanced user experience.

The application is composed of three main parts:
1.  **Customer Platform:** Allows users to discover, book, and pay for services.
2.  **Partner Platform:** Enables service professionals to manage their profiles, list services, and track jobs.
3.  **Admin Panel:** A dashboard for administrators to manage the entire marketplace.

---

## ✨ Key Features (MVP & Phase 2)

* **User Authentication:** Secure user registration and login with JWT.
* **Partner Onboarding:** A seamless flow for users to register as service partners.
* **Service Management:** Partners can create, and view their service offerings.
* **Service Discovery:** Customers can browse a grid of all available services.
* **End-to-End Booking Flow:** A complete user journey from viewing a service detail page to booking and payment confirmation.
* **Payment Integration:** Secure payments handled by Razorpay with backend signature verification.
* **AI Chatbot:** A Gemini-powered assistant to help users discover services.
* **Review & Rating System:** Customers can review completed bookings, and partner ratings are automatically updated.

---

## 🚀 Tech Stack

This project uses the MERN stack with Next.js for the frontend.

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
* **Backend:** Node.js 20, Express 5
* **Database:** MongoDB with Mongoose
* **Authentication:** JWT (JSON Web Tokens)
* **Payments:** Razorpay
* **AI:** Google Gemini API
* **Real-time (Phase 2):** Socket.IO

---

## 📂 Project Structure

The project is organized into two main directories: `fixora-backend` and `fixora-frontend`.

### Backend (`fixora-backend`)
* `/src/config`: Database connection and environment variables.
* `/src/controllers`: Contains the business logic for handling requests.
* `/src/middlewares`: Custom middleware for authentication and error handling.
* `/src/models`: Mongoose schemas for all database collections.
* `/src/routes`: API route definitions.
* `server.js`: The main entry point for the backend server.

### Frontend (`fixora-frontend`)
* `/src/app`: Core routing using the Next.js App Router.
* `/src/components`: Reusable React components, organized by feature (`auth`, `chat`, `partner`) and UI (`ui`).
* `/src/context`: Global state management, currently for Authentication.
* `/src/lib`: Utility functions and the configured `axios` API client.

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v20 or higher)
* npm
* MongoDB instance (local or Atlas)
* API keys for Razorpay and Google Gemini

### Backend Setup
1.  Navigate to the `fixora-backend` directory.
2.  Run `npm install`.
3.  Create a `.env` file and add the following variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    RAZORPAY_KEY_ID=your_razorpay_test_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
    GEMINI_API_KEY=your_gemini_api_key
    ```
4.  Run `npm run dev` to start the server.

### Frontend Setup
1.  Navigate to the `fixora-frontend` directory.
2.  Run `npm install`.
3.  Create a `.env.local` file and add the following variables:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000/api
    NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key_id
    ```
4.  Run `npm run dev` to start the frontend application.