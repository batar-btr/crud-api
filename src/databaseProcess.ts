import { v4 as uuidv4, validate as isUuid } from 'uuid';

console.log('From database', process.pid)

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
    this.users = [
      {
        "username": "John",
        "age": 25,
        "hobbies": [
          "sport"
        ],
        "id": "611d3866-9129-48a8-81dd-53fce983f966"
      },
      {
        "username": "Peter",
        "age": 25,
        "hobbies": [
          "sport"
        ],
        "id": "b0c9d7aa-47c9-42a5-baf9-dd3494f7233a"
      }
    ]
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
  data?: UserData
}

export interface DBResponse {
  code: number;
  data?: {};
  message?: string;
}

const userDB = new UsersDB();

process.on('message', (req: DBRequest) => {
  const { method, uuid, data } = req;

  if (method === 'GET' && !uuid) {
    process.send && process.send(userDB.getAllUsers());
  } else if (method === 'GET' && uuid) {
    process.send && process.send(userDB.getUser(uuid));
  } else if (method === 'POST') {
    process.send && process.send(userDB.addUser(data!));
  } else if (method === 'PUT') {
    process.send && process.send(userDB.updateUser(uuid!, data!));
  } else if (method === 'DELETE') {
    process.send && process.send(userDB.deleteUser(uuid!));
  }

});
