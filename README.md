# Health Form Upload App

A mobile-first web application for healthcare professionals to easily upload patient forms and medication lists through a simple, guided workflow.

## Features

- **QR Code Scanning**: Scan QR codes to initiate the form upload process
- **Camera Integration**: Capture form photos directly with device camera
- **Image Management**: Preview, organize, and remove images before upload
- **Voice Memo**: Record audio notes to provide additional context
- **Google Drive Integration**: Secure storage of all files in organized folders
- **Responsive Design**: Works seamlessly on mobile and desktop devices

## Demo

![App Demo](https://placeholder-for-your-demo-gif.com/demo.gif)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Storage**: Google Drive API
- **Deployment**: Vercel
- **Package Manager**: PNPM

## Getting Started

### Prerequisites

- Node.js (v16+)
- PNPM
- Google Drive API credentials

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/health-form-upload.git
   cd health-form-upload
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Configure environment variables by creating a `.env` file:

   ```
   GOOGLE_DRIVE_API_KEY=your_google_drive_api_key_here
   GOOGLE_DRIVE_PARENT_FOLDER_ID=your_parent_folder_id_here
   ```

4. Start the development server

   ```bash
   pnpm dev
   ```

5. Build for production
   ```bash
   pnpm build
   ```

## Google Drive API Setup

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Drive API
3. Create an API key with appropriate restrictions
4. Create a parent folder in Google Drive for all uploads
5. Note the folder ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`
6. Add these details to your `.env` file

## Project Structure

```
src/
├── assets/            # Static assets
├── components/        # UI components
│   ├── ui/            # Shadcn UI components
│   ├── Camera.tsx     # Camera component
│   ├── Header.tsx     # App header
│   ├── Footer.tsx     # App footer
│   └── ...
├── services/          # API services
│   └── fileService.ts # Google Drive API integration
├── utils/             # Utility functions
│   └── env.ts         # Environment variable utilities
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Usage Flow

1. **Scan QR Code**: Healthcare professional scans a QR code on a form
2. **Instructions**: View clear instructions for the upload process
3. **Upload**: Take photos and optionally record a voice memo
4. **Confirmation**: Review successful upload details

## Deployment

The app is configured for deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or BitBucket)
2. Create a new project in Vercel and import the repository
3. Configure the environment variables in Vercel's project settings
4. Deploy your application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT](LICENSE)

## Support

For support, email your-email@example.com or open an issue on GitHub.
