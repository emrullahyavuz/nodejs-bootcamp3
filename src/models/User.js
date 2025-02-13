const fs = require('fs');
const path = require('path');

class User {
  constructor() {
    this.filePath = path.join(__dirname, '..', '..', 'data.json');
  }

  readData() {
    const jsonData = fs.readFileSync(this.filePath);
    return JSON.parse(jsonData);
  }

  writeData(users) {
    fs.writeFileSync(this.filePath, JSON.stringify(users, null, 2));
  }

  findAll() {
    return this.readData();
  }

  findById(id) {
    return this.readData().find((user) => user.id === Number(id));
  }

  create(user) {
    const users = this.readData();
    users.push(user);
    this.writeData(users);
    return user;
  }

  update(id, updatedData) {
    const users = this.readData();
    const updatedUsers = users.map((user) =>
      user.id === Number(id) ? { ...user, ...updatedData } : user
    );
    this.writeData(updatedUsers);
    return this.findById(id);
  }

  delete(id) {
    const users = this.readData();
    const filteredUsers = users.filter((user) => user.id !== Number(id));
    this.writeData(filteredUsers);
    return true;
  }
}

module.exports = new User();
