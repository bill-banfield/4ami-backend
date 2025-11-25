# Quick HTTPS Fix for Frontend Connection

## Your Current Situation

- **Frontend Domain:** `https://project4ami.com`
- **Backend ALB URL:** `ami-backend-alb-1784045037.us-east-1.elb.amazonaws.com`
- **Target API URL:** `https://api.project4ami.com/api/v1`

Your frontend needs: `NEXT_PUBLIC_API_BASE_URL=https://api.project4ami.com/api/v1`

## Problem

The ALB currently only has an HTTP listener, not HTTPS. You need to enable HTTPS.

## Solution Options

### Option 1: Use HTTP for Now (Quick Fix - NOT RECOMMENDED FOR PRODUCTION)

**In Amplify Console:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://ami-backend-alb-1784045037.us-east-1.elb.amazonaws.com/api/v1
```

**Pros:** Works immediately  
**Cons:** Not secure, browsers will block mixed content if your frontend uses HTTPS

---

### Option 2: Enable HTTPS with Self-Signed Certificate on ALB (Quick but Insecure)

**Not practical** - AWS ALB doesn't support self-signed certificates easily.

---

### Option 3: Enable HTTPS with ACM Certificate (RECOMMENDED)

#### If You DON'T Have a Custom Domain

You're limited to HTTP only, as ACM certificates require a domain name. Consider:
1. Register a cheap domain (~$12/year)
2. Use AWS Route 53 or your existing DNS provider
3. Follow the full HTTPS setup guide

#### If You HAVE a Custom Domain

**Steps:**

1. **Edit `terraform.tfvars`:** (Already done!)
   ```hcl
   enable_https = true
   domain_name = "api.project4ami.com"
   frontend_url = "https://project4ami.com"
   ```

2. **Apply Terraform:**
   ```bash
   cd aws-deployment/terraform
   terraform apply
   ```

3. **Get validation records:**
   ```bash
   terraform output certificate_validation_records
   ```

4. **Add DNS records to your domain:**
   - Add the CNAME record from step 3 to your DNS provider
   - Wait 5-30 minutes for validation

5. **Point domain to ALB:**
   - Add CNAME record: `api.project4ami.com` → `ami-backend-alb-1784045037.us-east-1.elb.amazonaws.com`

6. **Update Amplify:**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://api.project4ami.com/api/v1
   ```

---

## What I've Already Done

✅ Added HTTPS listener configuration to Terraform  
✅ Added ACM certificate resource  
✅ Configured HTTP to HTTPS redirect  
✅ Added variables for easy configuration  
✅ Created comprehensive setup guide  

## What You Need to Do

Choose one of the options above:

- **Quick testing:** Use HTTP (Option 1)
- **Production ready:** Get a domain and enable HTTPS (Option 3)

---

## Files Changed

1. `aws-deployment/terraform/variables.tf` - Added `enable_https` and `domain_name` variables
2. `aws-deployment/terraform/main.tf` - Added ACM certificate and HTTPS listener
3. `aws-deployment/terraform/outputs.tf` - Added certificate validation outputs
4. `aws-deployment/terraform/terraform.tfvars.example` - Updated example config
5. `aws-deployment/HTTPS_SETUP_GUIDE.md` - Complete HTTPS setup guide (NEW)

---

## Next Steps

1. Decide if you want to use HTTP (temporary) or HTTPS (production)
2. If HTTPS: Ensure you have a domain name
3. Update `terraform.tfvars` accordingly
4. Run `terraform apply`
5. Configure DNS if using custom domain
6. Update Amplify environment variable
7. Deploy and test

---

## Need Help?

See `HTTPS_SETUP_GUIDE.md` for detailed instructions and troubleshooting.
