'use strict';

const AWS = require('aws-sdk');
const middy = require('@middy/core');
const httpJsonBodyParser = require('@middy/http-json-body-parser');
const httEventNormalizer = require('@middy/http-event-normalizer');
const httpErrorHandler = require('@middy/http-error-handler');
const createError = require('http-errors')

const dynamodb = new AWS.DynamoDB.DocumentClient();

const getAuction = async (event) => {
    let auction;
    const { id } = event.pathParameters;

    try {
        const result = await dynamodb.get({
            TableName: 'AuctionsTable', Key: {id},
        }).promise();

        auction = result.Item
    } catch (error) {
        console.log(error);
        throw new createError(500);
    }

    if (!auction) {
        throw new createError(404)
    }

    return {
        statusCode: 200, headers: {
            'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        }, body: JSON.stringify(auction),
    };

};

const handler = middy(getAuction)
    .use(httpJsonBodyParser())
    .use(httEventNormalizer())
    .use(httpErrorHandler())

module.exports = {handler}