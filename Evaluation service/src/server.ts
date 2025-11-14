import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
import { startWorkers } from './workers/evaluation.worker';
import { runCode } from './utils/containers/codeRunner.util';
import { CPP_IMAGE, PYTHON_IMAGE } from './utils/constants';
// import { pullAllImages } from './utils/containers/pullImage.util';
const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); 


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, async() => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);

    await startWorkers();

    // await pullAllImages();

    await testPythonCode();

    await testCPPCode();
});

async function testPythonCode() {
    const pythonCode = `
    
for i in range(5):
    print(f"Counting: {i}")
print("Hello from inside the Docker container!")
    `;

    await runCode({
        code: pythonCode,
        language: 'python',
        timeout: 1000,
        imageName: PYTHON_IMAGE,
        input: ''
    });
}

async function testCPPCode() {
    // CPP code to return square of a number
    const cppCode = `
#include <iostream>
using namespace std;
int main() {
    int num;
    cin >> num;
    cout << num * num << endl;
    return 0;
}
    `;

    await runCode({
        code: cppCode,
        language: 'cpp',
        timeout: 1000,
        imageName: CPP_IMAGE,
        input: '6'
    });
}