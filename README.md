# Project Rahat - RBC 6(4) Case Resolution Portal

A comprehensive Next.js frontend for Project Rahat, a platform to manage RBC 6(4) case resolution in Raipur, Chhattisgarh. The portal supports a nine-stage workflow for financial assistance cases (₹1.5 lakh for unnatural deaths).

## Features

### 🏛️ Government Portal Design

- Authentic government branding with Bharat and Chhattisgarh logos
- Gradient headers and marquee banner with government schemes
- Responsive design matching government portal aesthetics
- Hindi/English bilingual support

### 👥 Role-Based Access

- **Tehsildar**: Case creation, document upload, approvals (Stages 1-3, 9)
- **SDM**: Case review and approval (Stage 4)
- **Rahat Shakha**: Case review and approval (Stage 5)
- **OIC**: Case review and approval (Stage 6)
- **Additional Collector**: Case review and approval (Stage 7)
- **Collector**: Analytics dashboard, final approvals (Stages 7-8)
- **Applicants**: Case status tracking and document download

### 📊 Dashboard Features

- **Officer Dashboard**: Role-specific case management with stage filtering
- **Collector Dashboard**: Analytics with charts, case distribution, rejection rates
- **Applicant Portal**: Public case status lookup with progress tracking

### 🔄 Nine-Stage Workflow

1. **Case Creation** (Tehsildar)
2. **Document Upload** (Tehsildar)
3. **Tehsildar Review** (Tehsildar)
4. **SDM Review** (SDM)
5. **Rahat Shakha Review** (Rahat Shakha)
6. **OIC Review** (OIC)
7. **Additional Collector Review** (Additional Collector)
8. **Collector Review** (Collector)
9. **Payment & Closure** (Tehsildar)

## Technology Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI Components**: Shadcn/UI
- **Data Fetching**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd rahat-portal
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Add your API configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard pages
│   │   ├── officer/      # Officer dashboard
│   │   └── collector/    # Collector dashboard
│   └── applicant/        # Applicant portal
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── layout/           # Layout components
│   ├── CaseTable.tsx     # Reusable case table
│   └── AnalyticsChart.tsx # Chart components
├── lib/                  # Utility libraries
│   └── api.ts           # API client configuration
├── queries/              # React Query hooks
│   └── index.ts         # Query and mutation hooks
└── types/               # TypeScript type definitions
    └── index.ts         # Interface definitions
```

## API Integration

The portal integrates with the following backend APIs:

### Authentication

- `POST /api/auth/sign-in/email` - User login
- `GET /api/v1/members/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh JWT token

### Cases

- `POST /cases/create` - Create new case
- `GET /cases` - Get cases with filters
- `GET /cases/:id` - Get specific case
- `PUT /cases/:id/update` - Update case status
- `PUT /cases/:id/close` - Close case with payment
- `PUT /cases/:id/fix-payment` - Fix payment details
- `POST /cases/:id/documents/upload` - Upload documents
- `GET /cases/:id/pdf` - Download case PDF
- `GET /cases/:id/final-pdf` - Download final PDF
- `GET /cases/my-pending` - Get pending cases
- `GET /cases/:id/status` - Get case status (public)

### Analytics

- `GET /analytics/dashboard` - Get dashboard analytics

### Notifications

- `POST /notifications/send` - Send notifications

## Key Components

### Header Component

- Government branding with logos
- Marquee banner with Chhattisgarh schemes
- Official information display

### Sidebar Component

- Quick links to government portals
- Emergency contact information
- Raipur capital information

### CaseTable Component

- Reusable table for case management
- Role-based action buttons
- Status indicators and stage tracking

### AnalyticsChart Component

- Bar, pie, and line charts using Recharts
- Configurable data visualization
- Responsive chart layouts

## Authentication Flow

1. User logs in with email/password
2. JWT token is stored in localStorage
3. Role-based redirect to appropriate dashboard
4. Token automatically included in API requests
5. Unauthorized requests redirect to login

## Role-Based Routing

- **Collector**: `/dashboard/collector`
- **Officers**: `/dashboard/officer` (Tehsildar, SDM, Rahat Shakha, OIC, Additional Collector)
- **Applicants**: `/applicant`

## Styling Guidelines

### Color Scheme

- **Primary**: Emerald green (#059669)
- **Secondary**: Blue (#2563eb)
- **Accent**: Amber (#d97706)
- **Success**: Green (#16a34a)
- **Error**: Red (#dc2626)
- **Warning**: Yellow (#ca8a04)

### Gradients

- Header: `from-orange-500 via-white to-green-600`
- Sections: `from-emerald-600 via-blue-700 to-slate-700`
- Cards: Various gradient combinations

## Development

### Adding New Components

1. Create component in `src/components/`
2. Add TypeScript interfaces in `src/types/`
3. Create React Query hooks in `src/queries/`
4. Update API client in `src/lib/api.ts`

### Testing

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms

- Build the project: `npm run build`
- Serve static files from `out/` directory
- Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For technical support:

- **Phone**: 0771-2234567
- **Email**: rahat@cg.gov.in
- **Address**: Secretariat, Raipur, Chhattisgarh - 492001

## License

© 2025 Government of Chhattisgarh. All rights reserved.

---

**Project Rahat** - Empowering citizens with transparent case resolution for RBC 6(4) financial assistance.
