# Paper Directory

A modern web application for browsing, contributing, and managing academic papers and research documents. Built with the T3 Stack for a robust, type-safe, and scalable experience.

## Features

- **Browse Papers**: Discover and explore academic papers with a modern, responsive interface
- **Contribute Content**: Upload and share your research papers with the community
- **User Authentication**: Secure sign-in and sign-up functionality with profile management
- **PDF Viewer**: Built-in PDF viewing capabilities for seamless document reading
- **Modern UI**: Beautiful, responsive design with dark/light mode support
- **Type Safety**: Full TypeScript integration for better development experience

## Tech Stack

This project is built with the [T3 Stack](https://create.t3.gg/) and includes:

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Drizzle ORM](https://orm.drizzle.team)** - Type-safe database toolkit
- **[Better-Auth](https://better-auth.org)** - Authentication for Next.js
- **[UploadThing](https://uploadthing.com)** - File upload solution
- **[Shadcn/ui](https://ui.shadcn.com)** - Re-usable UI components

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd paper-directory
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Set up the database:

```bash
bun run db:push
```

6. Start the development server:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (tRPC, auth, upload)
│   ├── browse/            # Paper browsing interface
│   ├── contribute/        # Paper contribution forms
│   ├── profile/           # User profile management
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── application/       # App-specific components
│   ├── marketing/         # Landing page components
│   └── ui/                # Shadcn/ui components
├── server/                # Server-side code
│   ├── api/               # tRPC routers and procedures
│   └── db/                # Database schema and configuration
└── lib/                   # Utility functions and configurations
```

## Development

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:push` - Push database schema changes
- `bun run db:studio` - Open Drizzle Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. - This means the code is completely open source, you can do whatever you want to do with it.
