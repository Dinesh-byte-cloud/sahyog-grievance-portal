# Sahyog - City Grievance Portal

A web application for citizens to submit and track grievances, with a government dashboard for complaint management.

## Features

- Citizen complaint submission
- Complaint tracking
- Government dashboard
- Email notifications
- Real-time status updates

## Deployment Instructions

### Prerequisites

1. Node.js (v14 or higher)
2. Supabase account
3. n8n account for automation
4. SMTP server for email notifications

### Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in the required environment variables:
   - Supabase credentials
   - n8n webhook URL
   - SMTP settings

### Backend Deployment (Render.com)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables from `.env`

### Frontend Deployment (Netlify)

1. Create a new site on Netlify
2. Connect your GitHub repository
3. Configure:
   - Build Command: (leave empty for static site)
   - Publish directory: `.`
4. Add environment variables if needed

### Database Setup (Supabase)

1. Create a new project on Supabase
2. Run the SQL migrations
3. Configure security rules
4. Update environment variables with new credentials

### Automation Setup (n8n)

1. Deploy n8n workflow
2. Update webhook URL in environment variables
3. Configure email settings

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in values
4. Start the development server:
   ```bash
   npm run dev
   ```

## Security Considerations

1. Enable CORS for production domains
2. Set up proper authentication
3. Configure rate limiting
4. Use HTTPS
5. Secure environment variables

## Support

For support, please contact [your-email@example.com] #   s a h y o g - g r i e v a n c e - p o r t a l  
 