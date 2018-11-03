import cdk = require('@aws-cdk/cdk');
import { cloudformation } from '@aws-cdk/aws-cloudformation';
import s3 = require('@aws-cdk/aws-s3');
import { Lambda } from './lambda';

export interface CloudFormationProps {
    QSS3BucketName: string;
    QSS3KeyPrefix: string;
    ArtifactBucket: s3.BucketRefProps;
}
export class CloudFormation extends cdk.Construct {
    LambdaZipsBucket: string;
    constructor(parent: cdk.Construct, name: string, props: CloudFormationProps) {
        super(parent, name);
        const stack = new cloudformation.StackResource(this, 'NestedStack', {
            templateUrl: `https://${props.QSS3BucketName}.s3.amazonaws.com/${props.QSS3KeyPrefix}templates/copy-lambdas.template`,
            parameters: {
                BucketName: props.ArtifactBucket.bucketName,
                QSS3BucketName: props.QSS3BucketName,
                QSS3KeyPrefix: props.QSS3KeyPrefix,
            }
        });
        this.LambdaZipsBucket = stack.getAtt("Outputs.LambdaZipsBucket").toString();
    }
}