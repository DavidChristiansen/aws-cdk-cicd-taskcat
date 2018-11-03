
import cdk = require('@aws-cdk/cdk');
import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');
import { PolicyStatementEffect } from '@aws-cdk/aws-iam';

export interface RolesProps {
    artifactBucketRef: s3.BucketRefProps;
}

export class Roles extends cdk.Construct {
    CodeBuildServiceRole: iam.Role;
    GitMergeRole: iam.Role;
    constructor(parent: cdk.Construct, name: string, props: RolesProps) {
        super(parent, name);
        this.GitMergeRole = new iam.Role(this, 'GitMergeRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            path: '/',
        });
        this.GitMergeRole.addToPolicy(new iam.PolicyStatement(PolicyStatementEffect.Allow)
            .addActions("logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents")
            .addResource(`arn:aws:logs:${new cdk.AwsRegion()}:${new cdk.AwsAccountId()}:log-group:/aws/lambda/*`)
        );
        this.GitMergeRole.addToPolicy(new iam.PolicyStatement(PolicyStatementEffect.Allow)
            .addActions("codepipeline:GetPipeline", "codepipeline:GetPipelineExecution", "codepipeline:GetPipelineState", "codepipeline:ListPipelines", "codepipeline:ListPipelineExecutions")
            .addResource(`arn:aws:codepipeline:${new cdk.AwsRegion()}:${new cdk.AwsAccountId()}:*`)
        );
        this.GitMergeRole.addToPolicy(new iam.PolicyStatement(PolicyStatementEffect.Allow)
            .addActions("codepipeline:GetJobDetails", "codepipeline:PutJobSuccessResult", "codepipeline:PutJobFailureResult")
            .addResource("*"));
        this.GitMergeRole.addToPolicy(new iam.PolicyStatement(PolicyStatementEffect.Allow)
            .addActions("s3:GetObject")
            .addResource("*"));
        this.GitMergeRole.addToPolicy(new iam.PolicyStatement(PolicyStatementEffect.Allow)
            .addActions("ssm:Describe*", "ssm:Get*", "ssm:List*")
            .addResource("*"));

        this.CodeBuildServiceRole = new iam.Role(this, 'CodeBuildServiceRole', {
            assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
            path: "/",
            managedPolicyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"]
        });
    }
}