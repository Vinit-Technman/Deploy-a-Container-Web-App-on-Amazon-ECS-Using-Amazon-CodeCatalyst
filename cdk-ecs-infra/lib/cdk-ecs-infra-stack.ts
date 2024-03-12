import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkEcsInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // Look up the default VPC
    const vpc = ec2.Vpc.fromLookup(this, "VPC", {
       isDefault: true
    });

    const repository=new ecr.Repository(this,'My-Repo',{
      repositoryName:"my-repo"
    });

    const taskIamRole=new cdk.aws_iam.Role(this,"AppRole",{
      roleName:"AppRole",
      assumedBy:new cdk.aws_iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });

    taskIamRole.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );
    const taskDefinition=new ecs.FargateTaskDefinition(this,"Task",{
      taskRole:taskIamRole,
      family:"CdkEcsInfraStackTaskDef",
    });

    taskDefinition.addContainer('MyContainer',{
      image:ecs.ContainerImage.fromRegistry('nginx:latest'),
      portMappings:[{containerPort:80}],
      memoryReservationMiB:256,
      cpu:256
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this,"MyApp",{
      vpc:vpc,
      taskDefinition:taskDefinition,
      desiredCount:1,
      serviceName:"MyWebApp",
      assignPublicIp:true,
      publicLoadBalancer:true,
      healthCheckGracePeriod:cdk.Duration.seconds(5),
    });

    //  // Output the URL of the site
    //  new cdk.CfnOutput(this, "MyApp URL", {
    //   value: "http://" + ecs_app.loadBalancer.loadBalancerDnsName
    // });
    
    // // Output the ARN of the ECS Cluster
    // new cdk.CfnOutput(this, "ECS cluster ARN", {
    //   value: ecs_app.cluster.clusterArn
    // });

    // example resource
    // const queue = new sqs.Queue(this, 'CdkEcsInfraQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
