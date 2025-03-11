# assessmentTask

## Log Processing Dashboard 🚀

A full-stack application that processes log files, extracts useful data, and displays real-time updates.

## 📌 Features

- ✅ Upload log files for processing
- ✅ Extracts error counts, unique IPs, and keyword occurrences
- ✅ Uses **BullMQ** for background job processing
- ✅ **WebSockets** for real-time updates
- ✅ **Rate limiting** to prevent API abuse
- ✅ **Supabase** for storing processed log data

---

## 🔧 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.x)
- [Redis](https://redis.io/) (for BullMQ)
- [Supabase](https://supabase.com/) account (for database)

---

## 🚀 Setup & Running Instructions

### 1️⃣ **Clone the Repository**

```sh
git clone https://github.com/zilmarij/assessmentTask.git
cd assessmentTask

```

### 2️⃣ **Install Dependencies at backend**

```sh
cd test-next
npm install
```

### 3️⃣ **Run the Node Server, BullMQ Workers, and Initialize WebSockets**

```sh
npm run dev
node ./workers/worker.js
```

### 4️⃣ **Install Dependencies at frontend**

```sh
cd log-dashboard-fe
npm install
```

### 5️⃣ **Run the Frontend**

```sh
npm run dev
```

## Upload the sample.log file to test the app

---
