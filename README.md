# ShopFlow — Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A modern React frontend for ShopFlow (inventory-app-frontend). Provides the UI for:
- Landing page & demo
- Sign up / Login
- Category selection
- Dashboard with charts
- Inventory, Sales, Expenses management
- Product history and reports

## Features
- Responsive UI built with React and Tailwind CSS
- Interactive charts using Chart.js / react-chartjs-2
- Demo mode (public) and protected routes (JWT-auth)
- Export reports (PDF / Excel)
- Product change history (last 90 days)

## Tech Stack
- React (Create React App)
- Tailwind CSS
- Axios
- react-router-dom
- Chart.js / react-chartjs-2

## Quickstart (local)
1. Clone the repo
```bash
git clone <your-frontend-repo-url>
cd <frontend-folder>
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
Create a `.env` in the frontend root (do NOT commit this file). Example `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```
- In production, set `REACT_APP_API_URL` to your deployed backend URL (e.g., `https://inventory-app-backend.onrender.com`).

4. Run in development
```bash
npm start
```
Open http://localhost:3000

5. Build for production
```bash
npm run build
```
The optimized build will be in the `build/` directory.

## Environment Variables
- REACT_APP_API_URL — Base URL of backend API (required)

## Deployment (Vercel recommended)
1. Push the repository to GitHub.
2. In Vercel, import the project and set:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add Environment Variable in Vercel:
   - `REACT_APP_API_URL` = `https://<your-backend-url>`
4. Deploy. After deployment, update backend's CORS FRONTEND_URL to the deployed frontend origin.

## Contributing
- Fork the repo, create a feature branch, make changes, open a pull request.
- Keep secrets out of the repository. Use `.env` and platform environment variables.

## Useful Scripts (package.json)
- `npm start` — Start dev server
- `npm run build` — Build production bundle
- `npm test` — Run tests (if configured)
- `npm run lint` — Run linter (if configured)

## Notes
- The frontend expects the backend to provide JWT-based auth and protected API endpoints (products, sales, expenses, product-history, reports).
- Ensure backend environment variables (MONGO_URI, JWT_SECRET, FRONTEND_URL) are configured before testing a deployed frontend.

## License
This frontend is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## Contact
- GitHub: [pasindujayakodi77](https://github.com/pasindujayakodi77)
