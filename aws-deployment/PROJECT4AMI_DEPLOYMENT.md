# Project4AMI Backend Deployment Guide

## Your Configuration

- **Frontend Domain:** `https://project4ami.com`
- **Backend API Domain:** `https://api.project4ami.com`
- **Current ALB URL:** `ami-backend-alb-1784045037.us-east-1.elb.amazonaws.com`

---

## 🚀 Deployment Steps

### Step 1: Update Secrets in terraform.tfvars

Edit `aws-deployment/terraform/terraform.tfvars` and replace the TODO items:

```hcl
# TODO: Generate a secure database password
db_password = "your-secure-password-min-16-chars"

# TODO: Generate a secure JWT secret (at least 32 characters)
jwt_secret = "your-super-secret-jwt-key-at-least-32-characters-long"

# TODO: Add your email credentials
mail_user = "your-email@gmail.com"
mail_pass = "your-gmail-app-password"
```

**Generate secure secrets:**
```powershell
# Generate random password (PowerShell)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 2: Apply Terraform Configuration

```powershell
cd aws-deployment/terraform
terraform init
terraform plan
terraform apply
```

This will:
- Create/update your infrastructure
- Request an ACM SSL certificate for `api.project4ami.com`
- Configure HTTPS listener on ALB
- Set up HTTP to HTTPS redirect

### Step 3: Get Certificate Validation Records

After Terraform completes, get the DNS validation records:

```powershell
terraform output certificate_validation_records
```

You'll see something like:
```json
[
  {
    "name": "_abc123def456.api.project4ami.com",
    "type": "CNAME",
    "value": "_xyz789.acm-validations.aws."
  }
]
```

### Step 4: Add DNS Records to project4ami.com

You need to add **TWO** DNS records to your domain:

#### A. Certificate Validation Record (CNAME)
Go to your DNS provider (where you registered project4ami.com) and add:

- **Type:** CNAME
- **Name:** `_abc123def456.api.project4ami.com` (from Step 3)
- **Value:** `_xyz789.acm-validations.aws.` (from Step 3)
- **TTL:** 300

#### B. API Subdomain Record (CNAME)
Point your API subdomain to the ALB:

```powershell
# Get your ALB DNS name
terraform output alb_dns_name
```

Add this DNS record:
- **Type:** CNAME
- **Name:** `api.project4ami.com` (or just `api` depending on your DNS provider)
- **Value:** `ami-backend-alb-1784045037.us-east-1.elb.amazonaws.com`
- **TTL:** 300

#### Common DNS Providers:

**Cloudflare:**
1. Go to cloudflare.com → Select project4ami.com
2. Click "DNS" → "Records" → "Add record"
3. Add both CNAME records above
4. Turn off "Proxy" (orange cloud) for both records

**GoDaddy:**
1. Go to godaddy.com → My Products → DNS
2. Click "Add" → Select "CNAME"
3. Add both records above

**Namecheap:**
1. Go to namecheap.com → Domain List → Manage
2. Advanced DNS → Add New Record
3. Add both CNAME records

**AWS Route 53:**
```powershell
# If using Route 53, Terraform can automate this
# See HTTPS_SETUP_GUIDE.md for Route 53 automation
```

### Step 5: Wait for Certificate Validation

DNS propagation takes 5-30 minutes. Check validation status:

```powershell
aws acm describe-certificate --certificate-arn $(terraform output -raw certificate_arn) --region us-east-1
```

Look for: `"Status": "ISSUED"`

Or check in AWS Console:
- Go to AWS Certificate Manager
- Select us-east-1 region
- Look for `api.project4ami.com` certificate
- Wait until status shows "Issued"

### Step 6: Update Amplify Environment Variable

Once the certificate is validated and DNS is pointing to the ALB:

1. Go to AWS Amplify Console
2. Select your frontend app
3. Go to "Environment variables"
4. Update or add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.project4ami.com/api/v1
   ```
5. Save and redeploy your frontend

### Step 7: Test Your Setup

```powershell
# Test DNS resolution
nslookup api.project4ami.com

# Test HTTPS endpoint
curl https://api.project4ami.com/api/v1/health

# Test certificate
curl -v https://api.project4ami.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T...",
  "uptime": 12345
}
```

---

## 🔍 Verification Checklist

- [ ] `terraform.tfvars` updated with secure passwords
- [ ] `terraform apply` completed successfully
- [ ] Certificate validation CNAME record added to DNS
- [ ] API subdomain CNAME record added to DNS
- [ ] Certificate status is "ISSUED" in ACM
- [ ] `api.project4ami.com` resolves to ALB IP
- [ ] HTTPS endpoint responds: `https://api.project4ami.com/api/v1/health`
- [ ] Amplify environment variable updated
- [ ] Frontend successfully connects to backend

---

## 🎯 Final URLs

After setup, your URLs will be:

- **Frontend:** `https://project4ami.com`
- **Backend API:** `https://api.project4ami.com/api/v1`
- **API Health Check:** `https://api.project4ami.com/api/v1/health`
- **API Documentation:** `https://api.project4ami.com/api/v1/docs`

---

## ⚠️ Troubleshooting

### Certificate Stuck in "Pending Validation"

**Check DNS record:**
```powershell
nslookup -type=CNAME _abc123def456.api.project4ami.com
```

Should return the `_xyz789.acm-validations.aws.` value.

**Solutions:**
- Wait 30 minutes for DNS propagation
- Verify you added the record to the correct domain
- Make sure there are no typos in the CNAME record
- Check if your DNS provider requires @ or full domain

### api.project4ami.com Not Resolving

**Check DNS:**
```powershell
nslookup api.project4ami.com
```

**Solutions:**
- Verify CNAME record points to the correct ALB DNS name
- Wait for DNS propagation (up to 48 hours, usually 5-30 minutes)
- Clear DNS cache: `ipconfig /flushdns`
- Try a different DNS server: `nslookup api.project4ami.com 8.8.8.8`

### Backend Returns 503 Service Unavailable

**Check ECS tasks:**
```powershell
aws ecs list-tasks --cluster 4ami-cluster --region us-east-1
aws ecs describe-tasks --cluster 4ami-cluster --tasks TASK_ARN --region us-east-1
```

**Solutions:**
- Check CloudWatch logs: `/ecs/4ami`
- Verify database connection (RDS endpoint correct)
- Check environment variables in ECS task definition
- Ensure security groups allow traffic

### Mixed Content Warnings in Browser

**Problem:** Frontend is HTTPS but trying to load HTTP resources.

**Solution:** Ensure frontend uses HTTPS URL:
```
NEXT_PUBLIC_API_BASE_URL=https://api.project4ami.com/api/v1
```

---

## 💰 Cost Estimate

- **ACM Certificate:** FREE
- **ALB:** ~$16-20/month
- **ECS Fargate (1 task):** ~$15-20/month
- **RDS db.t3.micro:** ~$15/month
- **Data Transfer:** ~$5-10/month
- **Total:** ~$50-65/month

---

## 🔒 Security Notes

- Certificate auto-renews (AWS manages this)
- HTTP automatically redirects to HTTPS
- TLS 1.3 enabled for best security
- All traffic encrypted end-to-end

---

## 📚 Additional Resources

- Full HTTPS guide: `HTTPS_SETUP_GUIDE.md`
- Quick fix guide: `QUICK_HTTPS_FIX.md`
- Terraform docs: `aws-deployment/terraform/README.md`

---

## Need Help?

If something doesn't work:
1. Check CloudWatch logs: `/ecs/4ami`
2. Verify security groups in AWS Console
3. Check ECS task health status
4. Review ALB target group health checks
5. Confirm all environment variables are set correctly
