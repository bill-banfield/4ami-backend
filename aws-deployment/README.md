# 4AMI Backend AWS Deployment

This directory contains everything needed to deploy the 4AMI backend to AWS using Terraform.

## 📁 Directory Structure

```
aws-deployment/
├── terraform/              # Terraform infrastructure configuration
│   ├── main.tf            # Main infrastructure resources
│   ├── variables.tf       # Input variables
│   ├── outputs.tf         # Output values
│   ├── terraform.tfvars   # Your configuration (gitignored)
│   └── terraform.tfvars.example  # Example configuration
├── tests/                 # Deployment tests
├── PROJECT4AMI_DEPLOYMENT.md   # 👈 START HERE - Step-by-step guide
├── HTTPS_SETUP_GUIDE.md        # Detailed HTTPS configuration
└── QUICK_HTTPS_FIX.md          # Quick reference

```

## 🚀 Quick Start

### For Project4AMI (Your Setup)

**Follow the complete guide:** [`PROJECT4AMI_DEPLOYMENT.md`](./PROJECT4AMI_DEPLOYMENT.md)

This guide includes:
- Your specific domain configuration (`api.project4ami.com`)
- Step-by-step DNS setup instructions
- Certificate validation process
- Amplify environment variable configuration

### Configuration Summary

```hcl
Frontend:  https://project4ami.com
Backend:   https://api.project4ami.com/api/v1
```

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Terraform installed (>= 1.0)
- Domain: `project4ami.com` (you own this)
- Access to DNS settings for `project4ami.com`

## 🏗️ Infrastructure Components

- **ECS Fargate**: Runs the NestJS backend container
- **Application Load Balancer**: Handles HTTPS traffic and routing
- **RDS PostgreSQL**: Database (db.t3.micro)
- **ECR**: Container image registry
- **ACM**: SSL/TLS certificate for `api.project4ami.com`
- **CloudWatch**: Logs and monitoring
- **VPC**: Default VPC with public subnets

## 🔐 Security Features

- HTTPS enabled with ACM certificate
- HTTP automatically redirects to HTTPS
- TLS 1.3 support
- Encrypted RDS storage
- Security groups restrict access
- Secrets managed via environment variables

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **PROJECT4AMI_DEPLOYMENT.md** | Complete deployment guide for project4ami.com |
| **HTTPS_SETUP_GUIDE.md** | Detailed HTTPS configuration and troubleshooting |
| **QUICK_HTTPS_FIX.md** | Quick reference for HTTPS setup |
| **terraform/README.md** | Terraform-specific documentation |

## ⚡ Deployment Steps (TL;DR)

1. **Update secrets** in `terraform/terraform.tfvars`
2. **Apply Terraform**: `terraform apply`
3. **Add DNS records** for certificate validation and API subdomain
4. **Wait for certificate** validation (5-30 minutes)
5. **Update Amplify** with `NEXT_PUBLIC_API_BASE_URL=https://api.project4ami.com/api/v1`
6. **Test**: `curl https://api.project4ami.com/api/v1/health`

See [`PROJECT4AMI_DEPLOYMENT.md`](./PROJECT4AMI_DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

```powershell
# Test DNS resolution
nslookup api.project4ami.com

# Test HTTPS endpoint
curl https://api.project4ami.com/api/v1/health

# Run automated tests
cd tests
python test-backend-deployment.py
```

## 💰 Monthly Cost Estimate

| Service | Cost |
|---------|------|
| ALB | ~$16-20 |
| ECS Fargate (1 task) | ~$15-20 |
| RDS db.t3.micro | ~$15 |
| Data Transfer | ~$5-10 |
| ACM Certificate | FREE |
| **Total** | **~$50-65** |

## 🛠️ Common Commands

```powershell
# Navigate to terraform directory
cd aws-deployment/terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure changes
terraform apply

# View outputs
terraform output

# Get certificate validation records
terraform output certificate_validation_records

# Get API URL
terraform output api_url

# Destroy infrastructure (careful!)
terraform destroy
```

## 🔧 Environment Variables

The following need to be set in `terraform.tfvars`:

**Required:**
- `db_password` - Secure database password
- `jwt_secret` - Secure JWT secret key
- `mail_user` - Email for SMTP
- `mail_pass` - Email password/app password

**Configured for project4ami.com:**
- `frontend_url = "https://project4ami.com"`
- `enable_https = true`
- `domain_name = "api.project4ami.com"`

## 📊 Monitoring

**CloudWatch Logs:**
```powershell
aws logs tail /ecs/4ami --follow
```

**ECS Service Status:**
```powershell
aws ecs describe-services --cluster 4ami-cluster --services 4ami-service --region us-east-1
```

**ALB Health Checks:**
- Go to EC2 Console → Target Groups
- Check health status of targets

## 🆘 Troubleshooting

### Certificate Not Validating
- Verify DNS records added correctly
- Wait 30 minutes for DNS propagation
- Check: `nslookup -type=CNAME _validation-record.api.project4ami.com`

### Backend Returns 503
- Check CloudWatch logs: `/ecs/4ami`
- Verify ECS tasks are running
- Check target group health
- Confirm environment variables set

### Frontend Can't Connect
- Verify Amplify environment variable: `NEXT_PUBLIC_API_BASE_URL`
- Check CORS settings in backend
- Confirm DNS resolves: `nslookup api.project4ami.com`
- Test endpoint: `curl https://api.project4ami.com/api/v1/health`

See [`HTTPS_SETUP_GUIDE.md`](./HTTPS_SETUP_GUIDE.md) for more troubleshooting.

## 🔄 Updates and Redeployment

To redeploy the backend after code changes:

```powershell
# Build and push new image
docker build -t 4ami-backend .
docker tag 4ami-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/4ami-repo:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/4ami-repo:latest

# Force ECS to redeploy
aws ecs update-service --cluster 4ami-cluster --service 4ami-service --force-new-deployment --region us-east-1
```

## 📞 Support

For issues:
1. Check the troubleshooting section in this README
2. Review [`HTTPS_SETUP_GUIDE.md`](./HTTPS_SETUP_GUIDE.md)
3. Check CloudWatch logs
4. Verify AWS Console for service health
5. Review Terraform state: `terraform show`

## 🔗 Useful Links

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/)
- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Ready to deploy?** Start with [`PROJECT4AMI_DEPLOYMENT.md`](./PROJECT4AMI_DEPLOYMENT.md)! 🚀
