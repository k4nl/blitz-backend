const sinon = require('sinon');
const { expect } = require('chai');


const userModels = require('../../models/userModels');
const userServices = require('../../services/userServices');

const taskModels = require('../../models/taskModels');
const taskServices = require('../../services/taskServices');

const m = require('../../utils/dictionary/errorMessages');
const e = require('../../utils/dictionary/status');

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

describe('Testando o user services', () => {

  describe('Testando o createUser', () => {

    describe('Quando nao existe um usuario com mesmo email cadastrado', () => {
      
      beforeEach(() => {
        sinon.stub(userModels, 'findUserByEmail').resolves(null);
        sinon.stub(userModels, 'createUser').resolves(newUser);
      });

      afterEach(() => {
        userModels.findUserByEmail.restore();
        userModels.createUser.restore();
      });
      
      it('Deve retornar o usuario criado', async () => {
        const userCreated = await userServices.createUser(newUser);

        expect(userCreated).to.be.a('object');
        expect(userCreated).to.have.property('_id');
        expect(userCreated.user.name).to.deep.equal(newUser.name);
        expect(userCreated.user.email).to.deep.equal(newUser.email);
      });
    });

    describe('Quando existe um usuario com mesmo email cadastrado', () => {
      
      beforeEach(() => {
        sinon.stub(userModels, 'findUserByEmail').resolves(userFound);
      });

      afterEach(() => {
        userModels.findUserByEmail.restore();
      });
      
      it('Deve retornar um erro', async () => {
        try {
            await userServices.createUser(newUser);
        } catch (error) {
          expect(error).to.deep.equal({ message: m.emailAlreadyExists, status: e.invalidRequest });
        }
      });
    });

    describe('Quando os dados sao invalidos', () => {

      describe('Quando o nome nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
              await userServices.createUser({ name: 123, password: '123456', email: 'email@email.com' });
          } catch (error) {
            expect(error).to.deep.equal({ message: '"name" must be a string', status: e.invalidRequest });
          }
        });
      });

      describe('Quando a senha nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
              await userServices.createUser({ name: 'gustavo', password: true, email: 'email@email.com' });
          } catch (error) {
            expect(error).to.deep.equal({ message: '"password" must be a string', status: e.invalidRequest });
          }
        });
      });

      describe('Quando a senha nao tem no minimo 6 caracteres', () => {
        it('Deve retornar um erro', async () => {
          try {
              await userServices.createUser({ name: 'gustavo', password: '123', email: 'email@email.com' });
          } catch (error) {
            expect(error).to.deep.equal(
              { message: '"password" length must be at least 6 characters long',
                status: e.invalidRequest
              }
            );
          }
        });
      });

      describe('Quando email nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
              await userServices.createUser({ name: 'gustavo', password: '123', email: 1234 });
          } catch (error) {
            expect(error).to.deep.equal({ message: '"email" must be a string',status: e.invalidRequest });
          }
        });
      });

      describe('Quando email nao eh um email', () => {
        it('Deve retornar um erro', async () => {
          try {
              await userServices.createUser({ name: 'gustavo', password: '123', email: 'gustavo' });
          } catch (error) {
            expect(error).to.deep.equal({ message: '"email" must be a valid email', status: e.invalidRequest });
          }
        });
      });
    });
  });

  describe('Testando o login', () => {

    describe('Quando existe o usuario cadastrado e as informacoes estao corretas ', () => {

      beforeEach(() => {
        sinon.stub(userModels, 'createUser').resolves(newUser);
        sinon.stub(userModels, 'findUserByEmail').resolves(userFound);
      });

      afterEach(() => {
        userModels.findUserByEmail.restore();
        userModels.createUser.restore();
      });

      it('Deve retornar o token do usuario conectado', async () => {
        const token = await userServices.login({ email: newUser.email, password: newUser.password });

        expect(token).to.be.an('object');
        expect(token.token).to.be.a('string');
      });

    });

    describe('Quando o usuario nao esta cadastrado ', () => {
  
      beforeEach(() => {
        
        sinon.stub(userModels, 'findUserByEmail').resolves(null);
      });
  
      afterEach(() => {
        userModels.findUserByEmail.restore();
        
      });
  
      it('Deve retornar um erro', async () => {
        try {
          await userServices.login({ email: newUser.email, password: newUser.password });
        } catch (error) {
          expect(error).to.deep.equal({ status: e.invalidRequest, message: m.userNotFound })
        }
      });
    });

    describe('Quando a senha do usuario esta incorreta', () => {

      beforeEach(() => {
        sinon.stub(userModels, 'findUserByEmail').resolves(userFound);
      });
  
      afterEach(() => {
        userModels.findUserByEmail.restore();
      });
    
      it('Deve retornar um erro', async () => {
        try {
          await userServices.login({ email: userFound.user.email, password: 'xablau' })
        } catch (error) {
          expect(error).to.deep.equal({ status: e.unauthorized, message: m.incorrectPassword })
        }
      });
    });

    describe('Quando os dados estao incorretos', () => {
      describe('Quando o email nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
            await userServices.login({ email: 1234, password: 'xablau' })
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"email" must be a string' })
          }
        });

      });

      describe('Quando o email nao eh um email', () => {
        it('Deve retornar um erro', async () => {
          try {
            await userServices.login({ email: 'gustavo', password: 'xablau' })
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"email" must be a valid email' })
          }
        });
      });

      describe('Quando a senha nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
            await userServices.login({ email: 'gustavo@gustavo.com', password: 123456 })
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"password" must be a string' })
          }
        });
      });

      describe('Quando a senha nao possui no minimo 6 caracteres', () => {
        it('Deve retornar um erro', async () => {
          try {
            await userServices.login({ email: 'gustavo@gustavo.com', password: '123' })
          } catch (error) {
            expect(error).to.deep.equal(
              {
                status: e.invalidRequest,
                message: '"password" length must be at least 6 characters long'
              }
            )
          }
        });
      });
    });
  });
});


describe('Testando o task services', () => {
  describe('Testando o createTask' , () => {
    describe(`
      Quando nao existe uma tafera com mesmo nome criada para um mesmo usuario,
      os dados estao corretamente passado,
      usuario esta logado`, () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskByName').resolves(null);
      });
  
      afterEach(() => {
        taskModels.getTaskByName.restore();
      });

      it('Deve poder criar a task com sucesso', async () => {
        const taskCreated = await taskServices.createTask(taskExample.task, taskExample.user);
        expect(taskCreated.task).to.deep.equal(taskExample.task);
        expect(taskCreated.user).to.deep.equal(taskExample.user);
      });
    });
    
    describe('Quando ja existe uma tarefa com o mesmo nome, para o mesmo usuario', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskByName').resolves(taskExample);
      });

      afterEach(() => {
        taskModels.getTaskByName.restore();
      });

      it('Deve retornar um erro', async () => {
        try {
          await taskServices.createTask(taskExample.task, taskExample.user);
        } catch (error) {
          expect(error).to.deep.equal({ status: e.invalidRequest, message: m.taskName });
        }
      });
    });

    describe('Quando as informacoes passadas estao incorretas', () => {
      describe('Quando o name nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ name: 123, description: '1', status: '1'}, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"name" must be a string' });
          }
        });
      });

      describe('Quando o name nao existe', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ description: '1', status: '1'}, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"name" is required' });
          }
        });
      });

      describe('Quando o description nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ name:'1', description: 1, status: '1'}, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"description" must be a string' });
          }
        });
      });

      describe('Quando o description nao existe', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ name:'1', status: '1'}, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"description" is required' });
          }
        });
      });

      describe('Quando o status nao existe', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ name:'1', description: '1' }, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"status" is required' });
          }
        });
      });

      describe('Quando o status nao eh uma string', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ name:'1', description: '1', status: 1 }, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"status" must be a string' });
          }
        });
      });

      describe('Quando o status eh diferente de em andamento, pronto ou pendente', () => {
        it('Deve retornar um erro', async () => {
          try {
            await taskServices.createTask({ name:'1', description: '1', status: 'xablau' }, taskExample.user);
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: m.invalidTaskStatus });
          }
        });
      });
    });
  });

  describe('Testando o getAllTasks', () => {
    describe('Quando usuario eh o admin', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getAllTasks').resolves([taskExample, taskExample2, taskExample3]);
      });

      afterEach(() => {
        taskModels.getAllTasks.restore();
      });
      it('Deve retornar as tasks de todos os usuarios', async() => {
        const tasks = await taskServices.getAllTasks(taskExample.user);
        expect(tasks).to.deep.equal([taskExample, taskExample2, taskExample3]);
      })
    });

    describe('Quando eh um usuario normal', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getAllTasksByUser').resolves([taskExample2, taskExample3]);
      });

      afterEach(() => {
        taskModels.getAllTasksByUser.restore();
      });
      it('Deve retornar todas as tasks do usuario', async() => {
        const tasks = await taskServices.getAllTasks(taskExample2.user);
        expect(tasks).to.deep.equal([taskExample2, taskExample3]);
      });
    });
  });

  describe('Testando o updateTasks', () => {
    describe('Quando o usuario eh admin', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample);
        sinon.stub(taskModels, 'updateTask').resolves({ status: 'xablau' });
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
        taskModels.updateTask.restore();
      });

      it('Deve ser possivel atualizar sua propria task', async () => {
        const { task } = await taskServices.updateTask({ status: 'xablau'}, taskExample.user, taskExample._id);
        expect(task.status).to.not.equal(taskExample.task.status);
      });

    });

    describe('Quando o usuario eh admin', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample2);
        sinon.stub(taskModels, 'updateTask').resolves({ status: 'xablau' });
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
        taskModels.updateTask.restore();
      });

      it('Deve ser possivel atualizar a task de um usuario', async () => {
        const { task } = await taskServices.updateTask({ status: 'xablau'}, taskExample.user, taskExample2._id);
        expect(task.status).to.not.equal(taskExample2.task.status);
      });
    });

    describe('Quando eh um usuario normal', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample2);
        sinon.stub(taskModels, 'updateTask').resolves({ status: 'xablau' });
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
        taskModels.updateTask.restore();
      });

      it('Deve ser possivel atualizar sua propria task', async () => {
        const { task } = await taskServices.updateTask({ status: 'xablau'}, taskExample2.user, taskExample2._id);
        expect(task.status).to.not.equal(taskExample2.task.status);
      });
    });

    describe('Quando nao existe a task', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(null);
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
      });

      it('Nao deve ser possivel atualizar uma task que nao existe', async () => {
        try {
          await taskServices.updateTask({ status: 'xablau'}, taskExample2.user, taskExample2._id)
        } catch (error) {
          expect(error).to.deep.equal({ status: e.notFound, message: m.taskNotFound });
        }
      });
    });

    describe('Quando o usuario normal nao eh dono da task', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample);
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
      });

      it('Nao deve ser possivel atualizar uma task que nao eh dono da task', async () => {
        try {
          await taskServices.updateTask({ status: 'xablau'}, taskExample2.user, taskExample2._id)
        } catch (error) {
          expect(error).to.deep.equal({ status: e.unauthorized, message: m.unauthorized });
        }
      });
    });

    describe('Quando as informacoes sao invalidas', () => {
      describe('Quando o status eh invalido', () => {
        it('Quando o status nao eh uma string', async () => {
          try {
            await taskServices.updateTask({ status: 1 }, taskExample2.user, taskExample2._id)
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"status" must be a string' });
          }
        });
        it('Quando o status nao existe', async () => {
          try {
            await taskServices.updateTask( taskExample2.user, taskExample2._id)
          } catch (error) {
            expect(error).to.deep.equal({ status: e.invalidRequest, message: '"status" is required' });
          }
        });
      })
    });
  });

  describe('Testando o deleteTasks', () => {
    describe('Quando a task existe, o usuario eh dono da task', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample2);
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
      });

      it('O usuario deve conseguir excluir a task', async() => {
        const taskDeleted = await taskServices.deleteTask(taskExample2.user, taskExample2._id);
        expect(taskDeleted).to.deep.equal(taskExample2);
      });
    });

    describe('Quando a task existe, o admin nao dono da task', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample2);
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
      });

      it('O admin deve conseguir excluir a task', async() => {
        const taskDeleted = await taskServices.deleteTask(taskExample.user, taskExample2._id);
        expect(taskDeleted).to.deep.equal(taskExample2);
      });
    });

    describe('Quando a task existe, o usuario nao dono da task', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(taskExample2);
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
      });

      it('O usuario nao deve conseguir excluir a task', async() => {
        try {
          await taskServices.deleteTask(taskExample4.user, taskExample2._id);
          
        } catch (error) {
          expect(error).to.deep.equal({ status: e.unauthorized, message: m.unauthorized })
        }
      });
    });

    describe('Quando a nao existe', () => {
      beforeEach(() => {
        sinon.stub(taskModels, 'getTaskById').resolves(null);
      });

      afterEach(() => {
        taskModels.getTaskById.restore();
      });

      it('Nao eh possivel excluir a task', async() => {
        try {
          await taskServices.deleteTask(taskExample4.user, taskExample2._id);
        } catch (error) {
          expect(error).to.deep.equal({ status: e.notFound, message: m.taskNotFound })
        }
      });
    });
  });
});
