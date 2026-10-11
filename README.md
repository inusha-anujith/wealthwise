# WealthWise — Enterprise Personal Wealth Management System

![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015%20(App%20Router)-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript)
![Spring Boot 3](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen?style=for-the-badge&logo=springboot)
![Spring Security](https://img.shields.io/badge/Security-Spring%20Security%206%20(JWT)-green?style=for-the-badge&logo=springsecurity)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

WealthWise is an enterprise full-stack wealth engine designed to unify multi-category liquid cash flows, equity holdings (Colombo Stock Exchange), and institutional fixed deposit reserves into an isolated, zero-drift financial ledger.

---

## 📸 System Previews

### Financial Command Center (Executive Summary)
![Financial Command Center](screenshots/dashboard.png)

### Cash Flow Management (Liquid Ledger)
![Cash Flow Management](screenshots/cash-flow.png)

### Stock Market Simulator & Fixed Deposit Reserves
![Investments & Fixed Deposits](screenshots/investments.png)

---

## 🚀 Key Architectural Features

- **Stateless JWT Security & Identity Enforcement**: Cryptographic token validation via Spring Security filter chains. Controllers enforce ownership server-side using `@AuthenticationPrincipal`, guaranteeing tenant isolation and eliminating Insecure Direct Object Reference (IDOR) vulnerabilities.
- **Automated Dual-Ledger Cascading**:
  - Equity purchases automatically record a corresponding expense debit in the cash flow ledger.
  - Dividend declarations automatically credit an authenticated income transaction to liquid cash reserves with atomic database consistency.
- **Zero-Drift Consolidated Net Worth**: Non-blocking parallel data fetching (`Promise.all`) on Next.js Server Components delivers real-time asset allocation metrics and net worth calculations without client-side drift.
- **Enterprise Dark UI System**: Built with Tailwind CSS, utilizing glassmorphic command ribbons, real-time telemetry pills, and accessible form validations.

---

## 🛠️ Tech Stack & System Architecture

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript
- **State & Bridge**: React Context API (`AuthContext`), Browser Cookie Bridge
- **Styling**: Tailwind CSS (Enterprise Dark Palette)

### Backend
- **Framework**: Spring Boot 3
- **Security**: Spring Security 6, JJWT (HMAC-SHA256)
- **ORM & Database**: Hibernate / Spring Data JPA, PostgreSQL
- **Validation**: Jakarta Bean Validation (JSR-380)

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- Node.js 18+ & npm
- Java JDK 17 or 21
- PostgreSQL running locally on port `5432` with a database named `wealthwise`

---

### 1. Database Configuration
In `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/wealthwise
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update