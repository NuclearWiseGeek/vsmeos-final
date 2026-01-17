This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 🏗️ VSME OS - Institutional ESG Platform

This repository hosts the source code for **VSME OS**, a compliant, institutional-grade Carbon Footprint Calculation Platform tailored for French SMEs.

## 📂 Project Structure & File Guide

This document outlines the purpose of every file in the VSME OS repository. Use this as a reference when planning upgrades or debugging.

### 1. The "Brain" (Logic & State)
*These files control how the app thinks, calculates, and remembers data.*

* **`app/utils/calculations.ts`**
  * **Purpose:** The core calculation engine. Contains the **ADEME Emission Factors** database and the logic to convert user inputs (liters, kWh) into Carbon Footprints (kgCO2e).
  * **When to modify:** Only if you need to update emission factors (e.g., next year's ADEME update) or add a new fuel type.
* **`app/context/ESGContext.tsx`**
  * **Purpose:** The "Short-term Memory" of the app. It holds the user's data (Company Name, Scope 1 inputs, etc.) while they navigate between pages. It also handles the "Auto-Save" logic.
  * **When to modify:** If you add a new input field (e.g., "Water Usage"), you must initialize it here first so the app doesn't crash.

### 2. The "Face" (UI Components)
*These are reusable building blocks used across the application.*

* **`app/components/ui/Input.tsx`**
  * **Purpose:** The custom "Apple-Style" number input box. It handles the logic for switching between "Edit Mode" (raw numbers) and "View Mode" (formatted with commas).
  * **When to modify:** If you want to change the border colors, font size, or input behavior globally.
* **`app/components/ui/SampleReportModal.tsx`**
  * **Purpose:** The "Sneak Peek" popup on the landing page. It shows the blurred preview of the report to build trust.
  * **When to modify:** If you want to change the text in the "Trust Card" or the blurred layout preview.
* **`app/components/CarbonReportPDF.tsx`**
  * **Purpose:** The PDF Generator. This code draws the A4 paper document that users download. It is **not** a website; it is a document definition.
  * **When to modify:** If you need to change the logo, legal disclaimer text, or the layout of the final PDF report.

### 3. The "Pages" (Routes & Navigation)
*These determine what the user sees at each URL.*

#### **Public Area**
* **`app/page.tsx`**: The Landing Page (Hero Section, Value Prop, Footer).
* **`app/layout.tsx`**: The Root Layout (contains global fonts and metadata).

#### **Dashboard Area (Protected)**
* **`app/dashboard/layout.tsx`**: The Dashboard Wrapper (Top Nav, Mobile Padding).
* **`app/dashboard/hub/page.tsx`**: The "Command Center" grid.
* **`app/dashboard/scope1/page.tsx`**: Direct Emissions input page.
* **`app/dashboard/scope2/page.tsx`**: Indirect Energy input page.
* **`app/dashboard/scope3/page.tsx`**: Business Travel input page.
* **`app/dashboard/results/page.tsx`**: Analytics & PDF Download page.

#### **Authentication (Clerk)**
* **`app/sign-in/[[...sign-in]]/page.tsx`**: Login Page.
* **`app/sign-up/[[...sign-up]]/page.tsx`**: Registration Page.

### 4. Configuration & Setup
*Do not touch these unless you are changing the tech stack.*

* **`middleware.ts`**: Protects the dashboard (Security).
* **`package.json`**: Library dependencies.
* **`.env.local`**: API Keys (Secret).