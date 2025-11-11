#!/bin/bash
# Script to import existing AWS resources into Terraform state

set -e

echo "Importing existing AWS resources into Terraform state..."

# Import DB Subnet Group
echo "Importing DB Subnet Group..."
terraform import aws_db_subnet_group.main ami-backend-db-subnet-group || echo "Failed to import DB subnet group (may not exist or already imported)"

# Import RDS Instance
echo "Importing RDS Instance..."
terraform import aws_db_instance.main ami-backend-postgres || echo "Failed to import RDS instance (may not exist or already imported)"

# Import ECR Repository
echo "Importing ECR Repository..."
terraform import aws_ecr_repository.main ami-backend-repo || echo "Failed to import ECR repository (may not exist or already imported)"

# Import CloudWatch Log Group
echo "Importing CloudWatch Log Group..."
terraform import aws_cloudwatch_log_group.ecs /ecs/ami-backend || echo "Failed to import log group (may not exist or already imported)"

# Import IAM Execution Role
echo "Importing IAM Execution Role..."
terraform import aws_iam_role.ecs_execution_role ami-backend-ecs-execution-role || echo "Failed to import execution role (may not exist or already imported)"

# Import IAM Task Role
echo "Importing IAM Task Role..."
terraform import aws_iam_role.ecs_task_role ami-backend-ecs-task-role || echo "Failed to import task role (may not exist or already imported)"

# Import Load Balancer
echo "Importing Application Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names ami-backend-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || echo "")
if [ -n "$ALB_ARN" ]; then
  terraform import aws_lb.main "$ALB_ARN" || echo "Failed to import ALB (may already be imported)"
else
  echo "ALB not found, skipping import"
fi

# Import Target Group
echo "Importing Target Group..."
TG_ARN=$(aws elbv2 describe-target-groups --names ami-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
if [ -n "$TG_ARN" ]; then
  terraform import aws_lb_target_group.main "$TG_ARN" || echo "Failed to import target group (may already be imported)"
else
  echo "Target group not found, skipping import"
fi

# Import ECS Cluster
echo "Importing ECS Cluster..."
terraform import aws_ecs_cluster.main ami-backend-cluster || echo "Failed to import ECS cluster (may not exist or already imported)"

# Import ECS Service
echo "Importing ECS Service..."
terraform import aws_ecs_service.main ami-backend-cluster/ami-backend-service || echo "Failed to import ECS service (may not exist or already imported)"

echo "✅ Resource import completed!"
echo "Run 'terraform plan' to verify state alignment"
