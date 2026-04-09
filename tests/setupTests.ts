import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill TextEncoder/TextDecoder for react-router in jsdom
Object.assign(global, { TextEncoder, TextDecoder });
