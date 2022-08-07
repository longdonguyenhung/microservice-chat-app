const fetch = require("./fetchConfig");
const createConnection = require('../create_gateway');

jest.mock('./fetchConfig', () => {
    return {
        baseURL: 'localhost:8083/data',
        request: jest.fn().mockResolvedValue({
            data: [
                {
                    
                }
            ]
        }),
    }
})