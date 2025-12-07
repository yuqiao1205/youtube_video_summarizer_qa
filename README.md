# Lauren's YouTube Video Summarizer & Q&A

![App Screenshot](yt_video.png)

An AI-powered web application that allows users to summarize YouTube videos and ask questions about their content using advanced language models.

## Features

- **Video Summarization**: Generate concise summaries of YouTube videos in English or Chinese
- **Q&A System**: Ask specific questions about video content and get AI-powered answers
- **Multi-language Support**: Choose between English and Chinese for summaries
- **Multiple AI Models**: Select from various AI models including Amazon Nova Lite, Arcee Trinity Mini, and Kat Coder Pro
- **Free to Use**: No credit card or email required
- **Responsive Design**: Modern, mobile-friendly interface with dark theme

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI Integration**: OpenRouter API (access to multiple AI models)
- **Transcript Extraction**: YouTube Transcript API
- **UI Components**: Shadcn UI
- **Language Processing**: LangChain

## Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun
- OpenRouter API key (for AI model access)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube_videosummary
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## Environment Setup

1. Create a `.env` file in the root directory
2. Add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

You can get an API key from [OpenRouter](https://openrouter.ai/).

## Usage

1. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. To use the application:
   - Paste a YouTube video URL into the input field
   - Select your preferred summary language (English or Chinese)
   - Choose an AI model from the dropdown
   - Click "Summarize Video" to generate a summary
   - Or use the Q&A section to ask specific questions about the video

## How It Works

1. **Transcript Extraction**: The app fetches the video transcript using YouTube's API
2. **AI Processing**: Uses selected AI models via OpenRouter to process the transcript
3. **Summarization**: Generates structured summaries with key points
4. **Q&A**: Provides context-aware answers to user questions based on the video content

## Building for Production

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
