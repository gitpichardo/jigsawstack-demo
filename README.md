# JigsawStacks AI Powered API Demo

## Overview

This application demonstrates a selction of JigsawStacks various AI-powered tools and services. This project serves as a demonstration and testing ground for developers interested in integrating JigsawStacks AI-powered APIs into their applications.

## Video Demo

- [Demo Walkthrough](https://www.loom.com/share/537f6dc836a2438b83ddc8d79938ece5?sid=8e9dc689-3e5e-4473-b852-68627e337ffb)

Click to watch a demo of the JigsawStacks AI-Powered APIs in action. This video showcases the key features of my application, including the AI Prompt Engine, Web Scraper, Text Summarizer, and Image Generation tools.

## Features

- **AI Prompt Engine**: Create and run custom AI prompts with dynamic input fields.
- **AI Web Scraper**: Extract specific information from web pages using AI-powered scraping.
- **Text Summarizer**: Generate concise summaries of large text inputs.
- **AI Image Generation**: Create images from text descriptions using various AI models.
- **Dark Mode**: Toggle between light and dark themes for better user experience.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for building the web application
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [JigsawStack API](https://jigsawstack.com/) - AI services provider
- [Lucide React](https://lucide.dev/) - Icon set for React
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript

## Prerequisites

- Node.js (v14 or later)
- npm or yarn package manager
- JigsawStack API key

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/jigsawstack-ai-demo.git
   cd jigsawstack-ai-suite
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your JigsawStack API key:
   ```
   JIGSAWSTACK_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- Navigate between different AI tools using the tab buttons at the top of the page.
- Follow the on-screen instructions for each tool to input data and generate results.
- Use the dark mode toggle in the top-right corner to switch between light and dark themes.

## API Routes

The project includes several API routes that interface with the JigsawStack API:

- `/api/prompt-engine/create-and-run`: Creates and runs custom AI prompts
- `/api/ai-scrape`: Performs AI-powered web scraping
- `/api/summary`: Generates text summaries
- `/api/image-generation`: Creates images from text descriptions 

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The JigsawStack team for providing the incredable AI-powered API services
- The Next.js team for their excellent framework
