import { APIGatewayProxyResult } from 'aws-lambda';
export class InternalServerErrorResponse implements APIGatewayProxyResult{
    statusCode: number = 500;
    headers?: { [header: string]: string | number | boolean; };
    multiValueHeaders?: { [header: string]: (string | number | boolean)[]; };
    body: string = ""
    isBase64Encoded?: boolean;

    constructor(body: string) {
        this.body = body;
    }
}