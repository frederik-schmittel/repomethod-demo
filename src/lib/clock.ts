export interface Clock {
  now(): string;
}

export const systemClock: Clock = {
  now(): string {
    return new Date().toISOString();
  },
};
