# Digital Krishi Assistant

A comprehensive digital farming assistant designed to empower farmers with AI-powered agricultural insights, crop management tools, and real-time market data.

## Features

- **Weather Forecasting** - Get accurate weather updates for your location
- **Crop Health Monitoring** - AI-powered analysis of crop health
- **AI Chatbot** - Get instant answers to farming-related queries
- **Irrigation Management** - Smart water usage recommendations
- **Market Prices** - Real-time agricultural commodity prices
- **Crop Planning** - Optimize your planting and harvesting schedule
- **Disease Detection** - Identify plant diseases using AI

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/digital-krishi-assistant.git
   cd digital-krishi-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
   NEXT_PUBLIC_AI_SERVICE_URL=your_ai_service_url
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **UI Components**: Shadcn UI
- **Maps & Location**: Google Maps API
- **Authentication**: NextAuth.js
- **API**: Next.js API Routes

## Project Structure

```
.
├── app/                  # App router pages
├── components/           # Reusable components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard widgets
│   ├── features/        # Main feature components
│   └── ui/              # UI components
├── public/              # Static files
└── styles/              # Global styles
```

## Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- All the amazing open-source libraries that made this project possible
