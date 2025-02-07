# Wheel Spin Prize System - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Prize Distribution](#prize-distribution)
5. [Probability Calculations](#probability-calculations)
6. [API Integration Guide](#api-integration-guide)
7. [Security Considerations](#security-considerations)
8. [Simulation Results](#simulation-results)
9. [Administrative Dashboard](#administrative-dashboard)
10. [Deployment Information](#deployment-information)

## System Overview

The Wheel Spin Prize System is a web application that allows movie ticket holders to spin a virtual wheel for a chance to win prizes. The system is designed to handle up to 256,000 spins with carefully distributed prize allocations across different ranges.

### Key Features
- Ticket validation and verification
- Virtual wheel spin mechanism
- Prize distribution system
- Administrative dashboard
- Real-time statistics tracking

## Architecture

### Technology Stack
- Frontend: Next.js 
- Backend: Node.js with Next.js API Routes
- Database: PostgreSQL with Prisma ORM
- UI Components: React
- Animation: Framer Motion
- Styling: TailwindCSS

### System Components
1. **Ticket Verification System**
   - Validates ticket codes
   - Prevents duplicate spins
   - Manages ticket state

2. **Prize Distribution Engine**
   - Manages prize inventory
   - Calculates win probabilities
   - Tracks prize distribution

3. **Administrative Interface**
   - Real-time monitoring
   - Statistics dashboard
   - Winner tracking

## Database Schema

### Ticket Model
```prisma
model Ticket {
  id        String   @id @default(cuid())
  code      String   @unique
  hasSpun   Boolean  @default(false)
  spinResult String? 
  spinNumber Int?    
  isMillionContestant Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Prize Model
```prisma
model Prize {
  id          String   @id @default(cuid())
  name        String   
  totalCount  Int      
  remaining   Int      
  rangeStart  Int      
  rangeEnd    Int      
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### SpinCount Model
```prisma
model SpinCount {
  id          String   @id @default(cuid())
  totalSpins  Int      @default(0)
  millionContestants Int @default(0)
  rangeMillionCounts Json    
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Prize Distribution

### Range Breakdown
1. **Range 1-100**
   - 10 gifts + 4 million contestants
   - Prize mix: 2x ₦100,000, 2x ₦50,000, 2x ₦20,000, 2x Phone, 1x Artifact Hoodie, 1x Premiere Invite

2. **Range 101-1000**
   - 10 gifts + 2 million contestants
   - Same prize mix as Range 1-100

3. **Range 1001-2000**
   - 8 gifts + 2 million contestants
   - Prize mix: 2x ₦100,000, 2x ₦50,000, 2x ₦20,000, 1x Phone, 1x Artifact Hoodie

4. **Range 2001-5000**
   - 7 gifts + 2 million contestants
   - Prize mix: 2x ₦100,000, 2x ₦50,000, 1x ₦20,000, 1x Phone, 1x Artifact Hoodie

5. **Range 5001-10000**
   - 5 gifts + 2 million contestants
   - Prize mix: 1x each of ₦100,000, ₦50,000, ₦20,000, Phone, Artifact Hoodie

6. **Range 10001-50000**
   - 5 gifts + 2 million contestants
   - Same prize mix as Range 5001-10000

7. **Range 50001-256000**
   - 5 gifts + 2 million contestants
   - Same prize mix as Range 5001-10000

## Probability Calculations

### Million Contestant Selection
For each range, the probability of being selected as a million contestant is calculated as:

```javascript
millionProbability = (remainingContestants) / (remainingSpinsInRange)
```

where:
- remainingContestants = maxContestants - currentContestants
- remainingSpinsInRange = rangeEnd - currentSpinNumber + 1

### Prize Win Probability
For regular prizes, the probability is calculated as:

```javascript
regularPrizeProbability = totalRemainingPrizes / remainingSpinsInRange
```

### Dynamic Probability Adjustment
The system dynamically adjusts probabilities based on:
- Remaining spins in the range
- Remaining prizes
- Remaining million contestant slots
- Current position within the range

## API Integration Guide

### Base URL
```
https://wheelspin.vercel.app/api
```

### Authentication
None required for basic ticket verification. Admin endpoints require authentication.

### Endpoints

1. **Verify Ticket**
   ```http
   POST /api/verify-ticket
   Content-Type: application/json

   {
     "ticketCode": "STRING"
   }
   ```
   
   Response:
   ```json
   {
     "valid": true
   }
   ```
   or
   ```json
   {
     "error": "Invalid ticket code"
   }
   ```

2. **Spin Wheel**
   ```http
   POST /api/spin
   Content-Type: application/json

   {
     "ticketCode": "STRING"
   }
   ```

   Response:
   ```json
   {
     "prize": "STRING",
     "isMillionContestant": boolean,
     "spinNumber": number,
     "remainingSpins": number
   }
   ```

### Integration Steps

1. **Ticket Registration**
   - After tickets are purchased on your platform, register them with the wheel spin system:
   ```http
   POST /api/register-ticket
   Content-Type: application/json
   Authorization: Bearer YOUR_API_SECRET

   {
     "tickets": ["TICKET_CODE_1", "TICKET_CODE_2", ...]
   }
   ```

   Successful Response:
   ```json
   {
     "success": true,
     "message": "Successfully registered 2 tickets",
     "tickets": [
       {
         "code": "TICKET_CODE_1",
         "spinUrl": "https://wheelspin.vercel.app/?ticket=TICKET_CODE_1"
       },
       {
         "code": "TICKET_CODE_2",
         "spinUrl": "https://wheelspin.vercel.app/?ticket=TICKET_CODE_2"
       }
     ]
   }
   ```

   Error Response:
   ```json
   {
     "error": "Error message",
     "duplicates": ["TICKET_CODE_1"]  // Only for duplicate ticket errors
   }
   ```

2. **Redirect Flow**
   - After successful ticket purchase, redirect users to:
   ```
   https://wheelspin.vercel.app/?ticket=TICKET_CODE
   ```
   - The system will automatically validate the ticket and show the spin interface

### Error Handling
All API endpoints return standard HTTP status codes:
- 200: Success
- 400: Invalid request/Bad data
- 401: Unauthorized
- 403: Forbidden
- 500: Server error

Error responses include a descriptive message:
```json
{
  "error": "Detailed error message"
}
```

## Integration Setup

### Prerequisites
1. Request an API secret key from the wheel spin system 
2. Add the API secret to your environment variables
3. Configure your email system to include the spin URLs in purchase confirmation emails

### Integration Flow
1. When tickets are purchased on your platform:
   - Generate unique ticket codes according to your system's logic
   - Call the register-ticket API to register these codes with the wheel spin system
   - Include the returned spin URLs in your purchase confirmation emails
   - Store the ticket codes and spin URLs in your database if needed

2. User Experience Flow:
   - User purchases ticket(s) on your platform
   - User receives email with ticket details and spin URL(s)
   - User clicks spin URL
   - Wheel spin system validates ticket and allows spin if unused

### Example Integration Code

```javascript
async function registerWheelSpinTickets(ticketCodes) {
  try {
    const response = await fetch('https://wheelspin.vercel.app/api/register-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHEELSPIN_API_SECRET}`
      },
      body: JSON.stringify({
        tickets: ticketCodes
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error);
    }

    return data.tickets; // Array of {code, spinUrl}
  } catch (error) {
    console.error('Failed to register wheel spin tickets:', error);
    throw error;
  }
}

// Usage example
async function handleTicketPurchase(quantity) {
  // Generate ticket codes according to your logic
  const ticketCodes = generateTicketCodes(quantity);
  
  // Register tickets with wheel spin system
  const spinTickets = await registerWheelSpinTickets(ticketCodes);
  
  // Include spin URLs in purchase confirmation email
  await sendPurchaseConfirmationEmail(spinTickets);
}
```


## Simulation Results

The following simulation results demonstrate the system's prize distribution for the first 100 spins range(1-100):

```
=== Final Statistics ===

Total Spins: 100
Million Naira Contestants: 4 (Target: 4)
Regular Prizes Won: 14 (Target: 10)
Try Again Results: 86

Prize Breakdown:
Try Again           : 86
₦1,000,000          : 4
₦20,000             : 2
₦50,000             : 2
Phone               : 2
₦100,000            : 2
Premiere Invite     : 1
Artifact Hoodie     : 1
```

### Simulation Screenshots

![Simulation Screenshot 1](https://i.imgur.com/4MLyfS5.png)
*Figure 1: Prize Distribution Simulation Results*

![Simulation Screenshot 2](https://i.imgur.com/lfloAXF.png)

## Administrative Dashboard

The admin dashboard is available at `/admin-dash` and provides:
- Real-time spin statistics
- Prize distribution tracking
- Million contestant monitoring
- Remaining prize inventory
- Winner list

Access requires authentication with provided admin credentials.

API SECRET: `ZsM4bkKq52U_;G(*9!f:C}Laud$#[PDg`


ADMIN CREDENTIALS:{
    Username: `secretadmin`
    Password: `adminHere`
}

TEST CODES:{
    `TEST123`
    `DEMO456`
    `SPIN789`
    `BETA001`
    `BETA002`
    `BETA003`
    `BETA004`
    `BETA005`
    `BETA006`
    `BETA007`
    `BETA008`
    `BETA009`
    `BETA010`
}

## Deployment Information

### Current Deployment
- Production URL: https://wheelspin.vercel.app
- Platform: Vercel
- Database: PostgreSQL (Supabase)


### Support Contact
For technical support or integration assistance:
- Email: gukohgodwin@gmail.com
