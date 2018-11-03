import cdk = require('@aws-cdk/cdk');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import s3 = require('@aws-cdk/aws-s3');
import { PolicyStatementEffect } from '@aws-cdk/aws-iam';
import iam = require('@aws-cdk/aws-iam');

export interface CodePipeLineProps {
    artifactBucketRef: s3.BucketRefProps
}
export class CodePipeline extends cdk.Construct {
    public readonly Pipeline: codepipeline.Pipeline;
    constructor(parent: cdk.Construct, name: string, props: CodePipeLineProps) {
        super(parent, name);
        this.Pipeline = new codepipeline.Pipeline(this, 'TaskCatCIPipeline', {
            pipelineName: 'TaskCatCIPipeline',
            artifactBucket: s3.Bucket.import(this, 'ArtifactBucket', {
                bucketArn: props.artifactBucketRef.bucketArn,
                bucketName: props.artifactBucketRef.bucketName
            })
        });
        this.Pipeline.addToRolePolicy(
            new iam.PolicyStatement(PolicyStatementEffect.Allow)
                .addActions("s3:GetObject", "s3:GetObjectVersion", "s3:GetBucketVersioning", "s3:PutObject")
                .addResource(`arn:aws:s3:::${props.artifactBucketRef.bucketArn}`)
                .addResource(`arn:aws:s3:::${props.artifactBucketRef.bucketArn}/*`)
        );
        this.Pipeline.addToRolePolicy(
            new iam.PolicyStatement(PolicyStatementEffect.Allow)
                .addActions("cloudformation:CreateStack", "cloudformation:DeleteStack", "cloudformation:DescribeStacks", "cloudformation:UpdateStack", "cloudformation:CreateChangeSet", "cloudformation:DeleteChangeSet", "cloudformation:DescribeChangeSet", "cloudformation:ExecuteChangeSet", "cloudformation:SetStackPolicy", "cloudformation:ValidateTemplate", "iam:PassRole")
                .addResource("*")
        )
        this.Pipeline.addToRolePolicy(
            new iam.PolicyStatement(PolicyStatementEffect.Allow)
                .addActions("codebuild:BatchGetBuilds", "codebuild:StartBuild")
                .addResource("*")
        )
        this.Pipeline.addToRolePolicy(
            new iam.PolicyStatement(PolicyStatementEffect.Allow)
                .addActions("lambda:GetPolicy", "lambda:ListEventSourceMappings", "lambda:ListFunctions", "lambda:InvokeFunction", "lambda:GetEventSourceMapping", "lambda:GetFunction", "lambda:ListAliases", "lambda:GetAlias", "lambda:ListTags", "lambda:ListVersionsByFunction", "lambda:GetAccountSettings", "lambda:GetFunctionConfiguration")
                .addResource("*")
        )
    }
}