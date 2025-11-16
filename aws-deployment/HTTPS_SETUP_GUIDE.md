# HTTPS Setup Guide for 4AMI Backend

This guide explains how to enable HTTPS for your backend API using AWS Certificate Manager (ACM) and Application Load Balancer (ALB).

## Overview

The backend now supports two modes:
1. **HTTP Only** (Default): Uses the ALB DNS name with HTTP
2. **HTTPS with Custom Domain**: Uses a custom domain with SSL/TLS certificate

## Quick Start: Using HTTPS with the ALB DNS Name (No Custom Domain)

If you don't have a custom domain, you can still use HTTPS with the ALB's AWS-provided DNS name, but **you need to accept the self-signed certificate warning** in your browser or configure your frontend to trust it.

### Option 1: HTTP Only (Current Setup)

**No changes needed.** Your API URL will be:
```
http://ami-backend-alb-1784045037.us-east-1.elb.amazonaws.com/api/v1
```

**Pros:** Works immediately, no setup required  
**Cons:** Not secure for production, browsers will warn about mixed content

### Option 2: HTTPS with Custom Domain (Recommended for Production)

Follow the steps below to set up a custom domain with a valid SSL certificate.

---

## Setting Up HTTPS with a Custom Domain

### Prerequisites

- A registered domain name (e.g., `yourdomain.com`)
- Access to your domain's DNS settings (Route 53, Cloudflare, GoDaddy, etc.)
- AWS account with permissions to create ACM certificates

### Step 1: Update Your Terraform Variables

Edit your `terraform.tfvars` file:

```hcl
# Enable HTTPS
enable_https = true
domain_name = "api.yourdomain.com"  # Your custom domain/subdomain
```

### Step 2: Apply Terraform Changes

```bash
cd aws-deployment/terraform
terraform plan
terraform apply
```

Terraform will create an ACM certificate but it will be in **"Pending Validation"** state.

### Step 3: Get Certificate Validation Records

After applying, Terraform will output the DNS records you need to add:

```bash
terraform output certificate_validation_records
```

You'll see output like:
```json
[
  {
    "name": "_abc123.api.yourdomain.com",
    "type": "CNAME",
    "value": "_xyz456.acm-validations.aws."
  }
]
```

### Step 4: Add DNS Validation Records

Add the CNAME record to your DNS provider:

#### If using AWS Route 53:
```bash
# Terraform can automatically validate if you use Route 53
# Add this to main.tf:
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = "YOUR_ROUTE53_ZONE_ID"
}
```

#### If using Other DNS Providers (Cloudflare, GoDaddy, etc.):
1. Log in to your DNS provider
2. Go to DNS settings for your domain
3. Add a new CNAME record with the name and value from Step 3
4. Save the DNS changes

### Step 5: Wait for Certificate Validation

DNS propagation can take 5-30 minutes. AWS will automatically validate the certificate once the DNS records are detected.

Check validation status:
```bash
aws acm describe-certificate --certificate-arn $(terraform output -raw certificate_arn)
```

Look for `"Status": "ISSUED"`

### Step 6: Point Your Domain to the ALB

Add an A record (alias) or CNAME record pointing your domain to the ALB:

**Get your ALB DNS name:**
```bash
terraform output alb_dns_name
```

**Add DNS Record:**

- **Type:** CNAME (or A record if using Route 53 alias)
- **Name:** `api.yourdomain.com`
- **Value:** `ami-backend-alb-xxxxxxxx.us-east-1.elb.amazonaws.com`
- **TTL:** 300 (5 minutes)

#### Route 53 Example:
```hcl
resource "aws_route53_record" "api" {
  zone_id = "YOUR_ROUTE53_ZONE_ID"
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
```

### Step 7: Update Frontend Environment Variable

In your Amplify Console, update the environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### Step 8: Test Your Setup

```bash
# Test HTTPS endpoint
curl https://api.yourdomain.com/api/v1/health

# Verify certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

---

## Troubleshooting

### Certificate Stuck in "Pending Validation"

**Problem:** Certificate not validating after adding DNS records.

**Solutions:**
1. Verify DNS records are correct: `dig _abc123.api.yourdomain.com CNAME`
2. Wait 30 minutes for DNS propagation
3. Check if you added the record to the correct domain/zone
4. Ensure there are no conflicting DNS records

### HTTP Not Redirecting to HTTPS

**Problem:** HTTP URLs still work instead of redirecting.

**Solution:** Check that `enable_https = true` in your `terraform.tfvars` and re-apply:
```bash
terraform apply
```

### Browser Shows "Not Secure" Warning

**Problem:** Certificate is invalid or not trusted.

**Solutions:**
1. Ensure certificate status is "ISSUED" in ACM
2. Verify domain name matches exactly (including subdomain)
3. Check certificate is attached to HTTPS listener
4. Clear browser cache and try incognito mode

### ALB Returns 503 Service Unavailable

**Problem:** Backend tasks are not healthy.

**Solutions:**
1. Check ECS task logs in CloudWatch
2. Verify health check path: `/api/v1/health`
3. Ensure environment variables are set correctly
4. Check security groups allow traffic from ALB to ECS tasks

---

## Architecture Diagram

```
Browser/Frontend
      ↓ HTTPS (443)
      ↓
Application Load Balancer
  ├─ HTTPS Listener (443) ──→ ACM Certificate
  └─ HTTP Listener (80) ───→ Redirect to HTTPS
      ↓
Target Group (HTTP 3000)
      ↓
ECS Fargate Tasks
      ↓
RDS PostgreSQL
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Enable HTTP to HTTPS redirect** (automatic when `enable_https = true`)
3. **Use strong TLS policy:** `ELBSecurityPolicy-TLS13-1-2-2021-06` (configured by default)
4. **Regularly rotate SSL certificates** (ACM handles this automatically)
5. **Monitor certificate expiration** (ACM sends notifications)

---

## Cost Considerations

- **ACM Certificates:** FREE for AWS-managed certificates
- **ALB HTTPS Listener:** No additional cost beyond standard ALB pricing
- **Route 53 DNS:** ~$0.50/month per hosted zone (if used)

---

## Disabling HTTPS (Reverting to HTTP)

If you need to disable HTTPS:

1. Edit `terraform.tfvars`:
   ```hcl
   enable_https = false
   ```

2. Apply changes:
   ```bash
   terraform apply
   ```

3. Update frontend environment variable:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://ami-backend-alb-xxxxx.us-east-1.elb.amazonaws.com/api/v1
   ```

---

## Additional Resources

- [AWS ACM Documentation](https://docs.aws.amazon.com/acm/)
- [ALB HTTPS Listeners](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html)
- [DNS Validation for ACM](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)

---

## Support

If you encounter issues not covered in this guide:
1. Check CloudWatch logs: `/ecs/ami-backend`
2. Review ALB access logs
3. Verify security group rules
4. Check ECS task health in AWS Console
