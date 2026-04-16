# TrainTracker - Open Source Train Tracking Application

## Project Overview
- **Project Name**: TrainTracker
- **Type**: Cross-platform Mobile Application (React Native / Expo)
- **Core Functionality**: Real-time train tracking, schedule display, delay alerts, and station information
- **Target Users**: Commuters, travelers, and rail enthusiasts

## Technology Stack
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Maps**: react-native-maps
- **State Management**: React Context + useReducer
- **Storage**: AsyncStorage for offline data
- **Navigation**: @react-navigation/native

## Feature List

### Core Features (Free)
1. **Train Schedule Display**
   - Search by train number, route, or station
   - Display departure/arrival times, stops, duration
   - Filter by date and time

2. **Real-Time Train Tracking**
   - Live train positions on map
   - Estimated arrival times
   - Train status (on-time, delayed, cancelled)

3. **Delay Alerts**
   - Push notifications for delays
   - Delay reasons display
   - Real-time disruption updates

4. **Station Information**
   - Station details with amenities
   - Platform numbers
   - Station amenities (Wi-Fi, food, accessibility)

5. **User Interface**
   - Clean Material Design
   - Search filters (origin/destination, date/time)
   - Accessibility support

### Data Structure

#### Train Schedule
```typescript
interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: TrainStop[];
  daysOfOperation: string[];
}
```

#### Train Stop
```typescript
interface TrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  platform: string;
  delay: number; // minutes
}
```

#### Station
```typescript
interface Station {
  code: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  amenities: string[];
  platforms: number;
}
```

## UI/UX Design Direction

### Visual Style
- Modern Material Design 3
- Clean, minimalist interface
- Card-based layouts for train information

### Color Scheme
- Primary: #1976D2 (Blue - trust, transit)
- Secondary: #4CAF50 (Green - on-time)
- Error: #F44336 (Red - delays/cancellations)
- Warning: #FF9800 (Orange - minor delays)
- Background: #F5F5F5 (Light gray)
- Surface: #FFFFFF (White)

### Layout Approach
- Bottom tab navigation with 4 main sections:
  1. Home (Search)
  2. Live Map
  3. Stations
  4. Settings
- Pull-to-refresh for data updates
- Floating action buttons for quick actions

### Mock Data
The app will use realistic mock data for demonstration, simulating API responses for:
- Sample train schedules (multiple routes)
- Station information
- Live train positions
- Delay scenarios
