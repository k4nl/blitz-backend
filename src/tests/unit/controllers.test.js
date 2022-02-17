const Joi = require('@hapi/joi');
const sinon = require('sinon');
const { expect } = require('chai');

const userModels = require('../../models/userModels');
const userServices = require('../../services/userServices');
const userControllers = require('../../controllers/userControllers');

const taskModels = require('../../models/taskModels');
const taskServices = require('../../services/taskServices');
const taskControllers = require('../../controllers/taskControllers');

const m = require('../../utils/dictionary/errorMessages');
const e = require('../../utils/dictionary/status');

const token = {
	token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiNjIwZDM3ZmZmNGQ5MDFhNmRmNWQ1N2M5IiwiZW1haWwiOiJhZG1pbkBibGl0ei5jb20ifSwiaWF0IjoxNjQ1MDQ0Nzk1LCJleHAiOjE2NDUwNDgzOTV9.6mGGcs6LpXa6JSAqdHTEmIwbJvRHf_7GReZOQlNhAME"
}

const taskExample = {
  _id: '620c23a39baf59d051bc07a6',
  task: {
    name: 'problema 42',
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

const taskExample4 = 	{
  _id: '620c31f4f6240d026f0141e8',
  task: {
    name: 'problema1234',
    description: 'estou cansado',
    status: 'em andamento'
  },
  user: {
    id: '620c23ee9605bee0e7787072',
    email: 'gustavo123@blitz.com'
  }
}

const userFound = {
  _id: '620d1e752b073482fbf65cdc',
  user: { name: 'gustavo', email: 'gustavo1@blitz.com', password: '123456' }
}

const userAdmin = {
  name: 'admin',
  email: 'admin@blitz.com',
  password: '123456',
};

const newUser = {
  name: 'Gustavo Braga',
  email: 'gustavo1@blitz.com',
  password: '123456',
};

describe('Testando o user controllers', () => {
  describe('Testando a funcao createUser', () => {
    describe('Quando eh possivel criar o usuario', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.body = newUser;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(userServices, 'createUser').resolves(userFound);
      });

      afterEach(() => {
        userServices.createUser.restore();
      });

      it('O status deve ser 201', async() => {
        await userControllers.createUser(request, response);
        expect(response.status.calledWith(201)).to.be.true;
      });
    });

    describe('Quando nao eh possivel criar um usuario', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.body = {};
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
      });

      it('Com os dados invalidos', async() => {
        await userControllers.createUser(request, response);
        expect(response.status.calledWith(422)).to.be.true;
      });
    });
  });

  describe('Testando a funcao login', () => {
    describe('Quando eh possivel fazer login', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.body = { email: userAdmin.email, password: userAdmin.password };
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(userServices, 'login').resolves(token);
      });

      afterEach(() => {
        userServices.login.restore();
      });

      it('O status deve ser 200', async() => {
        await userControllers.login(request, response);
        expect(response.status.calledWith(200)).to.be.true;
      });
    });

    describe('Quando nao eh possivel fazer login', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.body = { email: userAdmin.email, password: 'xablau' };
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
      });

      it('Com os dados invalidos', async() => {
        await userControllers.login(request, response);
        expect(response.status.calledWith(401)).to.be.true;
      });
    });
  });
});

describe('Testando o task controllers', () => {
  describe('Testando a funcao createTask', () => {
    describe('Quando os dados estao certos', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.body = taskExample.task;
        request.user = taskExample.user;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'createTask').resolves(taskExample);
      });

      afterEach(() => {
        taskServices.createTask.restore();
      });

      it('Devera criar a tarefa', async() => {
        await taskControllers.createTask(request, response);
        expect(response.status.calledWith(201)).to.be.true;
      });
    });

    describe('Quando os dados da task estao errados', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.body = { name: 'xablau', description: '123', status:'xablau' };
        request.user = taskExample.user;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
      });

      it('Devera ter um erro', async() => {
        await taskControllers.createTask(request, response);
        expect(response.status.calledWith(422)).to.be.true;
      });
    });
  });

  describe('Testando a funcao getAllTasks', () => {
    describe('Quando os dados estao certos', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample.user;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'getAllTasks').resolves([taskExample, taskExample2]);
      });

      afterEach(() => {
        taskServices.getAllTasks.restore();
      });

      it('O usuario consegue receber as tasks', async() => {
        await taskControllers.getAllTasks(request, response);
        expect(response.status.calledWith(200)).to.be.true;
      });
    });
  });

  describe('Testando a funcao updateTask', () => {
    describe('Quando os dados estao certos', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample.user;
        request.body = taskExample.task;
        request.params = taskExample._id;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'updateTask').resolves(taskExample);
      });

      afterEach(() => {
        taskServices.updateTask.restore();
      });

      it('O usuario consegue atualizar a task', async() => {
        await taskControllers.updateTask(request, response);
        expect(response.status.calledWith(200)).to.be.true;
      });
    });

    describe('Quando os dados de usuario estao errados', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample2.user;
        request.body = taskExample.task;
        request.params = taskExample._id;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'updateTask').throws({ status: e.unauthorized, message: m.unauthorized })
      })

      afterEach(() => {
        taskServices.updateTask.restore();
      })

      it('O usuario nao consegue atualizar a task que nao eh dele', async() => {
        await taskControllers.updateTask(request, response);
        expect(response.status.calledWith(401)).to.be.true;
      });
    });

    describe('Quando a task nao existe', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample.user;
        request.body = taskExample.task;
        request.params = 'xablau';
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'updateTask').throws({ status: e.notFound, message: m.userNotFound })
      })

      afterEach(() => {
        taskServices.updateTask.restore();
      })

      it('O usuario nao consegue atualizar a task que nao existe', async() => {
        await taskControllers.updateTask(request, response);
        expect(response.status.calledWith(e.notFound)).to.be.true;
      });
    });

    describe('Quando os dados da task sao invalidos', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample.user;
        request.body = taskExample.task;
        request.params = 'xablau';
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'updateTask').throws({ status: e.invalidRequest, message: '"status" is required' })
      })

      afterEach(() => {
        taskServices.updateTask.restore();
      })

      it('O usuario nao consegue atualizar a task que nao possui o parametro passado', async() => {
        await taskControllers.updateTask(request, response);
        expect(response.status.calledWith(e.invalidRequest)).to.be.true;
      });
    });
  });

  describe('Testando a funcao deleteTask', () => {
    describe('Quando os dados estao certos', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample.user;
        request.params = taskExample._id;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'deleteTask').resolves(taskExample);
      });

      afterEach(() => {
        taskServices.deleteTask.restore();
      });

      it('O usuario consegue receber as tasks', async() => {
        await taskControllers.deleteTask(request, response);
        expect(response.status.calledWith(200)).to.be.true;
      });
    });

    describe('Quando nao eh permitido o usuario deletar uma task que nao eh dele', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample2.user;
        request.params = taskExample._id;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'deleteTask').throws({ status: e.unauthorized, message: m.unauthorized });
      });
      afterEach(() => {
        taskServices.deleteTask.restore();
      });
      it('O usuario nao consegue deletar a task', async() => {
        await taskControllers.deleteTask(request, response);
        expect(response.status.calledWith(401)).to.be.true;
      });
    });

    describe('Quando nao eh permitido o usuario deletar uma task que nao eh dele', () => {
      const response = {};
      const request = {};
      
      beforeEach(() => {
        request.user = taskExample.user;
        request.params = taskExample._id;
        response.status = sinon.stub().returns(response);
        response.json = sinon.stub().returns();
        sinon.stub(taskServices, 'deleteTask').throws({ status: e.unauthorized, message: m.unauthorized });
      });

      afterEach(() => {
        taskServices.deleteTask.restore();
      });

      it('O usuario nao consegue deletar a task', async() => {
        await taskControllers.deleteTask(request, response);
        expect(response.status.calledWith(401)).to.be.true;
      });
    });
  });
});