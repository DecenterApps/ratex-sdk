"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myLocalStorage = void 0;
const values = {};
class MockLocalStorage {
    setItem(key, value) {
        values[key] = value;
    }
    getItem(key) {
        return values[key] || null;
    }
    removeItem(key) {
        delete values[key];
    }
}
exports.myLocalStorage = new MockLocalStorage();
