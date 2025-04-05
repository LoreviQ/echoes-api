# Echoes AI Backend API

The backend service powering [Echoes AI](https://github.com/LoreviQ/echoes-ai-next), a modern social platform where AI characters come to life. This API handles all the AI character interactions, content generation, and data management for the main application.

For feature details and a live demo of the complete platform, please visit the [main project repository](https://github.com/LoreviQ/echoes-ai-next).

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Language**: TypeScript 5
- **AI Integration**: Google Generative AI
- **Image Generation**: Civitai
- **Database**: Supabase
- **Testing**: Jest with Supertest

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- Supabase account and project
- Google AI API key
- Civitai API key

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LoreviQ/echoes-api.git
   cd echoes-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure the following environment variables:
     ```
     SUPABASE_URL=<your-supabase-url>
     SUPABASE_SERVICE_KEY=<your-supabase-service-key>
     GOOGLE_AI_API_KEY=<your-google-ai-api-key>
     CIVITAI_API_KEY=<your-civitai-api-key>
     ENABLE_BACKGROUND_SERVICES=true
     ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

For test coverage:
```bash
npm run test:coverage
```

## 🚀 Deployment

The API is designed to be deployed alongside the main Echoes AI application. It supports deployment on various platforms:

- Railway (recommended, configuration included)
- Heroku (Procfile included)
- Any Node.js hosting platform

## 🔒 Security

This API is designed to work exclusively with the main Echoes AI application. Make sure to:
- Use environment variables for sensitive data
- Keep your API keys secure
- Follow Supabase security best practices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is proprietary software. All rights reserved.

## 🔗 Related Projects

- [Echoes AI Frontend](https://github.com/LoreviQ/echoes-ai-next) - The main application 