# Accessory Search Feature

## Overview
This feature allows users to search for existing accessories when adding products in the Add Purchase page. When a user searches for a product name (like "headphone"), the system will show matching accessories and allow auto-filling of product details.

## Features Implemented

### 1. Search API Endpoint
- **Endpoint**: `GET /api/accessories?search={query}`
- **Functionality**: Searches accessories by product name or product ID
- **Case-insensitive**: Uses regex with 'i' flag for case-insensitive search

### 2. Enhanced Add Purchase UI
- **Searchable Input**: For accessories category, the Product Name field now includes a searchable dropdown
- **Auto-complete**: Shows matching accessories as user types (minimum 2 characters)
- **Auto-fill**: When selecting an accessory from search results:
  - Product Name is filled
  - Model/Variant is set to the Product ID
  - Purchase Price is filled from existing data
  - Selling Price is filled from existing data

### 3. UI Improvements
- **Dynamic Field Labels**: Model/Variant field shows "Model/Variant (Product ID)" for accessories
- **Help Text**: Added explanatory text for accessories explaining the Product ID usage
- **Click Outside**: Search dropdown closes when clicking outside
- **Visual Feedback**: Hover effects and clear visual hierarchy

## How to Use

1. **Select Category**: Choose "Accessories" from the Category dropdown
2. **Search Product**: In the Product Name field, start typing (e.g., "headphone")
3. **View Results**: Matching accessories will appear in a dropdown below the input
4. **Select Item**: Click on any accessory from the search results
5. **Auto-fill**: The form will automatically fill:
   - Product Name
   - Model/Variant (Product ID)
   - Purchase Price
   - Selling Price
6. **Continue**: Fill in quantity and other details as needed

## Technical Details

### Frontend Changes
- Added search state management (`searchResults`, `showSearchResults`, `searchQuery`)
- Implemented search API call with debouncing
- Created searchable dropdown component
- Added click-outside handler for dropdown
- Updated form field logic for accessories

### Backend Changes
- Enhanced `listAccessories` controller to support search parameter
- Added regex-based search across `productName` and `productId` fields

### Database
- Uses existing Accessory model
- No schema changes required
- Leverages MongoDB's regex search capabilities

## Example Usage

1. User selects "Accessories" category
2. User types "headphone" in Product Name field
3. System shows matching accessories:
   - "Bluetooth Headphone - ID: ACC-HEA-1234 - Price: ₹1500"
   - "Wired Headphone - ID: ACC-HEA-5678 - Price: ₹800"
4. User clicks on "Bluetooth Headphone"
5. Form auto-fills:
   - Product Name: "Bluetooth Headphone"
   - Model/Variant: "ACC-HEA-1234"
   - Purchase Price: 1500
   - Selling Price: 1500

## Benefits

- **Reduces Data Entry**: Users don't need to manually enter product details
- **Consistency**: Ensures consistent product naming and pricing
- **Efficiency**: Faster product entry process
- **Error Prevention**: Reduces typos and duplicate entries
- **User Experience**: Intuitive search and selection interface
