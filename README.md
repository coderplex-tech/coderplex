# coderplexDevCommunity()
This is the source code for the [coderplexDevCommunity](https://coderplex.dev) platform - a professional network for software developers.

## Tech Stack
- Frontend: React + Vite
- Authentication/Database/Backend: Supabase
  - Also has a bucket named `avatars` to save the profile pictures
  - The delete users function for Supabase cannot be run on client side, so I had to create a Serverless function named `delete-user` that is present in the same repo, that takes care of user self account deletion.
- Deployed on Cloudflare Pages

## Getting Started

### Prerequisites
- npm

### Local Development
1. Clone the repo:
```
git clone https://github.com/coderplex-tech/coderplex.git
```

2. Install dependencies:
```
cd coderplex
npm install
```

3. Configure environment variables:
   - Create a file names `.env.local` in the root of the project folder
   - We need 2 environment variables, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to be configured. Use the URL and Key that connect to the development database.
     
     ```
     VITE_SUPABASE_URL=<URL>
     VITE_SUPABASE_ANON_KEY=<KEY>
     ```
   - Save
     
4. Start the local development server:
```
npm run dev
```

### Contributing
Please create a new branch with a relevant name off of the `develop` branch in order to contribute.

### Development Server
- We also have a development server that is live at https://develop.coderplex.dev/
- New merges to the develop branch trigger a new deployment of this server through Cloudflare
