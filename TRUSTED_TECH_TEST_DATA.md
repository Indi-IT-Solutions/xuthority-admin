# Trusted Tech Section - Test Data & Verification

## Backend Updates Made

1. **Updated LandingPage Model** (`/src/models/LandingPage.js`):
   ```javascript
   trustedTech: {
     cards: [{
       id: { type: String, required: false },
       heading: { type: String, required: false },
       subtext: { type: String, required: false }
     }],
     buttonText: { type: String, required: false },
     buttonLink: { type: String, required: false }
   }
   ```

2. **Created Migration Script** (`/scripts/migrate-trusted-tech-data.js`):
   - Converts old format to new cards array format
   - Handles backward compatibility

3. **Controller Support**:
   - Already handles `trustedTech` in the section name mapping
   - Supports both GET and PUT operations

## Testing Instructions

### 1. Verify Backend is Ready
- Backend server should be running on port 8081
- Check console for: "Server running on port 8081"

### 2. Test GET Request
Navigate to: http://localhost:8081/api/v1/landing-pages/vendor/sections/trustedTech

Expected response structure:
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "1",
        "heading": "Card 1 Heading",
        "subtext": "Card 1 Subtext"
      },
      {
        "id": "2",
        "heading": "Card 2 Heading",
        "subtext": "Card 2 Subtext"
      }
    ],
    "buttonText": "Learn More",
    "buttonLink": "https://example.com"
  }
}
```

### 3. Test in Admin UI
1. Navigate to: Admin Panel → Landing Pages → Vendor → Trusted Tech Sales Overview
2. Check browser console for:
   - "Loaded section data:" (shows fetched data)
   - "Using data in new format:" (shows data being populated)

### 4. Test Save Operation
1. Fill in multiple cards:
   - Card 1: "Amplify Customer Feedback" / "We simplify the process..."
   - Card 2: "Build Trust" / "Our platform helps..."
   - Add more cards using "Add More" button
2. Fill button fields:
   - Button Text: "Get Started"
   - Button Link: "https://example.com"
3. Click "Save & Update"
4. Check for:
   - Success toast message
   - Console: "Submitting trusted tech section data:"
   - Console: "Data saved successfully..."

### 5. Verify Persistence
1. Refresh the page
2. All cards should reload with saved data
3. Check console for proper data loading

## API Endpoints

- **GET**: `/api/v1/landing-pages/vendor/sections/trustedTech`
- **PUT**: `/api/v1/landing-pages/vendor/sections/trustedTech`

## Data Flow

1. **Frontend → Backend**:
   ```json
   {
     "cards": [
       {"id": "1", "heading": "...", "subtext": "..."},
       {"id": "2", "heading": "...", "subtext": "..."}
     ],
     "buttonText": "...",
     "buttonLink": "..."
   }
   ```

2. **Backend → Frontend**: Same structure

## Troubleshooting

1. **No cards showing**: Check if backend has been restarted after schema update
2. **Old data format**: Run migration script if needed
3. **Validation errors**: All fields are mandatory
4. **API errors**: Check backend console for detailed error messages