# AWS CDK implementation of the "CI/CD Pipeline for AWS CloudFormation templates on AWS" Quickstart
*Please Note: This is a personal project, created as part of my study of the [AWS CDK](https://awslabs.github.io/aws-cdk/)).  This project should not to be considered an official AWS quickstart.*

**Source Quickstart:** https://aws.amazon.com/quickstart/architecture/cicd-taskcat/

The CI/CD environment created by this script includes AWS TaskCat for testing, AWS CodePipeline for continuous integration, and AWS CodeBuild as your build service.

![TaskCat logo](https://raw.githubusercontent.com/aws-quickstart/taskcat/master/assets/docs/images/logo.png)

TaskCat is an open-source tool that tests AWS CloudFormation templates. It creates stacks in multiple AWS Regions simultaneously and generates a report with a pass/fail grade for each region. You can specify the regions, indicate the number of Availability Zones you want to include in the test, and pass in the AWS CloudFormation parameter values you want to test. You can use the CI/CD pipeline to test any AWS CloudFormation templates, including nested templates, from a GitHub repository.

## How to use

1. Configure your AWS CLI and CDK environment as per instructions ([AWS CLI - Installation](https://docs.aws.amazon.com/cli/latest/userguide/installing.html) | [AWS CDK - Getting Started](https://awslabs.github.io/aws-cdk/getting-started.html))
2. Obtain a GitHub OAuth 2 token from your GitHub account with the scopes admin:repo_hook and repo.
3. Run `npm run build` to compile the scripts
4. Run `cdk deploy -c githubuser=<github user name> -c authtoken=<github oauth token> -c githubreponame=<name of github repo to monitor>` to deploy the stack


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy -c githubuser=<github user name> -c authtoken=<github oauth token> -c githubreponame=<name of github repo to monitor>`   Deploys the template
