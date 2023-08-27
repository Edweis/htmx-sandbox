import fs from 'fs/promises';

export class Database {
  constructor(filePath) {
    this.filePath = filePath
  }
  async getAll() {
    const file = await fs.readFile(this.filePath);
    const lines = file.toString().split('\n');
    const objects = lines.filter(l => l !== '').map(l => JSON.parse(l));
    return objects
  }

  async get(id) {
    const objects = await this.getAll();
    return objects.find(o => o.id === id)
  }

  async insert(object) {
    const id = object.id || Math.floor( Math.random() * 1_000_000).toString()
    return fs.appendFile(this.filePath,'\n'+ JSON.stringify({ ...object, id }));
  }

  async remove(id) {
    const lines = await this.getAll();
    const nextLines = lines.filter(obj => obj.id !== id)
    const nextFile = nextLines.map(l => JSON.stringify(l)).join('\n')
    await fs.writeFile(this.filePath, nextFile)
  }
}