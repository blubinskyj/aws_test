'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createAuction = async (event) => {

    const {title} = event.body;

    const now = new Date();

    const auction = {
        id: uuid.v4(),
        title,
        status: 'OPEN',
        createdAt: now.toISOString(),
    };

    await dynamodb.put({
        TableName: 'AuctionsTable', Item: auction,
    }).promise();

    return {
        statusCode: 201, headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        }, body: JSON.stringify(auction),
    };

};

const handler = middy(createAuction)
    .use(httpJsonBodyParser())
    .use(httEventNormalizer())
    .use(httpErrorHandler())

module.exports = {handler}