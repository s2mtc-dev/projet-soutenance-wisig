import { createSeedDatabase, DATABASE_VERSION } from '../data/seed.js';

function clone(value) {
  return structuredClone(value);
}

function ensureArray(snapshot, collection) {
  if (!Array.isArray(snapshot[collection])) {
    throw new Error(`Invalid collection: ${collection}`);
  }
}

export class MemoryStorageAdapter {
  constructor(initialDatabase = createSeedDatabase()) {
    this.database = clone(initialDatabase);
    this.counter = 1;
  }

  async initialize() {
    if (!this.database || this.database.version !== DATABASE_VERSION) {
      this.database = createSeedDatabase();
    }
    return clone(this.database);
  }

  async getCollection(name) {
    await this.initialize();
    ensureArray(this.database, name);
    return clone(this.database[name]);
  }

  async getById(collection, id) {
    const items = await this.getCollection(collection);
    return items.find((item) => item.id === id) ?? null;
  }

  async create(collection, record) {
    await this.initialize();
    ensureArray(this.database, collection);
    const timestamp = new Date().toISOString();
    const created = {
      id: record.id ?? `id-${Date.now()}-${this.counter++}`,
      createdAt: record.createdAt ?? timestamp,
      updatedAt: timestamp,
      status: record.status ?? 'active',
      ...clone(record)
    };
    this.database[collection].push(created);
    return clone(created);
  }

  async update(collection, id, changes) {
    await this.initialize();
    ensureArray(this.database, collection);
    const index = this.database[collection].findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Record not found: ${collection}/${id}`);
    }
    const updated = {
      ...this.database[collection][index],
      ...clone(changes),
      id,
      updatedAt: new Date().toISOString()
    };
    this.database[collection][index] = updated;
    return clone(updated);
  }

  async remove(collection, id) {
    await this.initialize();
    ensureArray(this.database, collection);
    const before = this.database[collection].length;
    this.database[collection] = this.database[collection].filter((item) => item.id !== id);
    return before !== this.database[collection].length;
  }

  async replaceDatabase(snapshot) {
    if (!snapshot || snapshot.version !== DATABASE_VERSION) {
      throw new Error('Invalid database version');
    }
    for (const collection of Object.keys(createSeedDatabase())) {
      if (collection !== 'version' && collection !== 'migratedAt') {
        ensureArray(snapshot, collection);
      }
    }
    this.database = clone(snapshot);
    return clone(this.database);
  }

  async exportDatabase() {
    await this.initialize();
    return clone(this.database);
  }

  async clear() {
    this.database = createSeedDatabase();
    return clone(this.database);
  }
}

export class LocalStorageAdapter extends MemoryStorageAdapter {
  constructor({ key = 'uniflow.database', seedFactory = createSeedDatabase } = {}) {
    super(seedFactory());
    this.key = key;
    this.seedFactory = seedFactory;
  }

  readRaw() {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.key);
  }

  writeRaw(snapshot) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(snapshot));
    }
  }

  async initialize() {
    const raw = this.readRaw();
    if (!raw) {
      this.database = this.seedFactory();
      this.writeRaw(this.database);
      return clone(this.database);
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.version !== DATABASE_VERSION) {
        this.database = this.seedFactory();
        this.writeRaw(this.database);
      } else {
        this.database = parsed;
      }
    } catch {
      this.database = this.seedFactory();
      this.writeRaw(this.database);
    }
    return clone(this.database);
  }

  async create(collection, record) {
    const result = await super.create(collection, record);
    this.writeRaw(this.database);
    return result;
  }

  async update(collection, id, changes) {
    const result = await super.update(collection, id, changes);
    this.writeRaw(this.database);
    return result;
  }

  async remove(collection, id) {
    const result = await super.remove(collection, id);
    this.writeRaw(this.database);
    return result;
  }

  async replaceDatabase(snapshot) {
    const result = await super.replaceDatabase(snapshot);
    this.writeRaw(this.database);
    return result;
  }

  async clear() {
    this.database = this.seedFactory();
    this.writeRaw(this.database);
    return clone(this.database);
  }
}
