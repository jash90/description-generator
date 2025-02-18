# Product Description Generator

A Next.js web application that generates detailed product descriptions based on EAN codes using AI services powered by Perplexity. The app validates user input, allows you to set a maximum description length, and stores previous searches in a SQLite database via Prisma.

## Overview

This application enables you to:
- **Generate Product Descriptions:** Input an EAN code and specify a maximum character length. The backend calls the Perplexity API to generate a rich, detailed product description (in Polish) that includes the product name, brand, key features, benefits, technical specifications, use cases, target audience, and unique selling points.
- **View Search History:** See a list of the last five searches stored in a SQLite database. Click on a history entry to expand or collapse the full description.
- **Copy to Clipboard:** Easily copy the generated description.

## Features

- **EAN Input Validation:** Only accepts valid EAN codes (8 or 13 digits).
- **Custom Description Length:** Set the desired maximum character length for the generated description.
- **AI Integration:** Utilizes the Perplexity API (via a secure server-side proxy) to generate comprehensive product descriptions.
- **Persistent Search History:** Saves searches to a SQLite database using Prisma and lets you review recent searches.
- **Responsive Design:** Built with Tailwind CSS for a responsive and accessible UI.
- **Error Handling:** Displays appropriate error messages for API failures or rate limiting.

## Technologies Used

- **Next.js** (App Router with server-side API routes)
- **React** with Hooks (functional components)
- **Prisma** with SQLite (for storing search history)
- **Tailwind CSS** (styling)
- **Perplexity API** (AI service for product description generation)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Perplexity API key

### Installation

1. **Clone the Repository**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd <YOUR_REPOSITORY_DIRECTORY>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Configure Environment Variables**

   Create a `.env` file at the project root and add:
   ```env
   PERPLEXITY_API_KEY=your-perplexity-api-key-here
   ```

4. **Set Up the Database**

   Run the Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   ```
   This will create a SQLite database (`dev.db`) and generate the Prisma client.

### Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- **`src/app/page.tsx`**  
  The main page component containing the EAN input form, description generator, and search history display with expand/collapse functionality.

- **`src/app/api/generateDescription/route.ts`**  
  Server-side API route which:
  - Validates the EAN code.
  - Calls the Perplexity API with a custom prompt based on the specified maximum character length.
  - Saves the generated description along with the EAN code in the database.

- **`src/app/api/searchHistory/route.ts`**  
  API endpoint that fetches the last five saved searches from the SQLite database.

- **`lib/prisma.ts`**  
  Initializes and exports a PrismaClient instance used throughout the app for database interactions.

- **`prisma/schema.prisma`**  
  Prisma schema file defining the `Search` model to store search history.

## Deployment

When deploying to production, be sure to:
- Set the `PERPLEXITY_API_KEY` securely in your deployment environment.
- Configure any additional database settings if needed.

## License

This project is licensed under the [MIT License](LICENSE).

## Contributions

Contributions, suggestions, and issue reports are welcome. Please feel free to open issues or pull requests.
