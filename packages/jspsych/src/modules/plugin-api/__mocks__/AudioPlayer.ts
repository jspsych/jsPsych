import { AudioPlayerOptions } from "../AudioPlayer";

const actual = jest.requireActual("../AudioPlayer");

export const mockStop = jest.fn();

export const AudioPlayer = jest
  .fn()
  .mockImplementation((src: string, options: AudioPlayerOptions = { useWebAudio: false }) => {
    let eventHandlers = {};

    const mockInstance = Object.create(actual.AudioPlayer.prototype);

    return Object.assign(mockInstance, {
      load: jest.fn(),
      play: jest.fn(() => {
        setTimeout(() => {
          if (eventHandlers["ended"]) {
            for (const handler of eventHandlers["ended"]) {
              handler();
            }
          }
        }, 1000);
      }),
      stop: mockStop,
      addEventListener: jest.fn((event, handler) => {
        if (!eventHandlers[event]) {
          eventHandlers[event] = [];
        }
        eventHandlers[event].push(handler);
      }),
      removeEventListener: jest.fn((event, handler) => {
        if (eventHandlers[event] === handler) {
          eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler);
        }
      }),
    });
  });
