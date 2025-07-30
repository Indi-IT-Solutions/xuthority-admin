# Trusted Tech Section Testing Guide

## Implementation Details

### 1. **Validation Rules**
- **All fields are mandatory** (Card 1 heading/subtext, Card 2 heading/subtext, Button text/link)
- **Automatic trimming** of whitespace before validation and submission
- **Validation mode**: `onBlur` - shows errors when user leaves a field or on submit

### 2. **Data Structure**
The section saves data in this format:
```json
{
  "card1": {
    "heading": "Trimmed heading text",
    "subtext": "Trimmed subtext content"
  },
  "card2": {
    "heading": "Trimmed heading text",
    "subtext": "Trimmed subtext content"
  },
  "buttonText": "Trimmed button text",
  "buttonLink": "Trimmed button link"
}
```

### 3. **Testing Steps**

#### A. Test Validation (Empty Fields)
1. Click "Save & Update" without filling any fields
   - **Expected**: All 6 fields show error messages
   - Error messages: "Heading is required", "Subtext is required", "Button text is required", "Button link is required"

#### B. Test Trimming
1. Enter text with spaces: "   Test Heading   "
2. Submit the form
3. Check console logs - data should show: "Test Heading" (trimmed)

#### C. Test Save & Load
1. Fill all fields:
   - Card 1 Heading: "Amplify Customer Feedback"
   - Card 1 Subtext: "We simplify the process of gathering customer feedback"
   - Card 2 Heading: "Build Trust Effectively"
   - Card 2 Subtext: "Our platform helps you build trust with customers"
   - Button Text: "Get Started"
   - Button Link: "https://example.com"
2. Click "Save & Update"
3. Check console for: "Submitting trusted tech section data:" log
4. Wait for success toast
5. Refresh the page
6. Check console for: "Loaded section data:" log
7. Verify all fields are populated with saved data

### 4. **Console Logs for Debugging**
The component logs:
- When data is loaded: `Loaded section data: {data}`
- Data format conversion: `Converted data from old format:` or `Using data in new format:`
- On submit: `Submitting trusted tech section data: {trimmedData}`
- Success confirmation: `Data saved successfully. Refresh the page to verify it loads correctly.`

### 5. **Backend Integration**
The component uses:
- `useLandingPageSection(pageType, 'trustedTech')` - GET request
- `useUpdateLandingPageSection()` - POST/PUT request

The backend automatically:
- Creates new section data if none exists (POST)
- Updates existing data (PUT)

### 6. **Backward Compatibility**
The component handles both data formats:
- Old format: `{ cards: [{heading, subtext}, {heading, subtext}], buttonText, buttonLink }`
- New format: `{ card1: {heading, subtext}, card2: {heading, subtext}, buttonText, buttonLink }`

## Common Issues & Solutions

1. **Validation not showing**: Check that all fields have proper error prop passed to FormField
2. **Data not saving**: Check browser console for API errors
3. **Data not loading**: Ensure backend is running and returning data for 'trustedTech' section
4. **Trimming not working**: The schema uses `.trim()` which trims during validation

## Test Checklist
- [ ] Empty form shows 6 validation errors on submit
- [ ] Whitespace is trimmed from all fields
- [ ] Data saves successfully (success toast appears)
- [ ] Data loads correctly on page refresh
- [ ] Console shows proper logs for debugging
- [ ] Both old and new data formats are handled