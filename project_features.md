# WICF System Features

## Current Features

### Authentication & User Management
- **User Registration**: Complete registration system with multi-step process
- **Login/Authentication**: NextAuth integration for secure authentication
- **Password Reset**: Email-based password reset functionality
- **Account Settings**: User profile management
- **Role-based Access Control**: Comprehensive permissions system

### Member Management
- **WICF Membership**: Detailed member profiles with extensive information
- **New Member Onboarding**: Special registration flow for new members
- **Member Statistics**: Tracking of membership data and statistics
- **Location Management**: Member location tracking and visibility controls

### Media & Content
- **Photo Gallery**:
  - Album management
  - Photo viewing and downloading
  - Multi-image selection
  - Thumbnail generation
  - Access control based on roles
  - View count tracking
  - Optimization for performance

- **Live Streaming**:
  - Stream management
  - Location-based viewing restrictions
  - Leader-managed streaming

### Ministry Tools
- **Prayer Ministry**:
  - Prayer request submission
  - Prayer assignment system
  - Email notifications for prayer requests
  - Anonymous prayer requests

- **Leadership Management**:
  - Role assignment
  - Permission management
  - Ministry team organization

### Communication
- **Notifications System**: In-app notifications
- **Email Integration**: Automated emails for various events
- **Feedback System**: User feedback collection

### Administrative Tools
- **Admin Dashboard**: Comprehensive admin interface
- **Permission Management**: Fine-grained control over user permissions
- **Route Management**: Control over accessible routes
- **Statistics & Reporting**: Data visualization and reporting tools

## Features in Development

### Registration Enhancements
- Email verification
- New members management improvements
- Export functionality by month
- Followup assignment for new members
- Login by email

### Form Builder
- Create and edit custom forms
- Form permissions
- Specialized forms for:
  - Prayer requests
  - Suggestion box
  - Surveys

### Notifications Improvements
- Dedicated notifications page
- Enhanced notification triggers

### Prayer Ministry Enhancements
- User list filtering by role
- Improved prayer email alerts
- Personal prayer assignment page

### DBS (Discipleship Bible Study)
- Features to be determined

### Service Preparation
- Sermon submission and preview
- Worship music submission
- Automated Sunday scheduling
- In-house messaging

### Live Features
- Socket integration for real-time features
- Live participant tracking
- View count tracking
- Live notices

### Financial Management
- Budget request system
- Income/expenditure recording
- Monthly financial reporting

### Portfolio Features
- Custom profile image upload
- Automatic elders page creation

### Post Tools
- Template upload system
- Minimal modification tools for quotes, thumbnails, and flyers
- Canva-like functionality

## Technical Stack

- **Frontend**: Next.js, React, Tailwind CSS, Ant Design
- **Backend**: Next.js API routes, tRPC
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth
- **Media Handling**: Image optimization, file downloads
- **Email**: Nodemailer
- **Deployment**: Vercel (inferred)

## Optimization Priorities
- Image optimization
- Server-side thumbnailing
- Load balancing
- CSS optimization
- Performance improvements for large file downloads 