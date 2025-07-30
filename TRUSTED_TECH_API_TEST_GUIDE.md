# Trusted Tech Section - Complete API Testing Guide

## Implementation Overview

The TrustedTechSection now supports:
- **Multiple cards** with dynamic add/remove functionality
- **Add More button** to add unlimited cards
- **Backward compatibility** with old format (card1, card2)
- **Full validation** on all fields with trimming
- **Complete API integration** (GET, POST, PUT)

## Data Structure

### New Format (Current)
```json
{
  "cards": [
    {
      "id": "unique-id-1",
      "heading": "Amplify Customer Feedback",
      "subtext": "We simplify the process of gathering customer feedback"
    },
    {
      "id": "unique-id-2",
      "heading": "Build Trust Effectively",
      "subtext": "Our platform helps you build trust with customers"
    }
  ],
  "buttonText": "Get Started",
  "buttonLink": "https://example.com"
}
```

### Old Format (Still Supported for Reading)
```json
{
  "card1": {
    "heading": "Amplify Customer Feedback",
    "subtext": "We simplify the process..."
  },
  "card2": {
    "heading": "Build Trust Effectively",
    "subtext": "Our platform helps..."
  },
  "buttonText": "Get Started",
  "buttonLink": "https://example.com"
}
```

## API Testing Steps

### 1. Test GET (Data Loading)
1. Navigate to Vendor > Trusted Tech Sales Overview
2. Check browser console for: `Loaded section data:`
3. Verify:
   - If data exists, it should populate all cards
   - If no data, shows one empty card
   - Old format data is converted to new format

### 2. Test POST (First Save)
1. Clear any existing data (if needed)
2. Fill in:
   - Card 1: 
     - Heading: "First Card Heading"
     - Subtext: "First card description text"
   - Click "Add More"
   - Card 2:
     - Heading: "Second Card Heading"
     - Subtext: "Second card description text"
   - Button Text: "Learn More"
   - Button Link: "https://example.com"
3. Click "Save & Update"
4. Check console for:
   - `Submitting trusted tech section data:` (shows trimmed data)
   - Success toast message
5. Refresh page to verify data loads correctly

### 3. Test PUT (Update Existing)
1. Modify existing data:
   - Change card headings/subtexts
   - Add a third card using "Add More"
   - Update button text/link
2. Save and verify update works
3. Refresh to confirm persistence

### 4. Test Validation
1. **Empty Fields**:
   - Try saving with empty cards
   - Should show: "Heading is required", "Subtext is required"
   - Button fields: "Button text is required", "Button link is required"

2. **Invalid URL**:
   - Enter invalid URL: "not-a-url"
   - Should show: "Please enter a valid URL (e.g., https://example.com)"

3. **Minimum Cards**:
   - Cannot remove the last card (trash icon hidden)
   - At least one card is always required

### 5. Test Dynamic Card Management
1. **Add Cards**:
   - Click "Add More" multiple times
   - Each new card gets unique ID
   - Card numbers update (Card 1, Card 2, Card 3...)

2. **Remove Cards**:
   - Add 3-4 cards
   - Remove middle cards
   - Verify numbering updates correctly
   - Verify data saves without removed cards

3. **Data Trimming**:
   - Enter text with spaces: "   Test   "
   - Save and check console - should show "Test"

## Console Debugging

The component logs at key points:
```javascript
// On load
console.log('Loaded section data:', sectionData);

// Format conversion
console.log('Converted data from old format:', formData);
// OR
console.log('Using data in new format:', formData);

// On submit
console.log('Submitting trusted tech section data:', trimmedData);

// Success
console.log('Data saved successfully. Refresh the page to verify it loads correctly.');
```

## API Endpoints Used

1. **GET**: `useLandingPageSection(pageType, 'trustedTech')`
   - Fetches existing section data
   - Called on component mount

2. **POST/PUT**: `useUpdateLandingPageSection()`
   - Creates new data if none exists
   - Updates existing data
   - The hook automatically determines POST vs PUT

## Common Issues & Solutions

1. **Cards not saving**: Check console for API errors
2. **Validation not working**: Ensure all fields have proper error handling
3. **Old data not converting**: Check if data has card1/card2 structure
4. **Add More not working**: Verify useFieldArray is properly imported

## Test Checklist

- [ ] GET: Data loads on page refresh
- [ ] POST: New data saves successfully
- [ ] PUT: Existing data updates correctly
- [ ] Validation: All empty fields show errors
- [ ] URL validation works
- [ ] Add More button adds new cards
- [ ] Remove button removes cards (except last one)
- [ ] Data trimming works on all fields
- [ ] Old format converts to new format
- [ ] Console shows proper debug logs
- [ ] Success/error toasts appear correctly