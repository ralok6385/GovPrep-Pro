# 🚀 GovPrep Pro Deployment Guide

Follow these steps to deploy your application to the web!

---

## Part 1: Database (MongoDB Atlas)
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Cluster** (free tier).
3.  Go to **Database Access** -> Create a user (e.g., `admin`) and password.
4.  Go to **Network Access** -> Add IP address -> **Allow Access from Anywhere** (`0.0.0.0/0`).
5.  Go to **Connect** -> **Connect your application**.
6.  **Copy the connection string**. It looks like:
    `mongodb+srv://admin:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
    *(Replace `<password>` with your actual password!)*

---

## Part 2: Backend (Render)
1.  Push your latest code to **GitHub** (you just did this!).
2.  Log in to [Render.com](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository (`GovPrep-Pro`).
5.  **Settings**:
    *   **Name**: `govprep-backend`
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
6.  **Environment Variables** (Scroll down to "Advanced"):
    *   Add `MONGO_URI`: (Paste your MongoDB connection string from Part 1)
    *   Add `JWT_SECRET`: (Enter a random secret text, e.g., `mysecretkey123`)
    *   Add `NODE_ENV`: `production`
7.  Click **Create Web Service**.
8.  **Wait** for it to deploy. Once done, copy the **URL** (e.g., `https://govprep-backend.onrender.com`).

---

## Part 3: Frontend (Vercel)
1.  Log in to [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository (`GovPrep-Pro`).
4.  **Configure Project**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    *   Key: `NEXT_PUBLIC_API_URL`
    *   Value: (Paste your Render Backend URL from Part 2, add `/api` at the end)
        *   Example: `https://govprep-backend.onrender.com/api`
6.  Click **Deploy**.

---

## 🎉 Done!
Your app will be live!
*   **Frontend**: `https://govprep-pro.vercel.app`
*   **Backend**: `https://govprep-backend.onrender.com`
