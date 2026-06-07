/**
 * Demo context snapshots (mock data for V1). Shape matches what a production app
 * would assemble from:
 * - Biometrics: energyLevel, sleepQuality, stressLevel (0–100), e.g. from a wearable
 * - Weather: human-readable `weather` plus `rainChance` (0–100)
 * - Calendar: `calendar` — next commitment / focus block (EventKit, Google Calendar, …)
 *
 * The UI context switcher lists these. The first profile is the hero Taipei demo.
 */
export const CONTEXTS = [
  {
    id: 'pitch_practice_taipei',
    label: 'Pitch practice',
    energyLevel: 64,
    sleepQuality: 28,
    stressLevel: 92,
    weather: 'Partly cloudy, 60% chance of showers',
    rainChance: 60,
    calendar: 'Pitch practice at 10:00 AM',
    timeOfDay: 'Taipei morning',
    location: 'Taipei',
    activity: 'pitch_practice',
    userName: 'Jasmine',
  },
  {
    id: 'deep_focus_block',
    label: 'Deep focus block',
    energyLevel: 60,
    sleepQuality: 70,
    stressLevel: 55,
    weather: 'Clear, mild',
    rainChance: 5,
    calendar: 'Heads-down coding, 2 hours',
    timeOfDay: 'Mid-morning',
    location: 'Home office',
    activity: 'focus',
    userName: 'Jasmine',
  },
  {
    id: 'rainy_commute',
    label: 'Rainy commute',
    energyLevel: 45,
    sleepQuality: 55,
    stressLevel: 60,
    weather: 'Steady rain',
    rainChance: 90,
    calendar: 'Commute to office',
    timeOfDay: 'Morning',
    location: 'City transit',
    activity: 'commute',
    userName: 'Jasmine',
  },
  {
    id: 'workout_push',
    label: 'Workout push',
    energyLevel: 85,
    sleepQuality: 75,
    stressLevel: 30,
    weather: 'Sunny, warm',
    rainChance: 0,
    calendar: 'Gym session',
    timeOfDay: 'Afternoon',
    location: 'Gym',
    activity: 'workout',
    userName: 'Jasmine',
  },
  {
    id: 'evening_wind_down',
    label: 'Evening wind-down',
    energyLevel: 30,
    sleepQuality: 60,
    stressLevel: 50,
    weather: 'Cool night',
    rainChance: 20,
    calendar: 'No plans, relaxing',
    timeOfDay: 'Night',
    location: 'Home',
    activity: 'wind_down',
    userName: 'Jasmine',
  },
];

export const getContext = (id) => CONTEXTS.find((c) => c.id === id);
