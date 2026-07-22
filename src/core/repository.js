export class Repository {
  constructor(adapter, collectionName) {
    this.adapter = adapter;
    this.collectionName = collectionName;
  }

  async list({ includeArchived = false } = {}) {
    const records = await this.adapter.getCollection(this.collectionName);
    return includeArchived ? records : records.filter((record) => record.status !== 'archived');
  }

  async getById(id) {
    return this.adapter.getById(this.collectionName, id);
  }

  async create(record) {
    return this.adapter.create(this.collectionName, record);
  }

  async update(id, changes) {
    return this.adapter.update(this.collectionName, id, changes);
  }

  async archive(id) {
    return this.update(id, { status: 'archived' });
  }

  async remove(id) {
    return this.adapter.remove(this.collectionName, id);
  }

  async where(criteria = {}) {
    const entries = Object.entries(criteria);
    const records = await this.list({ includeArchived: true });
    return records.filter((record) => entries.every(([key, value]) => record[key] === value));
  }

  async findBy(key, value) {
    const records = await this.where({ [key]: value });
    return records[0] ?? null;
  }
}
