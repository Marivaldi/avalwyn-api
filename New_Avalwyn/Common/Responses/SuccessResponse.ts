import { APIGatewayProxyResult } from 'aws-lambda';
export class SuccessResponse implements APIGatewayProxyResult{
    statusCode: number = 200
    headers?: { [header: string]: string | number | boolean; };
    multiValueHeaders?: { [header: string]: (string | number | boolean)[]; };
    body: string;
    isBase64Encoded?: boolean;

    constructor(body: any) {
        this.body = JSON.stringify(body, null, 2);
    }
}