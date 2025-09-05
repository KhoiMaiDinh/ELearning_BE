# 🌟 NovaLearn - Feature Documentation

NovaLearn is an **e-learning platform** designed to connect **students**, **instructors**, in a seamless online learning ecosystem.  
This document provides a **comprehensive overview** of all the features supported by NovaLearn, categorized by user roles.

![Use Case Diagram](assets/usecase_diagram.png)

---

## 👤 User Roles

NovaLearn supports three primary user roles:

| **Role**       | **Description**                                                                              |
| -------------- | -------------------------------------------------------------------------------------------- |
| **Student**    | Learners who register, browse courses, purchase content, and track progress.                 |
| **Instructor** | Course creators who manage educational content, track analytics, and interact with students. |
| **Admin**      | Platform managers who oversee instructors, handle payouts, and manage violations.            |

---

## Core Features

### **1. Student Features**

Students can explore, purchase, and engage with courses while managing their learning experience.

| **Feature**                       | **Description**                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------- |
| **Sign Up / Sign In**             | Create a new account or log in using email, social login, or other credentials. |
| **Profile Management**            | Update personal information, change passwords, and manage preferences.          |
| **View Courses List**             | Browse available courses by categories, instructors, ratings, and price.        |
| **Purchase Course**               | Buy courses using integrated payment gateways.                                  |
| **View Lectures**                 | Access purchased courses and watch lectures seamlessly.                         |
| **Track Learning Progress**       | Monitor progress for each enrolled course with visual indicators.               |
| **Review Course**                 | Leave feedback and ratings to help other learners.                              |
| **Make Questions for Instructor** | Ask instructors questions directly related to lectures or topics.               |
| **Register to Become Instructor** | Apply to become an instructor by submitting required documents.                 |
| **Report Violation**              | Report inappropriate content, spam, or any platform violation.                  |

---

### **2. Instructor Features**

Instructors are responsible for **creating courses**, **managing content**, and **tracking analytics**.

| **Feature**                        | **Description**                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| **Create Course**                  | Build a new course with sections, lectures, and resources.                      |
| **Add / Edit Courses**             | Update course content, rearrange lectures, or modify pricing.                   |
| **Answer Questions from Students** | Engage with students by responding to their submitted queries.                  |
| **View Statistics**                | Get insights into student engagement, enrollments, and reviews.                 |
| **View Payout**                    | See total earnings, payment history, and upcoming payouts.                      |
| **Create Coupon**                  | Generate discount codes to promote courses.                                     |
| **Manage Coupons**                 | Update, delete, or track coupon performance.                                    |
| **View Course Analytics**          | Access detailed reports about student progress, completion rates, and feedback. |

---

### **3. Admin Features**

Admins have **full control** over platform management, ensuring smooth operations and compliance.

| **Feature**                    | **Description**                                                     |
| ------------------------------ | ------------------------------------------------------------------- |
| **Admin Sign In**              | Securely log in to access the admin dashboard.                      |
| **Approve Instructor Profile** | Review instructor registration requests and approve or reject them. |
| **Manage Course Categories**   | Create, update, or delete course categories.                        |
| **Manage Violation Reports**   | Handle reports submitted by students about inappropriate content.   |
| **Manage Instructor Payout**   | Approve, schedule, and process instructor payments.                 |

---

## Notification System (Cross-Role)

NovaLearn provides a **real-time notification system** available for **all user roles**:

| **Trigger**                     | **Recipient**       | **Example Notification**                                            |
| ------------------------------- | ------------------- | ------------------------------------------------------------------- |
| New course purchased            | Instructor, Student | "Your payment for 'React Mastery' has been confirmed."              |
| Question submitted by student   | Instructor          | "A student asked a question in your 'NodeJS Fundamentals' course."  |
| Question answered by instructor | Student             | "Your question has been answered by the instructor."                |
| New review posted               | Instructor          | "You received a 5-star review on 'Fullstack Development Bootcamp'." |
| Coupon published                | Student             | "New coupon available! Save 30% on selected courses."               |
| Violation report submitted      | Admin               | "A violation report has been filed for 'Digital Marketing Basics'." |
| Instructor application pending  | Admin               | "A new instructor profile is awaiting approval."                    |
| Payout processed                | Instructor          | "Your payout of $120.50 has been successfully processed."           |

**Implementation details:**

- **Real-time** using **WebSocket** (Socket.IO or NestJS Gateway)
- **Persistent storage** in the database for historical logs
- **Unread/read states** with bulk update options
- **Optional email and push notifications** for critical events

---

## Platform-Wide Features

### **1. Course Management**

- Comprehensive control over course creation, updates, and categorization.
- Flexible pricing and discount options.

### **2. Payment & Payout System**

- Secure course purchases via integrated payment gateways.
- Transparent instructor payout tracking and scheduling.

### **3. Analytics & Insights**

- Students: Track personal learning progress.
- Instructors: Access in-depth engagement statistics and financial reports.
- Admins: View global platform performance and user trends.

### **4. Violation & Compliance Management**

- Students can report violations.
- Admins handle reports to maintain a safe and high-quality learning environment.

---

## 🌟 Highlighted Features

NovaLearn offers two **standout features** that significantly enhance the learning experience:

### **1. Personalized Course Recommendation System**

- Uses **machine learning models** to suggest courses tailored to each student's preferences, learning history, and interactions.
- Continuously improves using **user behavior tracking** and **feedback analysis**.
- Helps students discover **relevant and trending courses** effortlessly.

### **2. Aspect-Based Sentiment Analysis on Lesson Comments**

- Analyzes student feedback on **specific aspects** of lectures such as:
  - **Content quality**
  - **Instructor performance**
  - **Practicality**
  - **Difficulty level**
- Provides instructors with **detailed sentiment insights** at a granular level.
- Enables **data-driven improvements** for courses and helps admins identify potential issues early.

---

## Future Enhancements

| **Feature**                | **Planned Improvements**                             |
| -------------------------- | ---------------------------------------------------- |
| **Gamification**           | Add badges, levels, and rewards for active learners. |
| **Live Classes**           | Enable real-time lectures with Q&A support.          |
| **Multi-language Support** | Localize platform content for global reach.          |

---
