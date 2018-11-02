#!/usr/bin/env node
import sns = require('@aws-cdk/aws-sns');
import sqs = require('@aws-cdk/aws-sqs');
import cdk = require('@aws-cdk/cdk');

class TaskcatCiPipelineStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    const queue = new sqs.Queue(this, 'TaskcatCiPipelineQueue', {
      visibilityTimeoutSec: 300
    });

    const topic = new sns.Topic(this, 'TaskcatCiPipelineTopic');

    topic.subscribeQueue(queue);
  }
}

const app = new cdk.App();

new TaskcatCiPipelineStack(app, 'TaskcatCiPipelineStack');

app.run();
