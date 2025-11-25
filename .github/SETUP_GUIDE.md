# 🚀 Complete CI/CD Setup Guide

This guide will help you set up the CI/CD pipeline for the 4AMI backend deployment to AWS.

## 🔑 Step 1: Set Up AWS Credentials

### Create AWS IAM User

1. **Go to AWS Console** → IAM → Users → Create User
2. **User Name**: `4ami-cicd-user`
3. **Access Type**: Programmatic access
4. **Attach Policies**: Create a custom policy with the following JSON:

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
                "acm:*",
                "s3:*"
            ],
            "Resource": "*"
        }
    ]
}
```

5. **Create Access Key**: Download the credentials (you'll need them for GitHub secrets)

### Add GitHub Secrets

1. **Go to your repository**: `https://github.com/bill-banfield/4ami-backend`
2. **Click Settings** → **Secrets and variables** → **Actions**
3. **Add these secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key ID | From the IAM user you created |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Access Key | From the IAM user you created |
| `SNYK_TOKEN` | (Optional) Your Snyk token | For security scanning |

## 🏗️ Step 2: Deploy Infrastructure

### Option A: Using GitHub Actions (Recommended)

1. **Go to Actions tab** in your repository
2. **Click on "Deploy AWS Infrastructure with Terraform"**
3. **Click "Run workflow"**
4. **Select "apply"** from the dropdown
5. **Click "Run workflow"**

### Option B: Using Local Terraform

```bash
# Navigate to terraform directory
cd aws-deployment/terraform

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

## 🧪 Step 3: Test the Setup

### Run Tests Manually

1. **Go to Actions tab**
2. **Click on "Test Suite"**
3. **Click "Run workflow"**
4. **Select "main" branch**
5. **Click "Run workflow"**

### Deploy Backend

1. **Make a small change** to trigger deployment
2. **Push to main branch**
3. **Watch the deployment** in Actions tab

## 🔧 Step 4: Configure Environment Variables

### Required Terraform Variables

Create `aws-deployment/terraform/terraform.tfvars`:

```hcl
# AWS Configuration
aws_region = "us-east-1"
project_name = "4ami"

# Database Configuration
db_password = "your-secure-database-password"
db_instance_class = "db.t3.micro"

# JWT Secret
jwt_secret = "your-super-secret-jwt-key-here"

# Email Configuration
mail_user = "your-email@gmail.com"
mail_pass = "your-app-password"
mail_from = "noreply@4ami.com"

# Frontend URL
frontend_url = "https://your-frontend-domain.com"
```

## 📊 Step 5: Monitor Deployment

### Check Workflow Status

1. **Actions Tab**: Monitor all workflow runs
2. **AWS Console**: Check ECS, RDS, and ALB status
3. **CloudWatch Logs**: View application logs

### Test Endpoints

Once deployed, test these endpoints:

- **Health Check**: `https://your-alb-dns-name.us-east-1.elb.amazonaws.com/api/v1/health`
- **API Docs**: `https://your-alb-dns-name.us-east-1.elb.amazonaws.com/api/v1/docs`

## 🚨 Troubleshooting

### Common Issues

#### 1. AWS Credentials Error
```
Error: Credentials could not be loaded
```
**Solution**: Verify AWS secrets are correctly set in GitHub repository settings.

#### 2. ESLint Configuration Error
```
ESLint couldn't find a configuration file
```
**Solution**: ✅ Fixed - ESLint config files have been added.

#### 3. Docker Build Error
```
ERROR: failed to build: resolve: lstat aws-deployment: no such file or directory
```
**Solution**: ✅ Fixed - Updated Docker build paths to use root Dockerfile.

#### 4. Terraform Apply Error
```
Error: No such file or directory
```
**Solution**: Ensure terraform.tfvars file exists with required variables.

### Debug Steps

1. **Check GitHub Secrets**: Verify all required secrets are set
2. **Review Workflow Logs**: Look for specific error messages
3. **AWS Console**: Check if resources are being created
4. **CloudWatch Logs**: Check application logs for errors

## 🎯 Expected Results

After successful setup:

- ✅ **Infrastructure**: VPC, RDS, ECS, ALB created
- ✅ **Backend**: Deployed and running on AWS
- ✅ **CI/CD**: Automatic deployment on code changes
- ✅ **Testing**: Comprehensive test suite running
- ✅ **Monitoring**: Logs and metrics available

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review GitHub Actions logs**
3. **Check AWS CloudWatch logs**
4. **Contact the development team**

## 🔄 Next Steps

1. **Update Frontend**: Point frontend to new backend URL
2. **Configure Domain**: Set up custom domain (optional)
3. **Monitor Performance**: Set up alerts and monitoring
4. **Scale Resources**: Adjust ECS and RDS resources as needed

---

**Note**: This setup creates production-ready infrastructure. For development, you may want to use smaller instance sizes to reduce costs.
