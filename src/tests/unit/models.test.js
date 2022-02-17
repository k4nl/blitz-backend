const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient, ObjectId } = require('mongodb');

const getConnection = require('./mongoConnection');

const taskModels = require('../../models/taskModels');
const userModels = require('../../models/userModels');
const connection = require('./mongoConnection');

const taskExample = {
  _id: '620c23a39baf59d051bc07a6',
  task: {
    name: 'problema1',
    description: 'estou cansado',
    status: 'em andamento'
  },
  user: {
    id: '620c22c3fe1bda8ab399c7ad',
    email: 'admin@blitz.com'
  }
};

const taskExample2 = {
  _id: '620c24059605b2d0e7787073',
  task: {
    name: 'problema1',
    description: 'estou cansado',
    status: 'em andamento'
  },
  user: {
    id: '620c23ee9605b2d0e7787072',
    email: 'gustavo@blitz.com'
  }
}

const taskExample3 = 	{
  _id: '620c31f4f6240d026f0141e8',
  task: {
    name: 'problema1234',
    description: 'estou cansado',
    status: 'em andamento'
  },
  user: {
    id: '620c23ee9605b2d0e7787072',
    email: 'gustavo@blitz.com'
  }
}

const userExample = {
	name: 'Gustavo1',
	email: 'gustav1o@blitz.com',
	password: '123456'
};

const userAdmin = {
  name: 'admin',
  email: 'admin@blitz.com',
  password: '123456',
};

const newUser = {
  name: 'Gustavo Braga',
  email: 'gustavo@blitz.com',
  password: '123456',
};


describe('Testando o userModel', () => {
  let connectionMock;
  
  beforeEach(async () => {
    connectionMock = await connection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    await connectionMock.db('Blitz').collection('users').insertOne(
      {'user': { 'name': 'admin', 'email': 'admin@blitz.com', 'password': '123456' } },
    )
  });

  afterEach(async () => {
    await connectionMock.db('Blitz').collection('users').drop();
    await MongoClient.connect.restore();
  });

  describe('Testando o userModels.create', () => {
    it('Se e possivel criar um um usuario', async () => {
      const { ops } = await userModels.createUser(newUser);
      const user = ops[0].user;
      expect(user).to.not.be.null;
      expect(user).to.deep.equal(newUser);
    });
  });

  describe('Testando o userModels.findUserByEmail', () => {
    it('Se é possivel criar achar um usuario com email', async () => {
      const userData = await userModels.findUserByEmail(userAdmin.email);
      const { user } = userData;
      expect(userData).to.not.be.null;
      expect(user).to.deep.equal(userAdmin);
    });

    it('Se o email nao estiver registrado', async () => {
      const userData = await userModels.findUserByEmail(userExample.email);
      expect(userData).to.be.null;
    });
  });

});

describe('Testando o taskModel', () => {
  let connectionMock;
  let taskOps;
  let taskId1;
  let taskId2;
  
  beforeEach(async () => {
    connectionMock = await connection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    const task2 = await connectionMock.db('Blitz').collection('tasks').insertOne(
      { task: taskExample2.task, user: taskExample2.user }
    );
    const task1 = await connectionMock.db('Blitz').collection('tasks').insertOne(
      { task: taskExample.task, user: taskExample.user }
    );

    await connectionMock.db('Blitz').collection('tasks').insertOne(
      { task: taskExample3.task, user: taskExample3.user }
    );
    taskOps = task1.ops[0];
    taskId1 = task1.ops[0]._id;
    taskId2 = task2.ops[0]._id;
  });

  afterEach(async () => {
    await connectionMock.db('Blitz').collection('tasks').drop();
    await MongoClient.connect.restore();
  });

  describe('Testando o taskModel.createTask', () => {
    it('Se e possivel criar uma task', async () => {
      const { ops } = await taskModels.createTask(taskExample.task, taskExample.user);
      const task = ops[0];
      expect(task).to.not.be.null;
      expect(task.task).to.deep.equal(taskExample.task);
      expect(task.user).to.deep.equal(taskExample.user);
    });
  });

  describe('Testando o taskModel.getTaskByName', () => {
    it('Se e possivel, com o usuario logado, pegar a task pelo nome', async () => {
      const task = await taskModels.getTaskByName(taskExample.task.name, taskExample.user.id);
      expect(task.user).to.deep.equal(taskExample.user);
    });
  });

  describe('Testando o taskModel.getAllTasks', () => {
    it('Se e possivel pegar todas as tasks se voce for o admin', async () => {
      const tasks = await taskModels.getAllTasks();
      expect(tasks).to.be.an('array');
      expect(tasks[0]._id).to.deep.equal(taskId2);
      expect(tasks[1]._id).to.deep.equal(taskId1);
    });
  });

  describe('Testando o taskModel.getAllTasksByUser', () => {
    it('Se o usuario recebera todas e somente as suas tasks', async () => {
      const tasks = await taskModels.getAllTasksByUser(taskExample3.user.id);
      expect(tasks).to.be.an('array');
      expect(tasks).to.have.lengthOf(2);
      expect(tasks[0].user.id).to.deep.equal(taskExample3.user.id);
      expect(tasks[1].user.id).to.deep.equal(taskExample3.user.id);
    });
  });

  describe('Testando o taskModel.getTaskById', () => {
    it('Se e possivel pegar a task pelo id', async () => {
      const task = await taskModels.getTaskById(taskId1);
      const task2 = await taskModels.getTaskById(taskId2);
      expect(task.task).to.deep.equal(taskExample.task);
      expect(task2.task).to.deep.equal(taskExample2.task);
      expect(task._id).to.deep.equal(taskId1);
      expect(task2._id).to.deep.equal(taskId2);
      expect(task._id).to.not.equal(taskId2);
      expect(task2._id).to.not.equal(taskId1);
      expect(task.user).to.deep.equal(taskExample.user);
      expect(task2.user).to.deep.equal(taskExample2.user);
    });
  });

  describe('Testando o taskModel.updateTask', () => {
    it('Se e possivel atualizar as tasks', async () => {
      const { ops } = await taskModels.createTask(taskExample.task, taskExample.user);
      const taskCreated = ops[0].task.status;
      const tasks = await taskModels.updateTask(taskCreated._id, 'pronto');
      expect(taskCreated).to.deep.equal('em andamento');
      expect(tasks).to.deep.equal('pronto');
      expect(tasks).to.not.equal(taskCreated);
      
    });
  });

  describe('Testando o taskModel.deleteTask', () => {
    it('Se e possivel deletar a task selecionada', async () => {
      const allTasks = await taskModels.getAllTasks();
      await taskModels.deleteTask(taskId1);
      const allTasksAfterDeleted = await taskModels.getAllTasks();
      expect(allTasks).to.have.lengthOf(3);
      expect(allTasksAfterDeleted).to.have.lengthOf(2);
    });
  });

});
