import { JsonDB, Config } from 'node-json-db';
import path from 'path';

let db: any;

export const DatabaseManager = {
  init() {
    db = new JsonDB(new Config(path.join(__dirname, "../../db/turtleDB"), true, true, "/"));
  },

  async saveTurtle(id: number, x: number, y: number, z: number, direction: number) {
    await db.push(`/turtles/${id}`, { x, y, z, d: direction }, true);
  },
  async getTurtle(id: number) {
    try { return await db.getData(`/turtles/${id}`); } 
    catch { return {}; }
  },

  async saveBlock(x: number, y: number, z: number, name: string, color: number) {
    await db.push(`/world/${x},${y},${z}`, { name, color }, true);
  },
  async getBlock(x: number, y: number, z: number, name: string, color: number) {
    try { return await db.getData(`/world/${x},${y},${z}`); } 
    catch { return {}; }
  },
  async getFullWorld() {
    try { return await db.getData("/world"); } 
    catch { return {}; }
  }
}