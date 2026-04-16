import { configure, trackTrain, getTrainInfo as getTrainInfoAPI, liveAtStation } from 'irctc-connect';

const API_KEY = process.env.EXPO_PUBLIC_IRCTC_API_KEY || 'demo_key';

export const initAPI = () => {
  configure(API_KEY);
};

export const getLiveTrainStatus = async (trainNumber: string, date?: string) => {
  try {
    const result = await trackTrain(trainNumber, date);
    return result;
  } catch (error) {
    console.error('Error fetching train status:', error);
    return { success: false, error: 'Failed to fetch train status' };
  }
};

export const getTrainDetails = async (trainNumber: string) => {
  try {
    const result = await getTrainInfoAPI(trainNumber);
    return result;
  } catch (error) {
    console.error('Error fetching train info:', error);
    return { success: false, error: 'Failed to fetch train info' };
  }
};

export const getLiveTrainsAtStation = async (stationCode: string) => {
  try {
    const result = await liveAtStation(stationCode);
    return result;
  } catch (error) {
    console.error('Error fetching station trains:', error);
    return { success: false, error: 'Failed to fetch station trains' };
  }
};

export const formatDate = (date: Date = new Date()): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const parseStationsFromAPI = (apiResponse: any) => {
  if (!apiResponse.success || !apiResponse.data) return [];
  
  const data = apiResponse.data;
  const stations = data.route || data.stations || [];
  
  return stations.map((station: any, index: number) => ({
    stationCode: station.stationCode || station.code || '',
    stationName: station.stationName || station.name || '',
    arrivalTime: station.schArr || station.arrivalTime || '',
    departureTime: station.schDep || station.departureTime || '',
    platform: station.platform || station.plat || '-',
    delay: station.delay || station.delayInArrival || 0,
    distance: station.distance || station.dist || 0,
    day: station.day || index + 1,
    isCurrent: station.isCurrent || station.isReach === 'passed',
    isPassed: station.isPassed || station.isReach === 'passed',
  }));
};

export const getCurrentStation = (stations: any[]) => {
  return stations.find(s => s.isCurrent) || stations.find(s => !s.isPassed);
};

export const getNextStation = (stations: any[], currentIndex: number) => {
  return stations[currentIndex + 1] || null;
};

export const formatDelay = (minutes: number) => {
  if (minutes === 0) return 'On Time';
  if (minutes < 0) return `${Math.abs(minutes)} min early`;
  return `+${minutes} min`;
};