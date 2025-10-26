# GitHub Secrets Setup for CI/CD

This document explains how to set up the required GitHub secrets for the CI/CD pipeline to work properly.

## Required Secrets

### AWS Credentials
These secrets are required for AWS deployment and infrastructure management:

1. **AWS_ACCESS_KEY_ID**
   - Description: AWS Access Key ID for programmatic access
   - How to get: AWS Console → IAM → Users → Your User → Security Credentials → Access Keys
   - Required permissions: ECS, ECR, RDS, VPC, IAM, CloudWatch, ELB

2. **AWS_SECRET_ACCESS_KEY**
   - Description: AWS Secret Access Key (corresponds to the Access Key ID)
   - How to get: Generated when creating the Access Key ID
   - Keep this secret secure and never commit it to code

### Optional Secrets

3. **SNYK_TOKEN** (Optional)
   - Description: Snyk API token for security scanning
   - How to get: Sign up at [snyk.io](https://snyk.io) and get your API token
   - Used for: Advanced security vulnerability scanning

## How to Add Secrets

1. Go to your GitHub repository: `https://github.com/bill-banfield/4ami-backend`
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name and value

## AWS IAM Policy

Create an IAM user with the following policy for the CI/CD pipeline:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:*",
                "ecs:*",
                "iam:PassRole",
                "iam:GetRole",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PutRolePolicy",
                "iam:ListAttachedRolePolicies",
                "iam:ListRolePolicies",
                "logs:*",
                "elasticloadbalancing:*",
                "ec2:*",
                "rds:*",
                "cloudformation:*",
                "route53:*",
                "acm:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## Workflow Triggers

### Automatic Triggers
- **Push to main**: Deploys to AWS automatically
- **Pull Request**: Runs tests and builds Docker image
- **Tags (v*)**: Creates release and deploys

### Manual Triggers
- **Terraform Deploy**: Manually deploy/destroy infrastructure
- **Workflow Dispatch**: Run any workflow manually

## Environment Variables

The following environment variables are set in the workflows:

- `AWS_REGION`: us-east-1
- `ECR_REPOSITORY`: 4ami-repo
- `ECS_SERVICE`: 4ami-service
- `ECS_CLUSTER`: 4ami-cluster
- `ECS_TASK_DEFINITION`: 4ami-task
- `CONTAINER_NAME`: 4ami-container

## Testing the Setup

1. Add the required secrets to your repository
2. Make a small change to the code
3. Push to the `main` branch
4. Check the **Actions** tab to see the workflow running
5. Verify the deployment in AWS Console

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**
   - Verify the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct
   - Check that the IAM user has the required permissions
   - Ensure the AWS region is correct

2. **ECR Login Failed**
   - Verify the ECR repository exists
   - Check that the AWS credentials have ECR permissions
   - Ensure the repository name matches the workflow configuration

3. **ECS Deployment Failed**
   - Check that the ECS cluster and service exist
   - Verify the task definition is valid
   - Check CloudWatch logs for detailed error messages

4. **Terraform Apply Failed**
   - Verify all required variables are set in terraform.tfvars
   - Check that the AWS credentials have the required permissions
   - Review the Terraform plan output for issues

### Getting Help

- Check the GitHub Actions logs for detailed error messages
- Review AWS CloudWatch logs for application-specific issues
- Check the Terraform state for infrastructure issues
- Contact the development team for assistance

## Security Best Practices

1. **Rotate Secrets Regularly**: Change AWS credentials periodically
2. **Least Privilege**: Only grant the minimum required permissions
3. **Monitor Usage**: Check AWS CloudTrail for unusual activity
4. **Secure Storage**: Never commit secrets to code
5. **Access Control**: Limit who can modify repository secrets
