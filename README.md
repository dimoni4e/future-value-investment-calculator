# Future Value Investment Calculator

## Overview

The Future Value Investment Calculator is a web application designed to help users calculate the future value of their investments based on various inputs. The application provides a user-friendly interface with interactive components, allowing users to adjust parameters and visualize their investment growth over time.

## Features

- **Investment Calculation**: Users can input their investment details to calculate the future value.
- **Growth Chart**: Visual representation of investment growth over time.
- **Scenario Slider**: Adjust scenarios to see how different variables affect future value.
- **Social Sharing**: Share calculated results on social media platforms.
- **Multi-language Support**: Switch between different languages for a broader audience reach.

## Project Structure

The project is organized into several directories and files, each serving a specific purpose:

- **app/**: Contains the main application files, including layout and routing.
- **components/**: Reusable UI components used throughout the application.
- **lib/**: Utility functions for financial calculations, internationalization, and SEO.
- **hooks/**: Custom hooks for managing state and logic.
- **public/**: Static assets such as images and icons.
- **scripts/**: Scripts for generating dynamic content like sitemaps.
- **.env.local**: Environment variables for local development.
- **next.config.mjs**: Configuration settings for Next.js.
- **tailwind.config.cjs**: Configuration for Tailwind CSS.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd future-value-app
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3000` to view the application.

## Usage

- Input your investment details in the form provided.
- Use the scenario slider to adjust parameters and see real-time calculations.
- View the growth chart for a visual representation of your investment.
- Share your results using the social media buttons.

## Deployment

This application is deployed via Coolify. Configure your Coolify service with the repository, build/start commands, and environment variables below. CI builds still run on GitHub Actions.

### Production Deployment (Coolify)

1. **Push to GitHub**: Coolify tracks the `main` branch and deploys on new commits (depending on your Coolify settings).

2. **Environment Variables** (set in Coolify):

   ```
   NEXT_PUBLIC_BASE_URL=https://fvinvestcalc.com
   DATABASE_URL=postgres://user:pass@host:port/db
   DATABASE_SSL=true
   SENTRY_DSN=your-sentry-dsn
   NEXT_PUBLIC_SENTRY_DSN=your-public-sentry-dsn
   SENTRY_ORG=your-sentry-org
   SENTRY_PROJECT=your-sentry-project
   SENTRY_AUTH_TOKEN=your-sentry-auth-token
   ```

3. **Resources**: Ensure the app service has network access to your Postgres (Coolify internal network recommended).

### Preview/Testing

- Use GitHub Actions to build and run tests on PRs.
- Optionally configure a separate Coolify service for preview branches.

## CI/CD Pipeline

The project includes GitHub Actions workflows that:

- Run ESLint and TypeScript checks
- Execute Jest and Playwright tests
- Generate test reports and artifacts

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
