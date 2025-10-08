# Menu Management System

This restaurant management system now includes a complete menu management system with Firebase integration.

## Features

### Admin Menu Management
- **Add New Menu Items**: Admin can add new menu items with image URLs
- **Edit Menu Items**: Update existing menu item details including image URLs
- **Delete Menu Items**: Remove menu items from the database
- **Toggle Availability**: Quick toggle to mark items as available/unavailable
- **Real-time Updates**: All changes are immediately reflected across all connected devices

### Image Storage
- **Image URLs**: Menu items use image URLs from external sources (Pexels, Unsplash, etc.)
- **No File Upload**: Images are not uploaded to Firebase Storage
- **External Images**: Use any publicly accessible image URL

### Data Storage
- **Firestore Database**: All menu data is stored in Firestore for real-time synchronization
- **No Mock Data**: The system no longer uses hardcoded mock data
- **Auto-seeding**: If no menu items exist, the system automatically seeds with sample data

## How to Use

### Adding Menu Items (Admin)
1. Navigate to the Admin Dashboard
2. Go to the "Menu" tab
3. Click "Add Item" button
4. Fill in the menu item details:
   - Name
   - Description
   - Category
   - Price
   - Preparation Time
   - Image URL (from external sources like Pexels, Unsplash, etc.)
   - Availability status
5. Click "Add Item" to save

### Viewing Menu Items (Waiter)
1. Login as a waiter
2. Go to the "New Order" tab
3. Browse available menu items by category
4. Only items that are marked as "available" will show in the ordering system

### Firebase Configuration
The system uses the following Firebase services:
- **Firestore**: For storing menu data, orders, and bills
- **Authentication**: For user management

Note: Firebase Storage is not used for images. Images are referenced via external URLs.

### Database Structure
```
menuItems/
├── id (auto-generated)
├── name
├── description
├── price
├── category
├── image (External URL)
├── available
├── prepTime
├── createdAt
└── updatedAt
```

### Storage Structure
```
No Firebase Storage used - Images are external URLs
```

## Technical Implementation

### Context Integration
- Menu management functions are integrated into the AppContext
- Real-time listeners ensure immediate updates across all components
- Error handling for all CRUD operations

### Image URL Process
1. Admin enters image URL from external source (Pexels, Unsplash, etc.)
2. URL is validated and stored in Firestore
3. Image is displayed in the UI using the external URL

### Error Handling
- All Firebase operations include try-catch error handling
- User-friendly error messages for failed operations
- Graceful fallbacks for missing data

## Migration from Mock Data
The system has been completely migrated from mock data to Firebase:
- ✅ Removed all hardcoded menu items
- ✅ Integrated Firestore for data persistence
- ✅ Added external image URL support
- ✅ Implemented real-time synchronization
- ✅ Added comprehensive error handling

## Getting Started
1. Ensure Firebase is properly configured in `src/firebase.ts`
2. The system will automatically seed with sample data if no menu items exist
3. Start adding your own menu items through the Admin interface
4. All changes will be immediately visible to waiters and other admin users