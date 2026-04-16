import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TrainSchedule, Station, LiveTrainPosition, DelayAlert } from '../types';
import { mockTrainSchedules, mockStations, mockLiveTrainPositions, mockDelayAlerts } from '../data/mockData';

interface TrainState {
  schedules: TrainSchedule[];
  stations: Station[];
  liveTrains: LiveTrainPosition[];
  alerts: DelayAlert[];
  selectedSchedule: TrainSchedule | null;
  isLoading: boolean;
  error: string | null;
}

type TrainAction =
  | { type: 'SET_SCHEDULES'; payload: TrainSchedule[] }
  | { type: 'SET_STATIONS'; payload: Station[] }
  | { type: 'SET_LIVE_TRAINS'; payload: LiveTrainPosition[] }
  | { type: 'SET_ALERTS'; payload: DelayAlert[] }
  | { type: 'SELECT_SCHEDULE'; payload: TrainSchedule | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'REFRESH_DATA' };

const initialState: TrainState = {
  schedules: mockTrainSchedules,
  stations: mockStations,
  liveTrains: mockLiveTrainPositions,
  alerts: mockDelayAlerts,
  selectedSchedule: null,
  isLoading: false,
  error: null,
};

function trainReducer(state: TrainState, action: TrainAction): TrainState {
  switch (action.type) {
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    case 'SET_STATIONS':
      return { ...state, stations: action.payload };
    case 'SET_LIVE_TRAINS':
      return { ...state, liveTrains: action.payload };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SELECT_SCHEDULE':
      return { ...state, selectedSchedule: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'REFRESH_DATA':
      return {
        ...state,
        schedules: mockTrainSchedules,
        stations: mockStations,
        liveTrains: mockLiveTrainPositions,
        alerts: mockDelayAlerts,
      };
    default:
      return state;
  }
}

interface TrainContextType {
  state: TrainState;
  dispatch: React.Dispatch<TrainAction>;
  searchTrains: (query: string) => TrainSchedule[];
  getStationByCode: (code: string) => Station | undefined;
  getTrainPosition: (trainNumber: string) => LiveTrainPosition | undefined;
}

const TrainContext = createContext<TrainContextType | undefined>(undefined);

export function TrainProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trainReducer, initialState);

  const searchTrains = (query: string): TrainSchedule[] => {
    const lowerQuery = query.toLowerCase();
    return state.schedules.filter(
      (train) =>
        train.trainNumber.toLowerCase().includes(lowerQuery) ||
        train.trainName.toLowerCase().includes(lowerQuery) ||
        train.origin.toLowerCase().includes(lowerQuery) ||
        train.destination.toLowerCase().includes(lowerQuery)
    );
  };

  const getStationByCode = (code: string): Station | undefined => {
    return state.stations.find((station) => station.code === code);
  };

  const getTrainPosition = (trainNumber: string): LiveTrainPosition | undefined => {
    return state.liveTrains.find((train) => train.trainNumber === trainNumber);
  };

  return (
    <TrainContext.Provider value={{ state, dispatch, searchTrains, getStationByCode, getTrainPosition }}>
      {children}
    </TrainContext.Provider>
  );
}

export function useTrain() {
  const context = useContext(TrainContext);
  if (context === undefined) {
    throw new Error('useTrain must be used within a TrainProvider');
  }
  return context;
}
