# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**6CAT Booking CRM** — a tour booking CRM system for travel businesses. Manages customers, bookings, payments, trip operations, and reporting in one platform.

## Development Philosophy

**UX/UI first, functionality second.** The system must look and feel like a premium SaaS product (think Notion + Stripe + HubSpot) before features are fully wired up. Design-led development: UI must be polished before backend logic is connected.

## Development Phases

1. **Planning** — Define user personas (Admin, Sales, Operations, Customer), core booking workflow, MVP feature priority
2. **UX Structure** — Sitemap, user flows, wireframes for all MVP screens
3. **UI Design + Design System** — Moodboard, component library, interactive prototypes
4. **Build Features** — Develop module-by-module using only Design System components; UI must be pixel-perfect before adding logic
5. **Polish + Scale** — Micro-interactions, responsive optimization, reports, automation

## Core Modules

- **Customer CRM** — Customer profiles, booking history, lead tracking, segmentation
- **Tour Booking Management** — Tour packages, booking + quota system, status workflow
- **Payments & Billing** — Deposits/full payments, receipts/invoices, payment tracking
- **Trip Operations** — Itineraries, guide/vehicle/staff assignment, pre-trip notifications
- **Dashboard & Reports** — Sales figures, booking summaries, popular package analytics

## MVP Screens

Dashboard, Customer List + Profile, Booking Management, Tour Packages, Payments, Trip Schedule

## Design System

### Colors
- **Primary:** Midnight Blue (brand/CRM tone)
- **Accent:** Cat Orange (highlights, CTAs)
- **Neutral:** Soft Gray backgrounds, Pure White cards
- **Semantic:** Green (success), Amber (warning), Red (error), Blue (info)

### Typography
- **Fonts:** Inter (headings/body), Prompt (Thai language support)
- **Weights:** SemiBold headings, Regular body, Medium dashboard numbers

### Component Standards
- **Buttons:** Solid primary / Outline secondary, 14-16px radius, 44-48px height
- **Cards:** White bg, soft shadow, 20-24px padding, 16-20px radius
- **Inputs:** 44-48px height, visible focus ring, light gray placeholder
- **Tables:** Generous row spacing, hover highlight, minimal gridlines

### Layout
- 12-column grid for dashboard
- Card-based sections
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 px

### UX Rules
- Any task completable in 2-3 clicks max
- No cluttered screens
- Everything must feel systematic and organized

## User Roles

| Role | Description |
|------|-------------|
| Admin | Full system access, configuration |
| Sales Team | Customer management, booking creation |
| Operation Team | Trip scheduling, resource assignment |
| Customer | (Optional) Self-service booking view |

## Core Workflow

Customer inquiry → Tour booking → Payment (deposit/full) → Trip preparation → Post-trip follow-up
