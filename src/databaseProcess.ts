const { v4: uuidv4, validate: isUuid } = require('uuid');

interface UserData {
  username: string;
  age: number;
  hobbies: string[]
}

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[]
}

class UsersDB {
  users: User[]

  constructor() {
    this.users = []
  }

  getAllUsers() {
    return { code: 200, data: this.users }
  }

  getUser(userId: string) {
    if (this.users.some(({ id }) => id === userId)) {
      return { code: 200, data: this.users.filter(({ id }) => id === userId)[0] };
    } else if (!isUuid(userId)) {
      return { code: 400, message: 'Uuid format invalid' };
    } else {
      return { code: 404, message: `User with id: ${userId} not exist` };
    }
  }

  addUser(userData: UserData) {
    const checkFields = (data: UserData) => {
      return !!(data?.age && data?.username && data?.hobbies);
    }
    if (checkFields(userData)) {
      const newUser = { ...userData, id: uuidv4() }
      this.users.push(newUser);
      return { code: 201, data: newUser }
    } else {
      return { code: 400, message: `Request body does not contain required fields` }
    }
  }

  updateUser(userId: string, userdata: UserData) {
    if (!isUuid(userId)) {
      return { code: 400 }
    } else if (!this.users.some(({ id }) => id === userId)) {
      return { code: 404, message: `User with id: ${userId} not exist` }
    } else {
      const index = this.users.findIndex(({ id }) => id === userId);
      this.users[index] = { ...this.users[index], ...userdata };
      return { code: 200, data: this.users[index] }
    }
  }

  deleteUser(userId: string) {
    if (this.users.some(({ id }) => id === userId)) {
      this.users = this.users.filter(({id}) => id !== userId);
      return { code: 204, message: `User ${userId} deleted` };
    } else if (!isUuid(userId)) {
      return { code: 400, message: 'Uuid format invalid' };
    } else {
      return { code: 404, message: `User with id: ${userId} not exist` };
    }
  }
}


interface DBRequest {
  method: string;
  uuid?: string;
  data?: UserData;
  workerId?: number;
}

export interface DBResponse {
  code: number;
  data?: {};
  message?: string;
  workerId?: number;
}

const userDB = new UsersDB();

process.on('message', (req: DBRequest) => {
  const { method, uuid, data, workerId } = req;

  if (method === 'GET' && !uuid) {
    process.send && process.send({...userDB.getAllUsers(), workerId });
  } else if (method === 'GET' && uuid) {
    process.send && process.send({...userDB.getUser(uuid), workerId});
  } else if (method === 'POST') {
    process.send && process.send({...userDB.addUser(data!), workerId});
  } else if (method === 'PUT') {
    process.send && process.send({...userDB.updateUser(uuid!, data!), workerId});
  } else if (method === 'DELETE') {
    process.send && process.send({...userDB.deleteUser(uuid!), workerId});
  }

});
