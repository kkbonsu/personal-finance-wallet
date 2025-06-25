# Personal Finance Wallet

## Overview

This is a comprehensive personal finance wallet application that consolidates a user's entire financial life into one app. It's a self-custodial wallet built with modern web technologies, supporting Bitcoin (Lightning Network), USDT, and STRK (Starknet) transactions. The application aims to provide users with opportunities to lend, borrow, and invest in the future of decentralized finance.

## System Architecture

The application follows a full-stack architecture with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API for global state (Theme, Settings, Auth, Wallet SDK)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions

## Key Components

### Database Schema
The application uses a relational database with the following main entities:
- **Users**: Basic user authentication and management
- **Wallets**: Multi-currency wallet support (Bitcoin, Lightning, STRK)
- **Transactions**: Complete transaction history with status tracking
- **Investment Positions**: Tracking of investment opportunities and yields

### Authentication System
- Passcode-based authentication with biometric support
- Auto-lock functionality for security
- Session-based authentication with PostgreSQL storage

### Wallet Integration
- **Spark SDK**: Bitcoin Lightning Network integration
- **Starknet.js**: Starknet blockchain integration
- **Multi-network Support**: Bitcoin (Legacy, SegWit, Taproot), Lightning, USDT (Tron), Starknet
- **External Integration API**: Allows other applications to integrate with the wallet

### User Interface
- **Mobile-first Design**: Optimized for mobile devices
- **Dark Mode Support**: Complete theme switching
- **Multi-language Support**: Internationalization ready
- **Multi-currency Display**: Support for various fiat currencies and cryptocurrencies

## Data Flow

1. **User Authentication**: Users authenticate using passcode or biometrics
2. **Wallet Operations**: Create wallets, send/receive transactions across different networks
3. **Investment Integration**: Users can deposit funds into investment protocols for yield generation
4. **Transaction Tracking**: All operations are recorded with complete audit trails
5. **Portfolio Overview**: Real-time portfolio valuation and performance tracking

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **express**: Web application framework
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type safety
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Integration SDKs
- **Spark SDK** (planned): Bitcoin Lightning Network operations
- **Starknet.js** (planned): Starknet blockchain interactions

## Deployment Strategy

The application is configured for deployment on Replit with autoscaling capabilities:

- **Development**: `npm run dev` - Runs with Vite dev server and hot reloading
- **Production Build**: `npm run build` - Builds client assets and bundles server code
- **Production Start**: `npm run start` - Runs the production server
- **Database**: Uses Neon PostgreSQL with connection pooling
- **Static Assets**: Served from `/dist/public` in production
- **Port Configuration**: Configured for port 5000 internally, mapped to port 80 externally

The deployment uses a hybrid approach where Vite handles client-side assets in development, while Express serves both API routes and static files in production.

## Recent Changes

- June 25, 2025: Implemented Spark SDK integration following https://docs.spark.money/wallet/developer-guide/create-first-wallet
  - Removed incorrect Lightspark SDK packages due to React Native dependency conflicts
  - Created SparkWalletSDK class following Spark SDK patterns for Bitcoin and Lightning operations
  - Implemented proper Bitcoin derivation with Legacy (m/44'), SegWit (m/84'), and Taproot (m/86') paths
  - Implemented Lightning Network derivation with separate path (m/45')
  - Added BOLT11 invoice generation and parsing for Lightning transactions
  - Integrated real @scure/bip32, @scure/bip39, @noble/hashes cryptographic libraries
  - Completely removed all USDT functionality from the entire application
  - Converted modal-based flows to dedicated pages: /send, /receive, /swap, /buy
  - Implemented standard navigation flows for better user experience
  - Updated QuickActions component to use page navigation instead of modals
  - Removed vault functionality and all vault-related features
  - Renamed DeFi to Invest throughout the application for better branding
  - Updated navigation to remove vault tab and consolidate to 4 main tabs
  - Maintained separate Bitcoin and Lightning account management as per Spark architecture

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.