# Property Management System

A property management system for landlords and caretakers to manage properties, tenants, rent, and payments.

## Features

- Property management
- Tenant management
- Rent tracking
- Payment management

## Authentication

The PMS is an internal system used only by the landlord and authorized caretakers.

### Authentication States

- Logged out — the user is shown the login page.
- Checking authentication — the system checks whether an existing session is valid.
- Authenticated — the user can access the PMS dashboard.

### Users

- Landlord — has full access to the system.
- Caretaker — has access according to assigned permissions.

Tenants are stored as records in the PMS but do not log into the system.

## Planned Authentication Features

- Login
- Logout
- Persistent authentication session
- Protected dashboard
- Role-based authorization
