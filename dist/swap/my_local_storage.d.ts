import { Pool } from "../utils/types/types";
interface ILocalStorage {
    setItem(key: string, value: Pool): void;
    getItem(key: string): Pool | null;
    removeItem(key: string): void;
}
export declare const myLocalStorage: ILocalStorage;
export {};
