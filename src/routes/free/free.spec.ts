import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../server';
import { connection } from '../../services/Postgres/connection';

// el estilo de las pruebas
chai.should();
chai.use(chaiHttp);
const { request } = chai;

describe('Free routes', () => {
  it('should be ready', async () => {
    const response = await request(server)
      .get('/free/ping');

    response.should.have.status(200);
  });

  before(async () => {
    await connection.query('insert into carrera(id, nombre) values (0, \'carrera de prueba\');');
    await connection.query(`
        insert into usuario values 
        (0, 'prueba', 'usuario', 0, crypt('test password', gen_salt('bf')), 'meetinguvg@gmail.com');
    `);
  });

  after(async () => {
    await connection.query('delete from usuario where carne = 0;');
    await connection.query('delete from carrera where id = 0;');
  });

  describe('GET /login', async () => {
    it('should validate the request body', async () => {
      const response = await request(server)
        .post('/free/login');

      response.should.have.status(400);
    });

    it('should fail if the user enters the wrong password', async () => {
      const response = await request(server)
        .post('/free/login')
        .send({ carne: 0, password: 'fake password' });

      response.should.have.status(403);
    });

    it('should fail if the user enters a not existing account', async () => {
      const response = await request(server)
        .post('/free/login')
        .send({ carne: -1, password: 'test password' });

      response.should.have.status(403);
    });

    it('should log in the user', async () => {
      const response = await request(server)
        .post('/free/login')
        .send({ carne: 0, password: 'test password' });

      response.should.have.status(200);
    });
  });

  describe('GET /carrera', () => {
    it('should return career objects', async () => {
      const response = await request(server)
        .get('/free/carrera');

      response.should.have.status(200);
    });

    it('should return career objects containing the search term', async () => {
      const response = await request(server)
        .get('/free/carrera/arrera de prueb');

      response.body.should.be.an('array').with.length(1);
      response.should.have.status(200);
    });
  });

  describe('GET /hobby', async () => {
    it('should return hobby objects', async () => {
      const response = await request(server)
        .get('/free/hobby');

      response.should.have.status(200);
    });

    it('should return hobby objects containing the search term', async () => {
      const response = await request(server)
        .get('/free/hobby/thishobbydoesnotexist');

      response.body.should.be.an('array').with.length(0);
      response.should.have.status(200);
    });
  });

  describe('GET /curso', async () => {
    it('should return course objects', async () => {
      const response = await request(server)
        .get('/free/curso');

      response.should.have.status(200);
    });

    it('should return course objects containing the search term', async () => {
      const response = await request(server)
        .get('/free/curso/thiscoursedoesnotexist');

      response.body.should.be.an('array').with.length(0);
      response.should.have.status(200);
    });
  });

  describe('GET /profile/:carne', async () => {
    it('should return the user profile', async () => {
      const response = await request(server)
        .get('/free/profile/0');

      response.should.have.status(200);
    });

    it('should validate the parameters', async () => {
      const response = await request(server)
        .get('/free/profile/a');

      response.should.have.status(400);
    });

    it('should check if the user exists', async () => {
      const response = await request(server)
        .get('/free/profile/1');

      response.should.have.status(403);
    });
  });
});
