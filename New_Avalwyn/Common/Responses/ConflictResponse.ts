import { APIGatewayProxyResult } from 'aws-lambda';
export class ConflictResponse implements APIGatewayProxyResult{
    statusCode: number = 409
    headers?: { [header: string]: string | number | boolean; };
    multiValueHeaders?: { [header: string]: (string | number | boolean)[]; };
    body: string =""
    isBase64Encoded?: boolean;

    constructor(body?: string) {
        this.body = body;
    }
}