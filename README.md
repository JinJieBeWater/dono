<div align="center">
  <h1>Dono</h1>

  <p>A local-first novel writing application built with modern web technologies</p>

<a href="https://github.com/JinJieBeWater/dono"><img alt="GitHub stars" src="https://img.shields.io/github/stars/JinJieBeWater/dono?style=for-the-badge&logo=GitHub&labelColor=000000"></a>
<a href="https://github.com/JinJieBeWater/dono"><img alt="GitHub issues" src="https://img.shields.io/github/issues/JinJieBeWater/dono?style=for-the-badge&logo=GitHub&labelColor=000000"></a>

</div>

## Features

- 🖥️ **Local-First** - Powered by LiveStore, all data is stored locally in the browser first
- 📝 **Real-time Editing** - Instant response without waiting for network
- 🔄 **Auto Sync** - Automatically syncs to Cloudflare Durable Objects
- 🌐 **Cross-Device** - Continue writing on any device after logging in
- 💾 **Offline Support** - Works perfectly without internet connection

## Tech Stack

- **LiveStore**
- **TanStack Router**
- **shadcn/ui**
- **TailwindCSS**
- **Hono**
- **oRPC**
- **Cloudflare Workers**
- **Durable Objects**
- **Drizzle**
- **Better-Auth**
- **PWA**

## Getting Started

```bash
# Clone the repository
git clone https://github.com/JinJieBeWater/dono.git

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Todos

- [x] Implement user login with better-auth, each user gets a `UserStore` after logging in
- [x] Use better-auth for authentication on sync backend and implement store access control
- [x] Add rich text editing functionality, introduce Yjs to implement CRDT data synchronization
- [ ] Explore ways to pull down the content of all chapters of a novelStore for offline use
- [ ] Current data is soft-deleted, accumulating infinitely in DO, need to implement real data deletion to free storage space
