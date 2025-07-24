# The Community

A modern social media application for sharing posts, images, and connecting with others. Built with the T3 Stack for a robust, type-safe, and scalable experience.

## Features

- **Social Posts**: Create and share posts with text and images
- **Image Upload**: Upload up to 4 images per post with preview functionality
- **User Authentication**: Secure sign-in and sign-up functionality with profile management
- **Interactive Posts**: Like, retweet, and comment on posts
- **Real-time Updates**: Optimistic UI updates for better user experience
- **Modern UI**: Beautiful, responsive design with dark mode support
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
- Database (SQLite for development, PostgreSQL for production)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd the-community
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

4. Configure your environment variables in `.env.local`:

```env
# Database
DATABASE_URL="file:./db.sqlite"
DATABASE_TOKEN="your-database-token"

# Authentication
BETTER_AUTH_SECRET="your-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"

# UploadThing (for image uploads)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
NEXT_PUBLIC_UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

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
│   ├── explore/           # Social media feed and post creation
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

## Features in Detail

### Image Upload

- Upload up to 4 images per post
- Drag and drop or click to upload
- Image preview with remove functionality
- Automatic image optimization and storage via UploadThing
- Responsive grid layout for multiple images

### Social Interactions

- Like posts with real-time count updates
- Retweet posts to share with your followers
- Comment on posts with threaded discussions
- Delete your own posts
- View post statistics (likes, retweets, comments)

### User Experience

- Optimistic UI updates for immediate feedback
- Loading states and error handling
- Responsive design for all devices
- Dark mode interface
- Real-time post updates

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
