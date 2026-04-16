export interface TrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  platform: string;
  delay: number;
}

export interface TrainSchedule {
  id: string;
  trainNumber: string;
  trainName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: TrainStop[];
  daysOfOperation: string[];
  status: 'on-time' | 'delayed' | 'cancelled';
  delayMinutes?: number;
}

export interface Station {
  code: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  amenities: string[];
  platforms: number;
  address: string;
}

export interface LiveTrainPosition {
  trainNumber: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdated: string;
  nextStation: string;
  estimatedArrival: string;
}

export interface DelayAlert {
  id: string;
  trainNumber: string;
  trainName: string;
  reason: string;
  delayMinutes: number;
  createdAt: string;
}
