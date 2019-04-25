import cdk = require('@aws-cdk/cdk');
import cloudformation = require('@aws-cdk/aws-cloudformation');
import s3 = require('@aws-cdk/aws-s3');
import { Lambda } from './lambda';

export interface CloudFormationProps {
    QSS3BucketName: string;
    QSS3KeyPrefix: string;
    TemplateURL:string;
    ArtifactBucket: s3.Bucket;
}
export class CloudFormation extends cdk.Construct {
    Stack: cloudformation.CfnStack;
    constructor(parent: cdk.Construct, name: string, templateURL: string, props: any) {
        super(parent, name);
        this.Stack = new cloudformation.CfnStack(this, 'NestedStack', {
            templateUrl: templateURL,
            parameters: props
        });
    }
}