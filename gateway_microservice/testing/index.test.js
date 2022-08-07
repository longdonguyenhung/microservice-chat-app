import nock from 'nock';

const scope = nock('/localhost\:8083/')
  .get('/session')
  .reply(200, {
    user: [1,2,3,4]
  })