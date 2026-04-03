# Admin Actions Rules

## Purpose

This document defines how admin-only actions should be organized and used in the project.

## Structure

- `app/actions/admin/*` contains only admin entrypoints.
- `app/actions/*` outside `admin` contains base or public business logic.
- Admin actions should be split into small readable files by responsibility:
  - `queries.ts`
  - `mutations.ts`
  - `cache-tags.ts`
  - local `*.types.ts` when UI needs shared types

## Access Control

- Every admin action must enforce access through `requireAdminSession()`.
- `proxy.ts` is only a lightweight session gate and must not be treated as the real authorization layer.
- Real authorization must happen in server actions, server pages, layouts, or routes.

## Naming

- Public read functions keep neutral names:
  - `getAllProducts`
  - `getProductById`
- Admin read functions should gradually use the `Admin` suffix:
  - `getAllProductsAdmin`
  - `getOrderByIdAdmin`
- Admin mutations that exist only in admin scope may keep domain names without `Admin` suffix if they live only inside `app/actions/admin/*`.

## Import Rules

- Admin UI must import admin actions only from `app/actions/admin/*`.
- Public UI must never import from `app/actions/admin/*`.
- Do not import UI-facing types from `"use server"` action modules.
- If UI needs shared types, move them into:
  - local `*.types.ts`
  - shared domain types
  - schema-derived types

## Design Guidelines

- Prefer thin admin wrappers over direct re-exports.
- Base business logic can stay in public/domain action files.
- Admin wrappers are responsible for:
  - access control
  - admin-only policy
  - admin-specific cache invalidation or orchestration

## Migration Policy

- Do not rename everything at once.
- Follow these rules for all new admin actions.
- Gradually rename and reshape old admin reads when touching related code.
