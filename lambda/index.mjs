import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import crypto from 'crypto'
const querystring = require('node:querystring');
import https from 'https';
import { CodeBuildClient, StartBuildCommand } from "@aws-sdk/client-codebuild";

export const handler = async (event) => {
    console.log(JSON.stringify(event, null, 2));
    const body = event["body"];

    if(!isValidSignature(body, event.headers["X-Hub-Signature-256"])) {
        console.log("is not valid")
        return {
            statusCode: 200,
            body: "is not valid",
        };
    }

    const parsedQuery = querystring.parse(body);
    const payload = JSON.parse(parsedQuery.payload)
    console.log(payload);
    if(payload.action != "queued") {
        console.log("not queued")
        return {
            statusCode: 200,
            body: "not queued",
        };
    }

    if(!payload.workflow_job.labels.includes("self-hosted")) {
        console.log("not self hosted")
        return {
            statusCode: 200,
            body: "not self hosted",
        };
    }

    const jitconfig = await generateJitConfig(
        payload.repository.full_name,
        payload.workflow_job.labels,
        payload.workflow_job.id,
    );
    console.log(`jitconfig: ${JSON.stringify(jitconfig, null, 2)}`);

    const codeBuildResponse = await startCodeBuild(
        payload.repository.full_name.split("/")[0],
        payload.repository.full_name.split("/")[1],
        jitconfig.encoded_jit_config,
    );
    console.log(`codeBuildResponse: ${JSON.stringify(codeBuildResponse, null, 2)}`);

    console.log(`finish`);
    return {
        statusCode: 200,
        body: "ok",
    };
};

function isValidSignature(body, signature) {
    const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
    hmac.update(body, 'utf8')
    const checkSignature = `sha256=${hmac.digest('hex')}`
    console.log(`${checkSignature} === ${signature}`)
    return checkSignature === signature
}

async function generateJitConfig(repositoryFullName, labels, id) {
    return new Promise((resolve, reject) => {
        const request = https.request({
            method: "POST",
            host: 'api.github.com',
            port: "443",
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Authorization": `Bearer ${process.env["GITHUB_TOKEN"]}`,
                "User-Agent": "awslambda"
            },
            path: `/repos/${repositoryFullName}/actions/runners/generate-jitconfig`,
        }, (response) => { 
            let data = ''; 

            response.on('data', (chunk) => { 
                data += chunk; 
            }); 
            response.on('end', () => { 
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(new Error(err));
                }
            }); 
        }
        );
        request.on('error', err => {
            reject(new Error(err));
        });
        request.write(JSON.stringify({
            "name": `CodeBuild-${id}`,
            "runner_group_id": 1,
            "labels": labels,
            "work_folder": "work"
        }));
        request.end();
    })
}

async function startCodeBuild(org, name, encodedJitconfig) {
    const codeBuildClient = new CodeBuildClient({});
    const response = await codeBuildClient.send(
        new StartBuildCommand({
            projectName: process.env.CODE_BUILD_PROJECT_NAME,
            environmentVariablesOverride: [
                {
                    name: "ENCODED_JIT_CONFIG",
                    value: encodedJitconfig,
                    type: "PLAINTEXT",
                },
            ]
        }),
    );

    return response;
}
